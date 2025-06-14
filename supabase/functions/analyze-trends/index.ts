
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, period = 30 } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch symptoms data for the period
    const { data: symptoms, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Analyze with Claude API
    const claudePatterns = await analyzeWithClaude(symptoms)
    
    // Analyze images with Google Vision API
    const visionInsights = await analyzeWithVision(symptoms)
    
    // Generate summary with GPT-4
    const gptSummary = await generateSummaryWithGPT(claudePatterns, visionInsights)
    
    // Extract key metrics for charting
    const keyMetrics = extractKeyMetrics(symptoms, visionInsights)

    // Save analysis to database
    const { data: analysis, error: saveError } = await supabase
      .from('trends_analysis')
      .upsert({
        user_id: userId,
        analysis_period: period,
        claude_patterns: claudePatterns,
        vision_insights: visionInsights,
        gpt_summary: gptSummary,
        key_metrics: keyMetrics,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) throw saveError

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error analyzing trends:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function analyzeWithClaude(symptoms: any[]) {
  const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!claudeApiKey) throw new Error('Claude API key not configured')

  const textData = symptoms
    .filter(s => s.text || s.voice_transcript)
    .map(s => `${s.created_at}: ${s.text || s.voice_transcript}`)
    .join('\n')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analyze this health data and identify patterns. Focus on frequency of symptoms, triggers, and trends. Data: ${textData}`
      }]
    })
  })

  const result = await response.json()
  return result.content?.[0]?.text || 'No patterns identified'
}

async function analyzeWithVision(symptoms: any[]) {
  const visionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
  if (!visionApiKey) return { insights: 'Vision API not configured' }

  const imageSymptoms = symptoms.filter(s => s.image_url)
  const insights = []

  for (const symptom of imageSymptoms.slice(0, 10)) { // Limit to 10 images
    try {
      const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: symptom.image_url } },
            features: [{ type: 'TEXT_DETECTION', maxResults: 10 }]
          }]
        })
      })

      const result = await response.json()
      const text = result.responses?.[0]?.textAnnotations?.[0]?.description || ''
      
      insights.push({
        date: symptom.created_at,
        extractedText: text,
        metrics: extractMetricsFromText(text)
      })
    } catch (error) {
      console.error('Vision API error:', error)
    }
  }

  return { insights }
}

async function generateSummaryWithGPT(claudePatterns: string, visionInsights: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) throw new Error('OpenAI API key not configured')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Create a professional health summary and recommendations based on this analysis:
        
        Patterns: ${claudePatterns}
        Image Data: ${JSON.stringify(visionInsights)}
        
        Format as a narrative summary with actionable health tips.`
      }],
      max_tokens: 500
    })
  })

  const result = await response.json()
  return result.choices?.[0]?.message?.content || 'Summary not available'
}

function extractKeyMetrics(symptoms: any[], visionInsights: any) {
  const metrics: any = {
    symptomCounts: {},
    dailyEntries: {},
    glucoseReadings: []
  }

  symptoms.forEach(symptom => {
    const date = symptom.created_at.split('T')[0]
    metrics.dailyEntries[date] = (metrics.dailyEntries[date] || 0) + 1
  })

  // Extract glucose readings from vision insights
  visionInsights.insights?.forEach((insight: any) => {
    if (insight.metrics?.glucose) {
      metrics.glucoseReadings.push({
        date: insight.date.split('T')[0],
        value: insight.metrics.glucose
      })
    }
  })

  return metrics
}

function extractMetricsFromText(text: string) {
  const metrics: any = {}
  
  // Extract glucose readings
  const glucoseMatch = text.match(/(\d{2,3})\s*mg\/dl|glucose[\s:]*(\d{2,3})/i)
  if (glucoseMatch) {
    metrics.glucose = parseInt(glucoseMatch[1] || glucoseMatch[2])
  }

  // Extract blood pressure
  const bpMatch = text.match(/(\d{2,3})\/(\d{2,3})/g)
  if (bpMatch) {
    const [systolic, diastolic] = bpMatch[0].split('/').map(Number)
    metrics.bloodPressure = { systolic, diastolic }
  }

  return metrics
}
