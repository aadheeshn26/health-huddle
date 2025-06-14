
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
    const { userId, doctorEmail, timeRange, reportId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update report status to processing
    await supabase
      .from('reports')
      .update({ status: 'processing' })
      .eq('id', reportId)

    // Fetch symptoms data for the time range
    const { data: symptoms, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Analyze data with APIs
    const claudeSummary = await summarizeWithClaude(symptoms)
    const visionData = await extractImageData(symptoms)
    const reportContent = await generateReportWithGPT(claudeSummary, visionData, timeRange)

    // Generate PDF (simplified - in production, use a proper PDF library)
    const pdfUrl = await generatePDF(reportContent, symptoms, visionData)

    // Send email to doctor
    await sendEmailToDoctor(doctorEmail, pdfUrl, timeRange)

    // Update report with completion
    await supabase
      .from('reports')
      .update({ 
        status: 'completed',
        report_url: pdfUrl
      })
      .eq('id', reportId)

    return new Response(JSON.stringify({ 
      success: true, 
      reportUrl: pdfUrl,
      reportId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error generating report:', error)
    
    // Update report status to failed
    const { reportId } = await req.json().catch(() => ({}))
    if (reportId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      await supabase
        .from('reports')
        .update({ status: 'failed' })
        .eq('id', reportId)
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function summarizeWithClaude(symptoms: any[]) {
  const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!claudeApiKey) return 'Claude API not configured'

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
        content: `Summarize this patient's health data for a medical professional. Focus on symptoms, patterns, and notable changes: ${textData}`
      }]
    })
  })

  const result = await response.json()
  return result.content?.[0]?.text || 'No summary available'
}

async function extractImageData(symptoms: any[]) {
  // Similar to analyze-trends function
  const visionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
  if (!visionApiKey) return { data: 'Vision API not configured' }

  const imageSymptoms = symptoms.filter(s => s.image_url)
  const extractedData = []

  for (const symptom of imageSymptoms.slice(0, 15)) {
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
      
      extractedData.push({
        date: symptom.created_at,
        extractedText: text,
        imageUrl: symptom.image_url
      })
    } catch (error) {
      console.error('Vision API error:', error)
    }
  }

  return { data: extractedData }
}

async function generateReportWithGPT(claudeSummary: string, visionData: any, timeRange: number) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) return 'OpenAI API not configured'

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
        content: `Generate a professional medical report for a ${timeRange}-day period:
        
        Patient Summary: ${claudeSummary}
        Image Data: ${JSON.stringify(visionData)}
        
        Format as a structured medical report with sections for:
        - Executive Summary
        - Symptom Analysis
        - Extracted Metrics
        - Recommendations
        - Trends and Patterns`
      }],
      max_tokens: 1500
    })
  })

  const result = await response.json()
  return result.choices?.[0]?.message?.content || 'Report content not available'
}

async function generatePDF(content: string, symptoms: any[], visionData: any) {
  // In a real implementation, you'd use a PDF generation service
  // For now, return a placeholder URL
  const reportId = crypto.randomUUID()
  return `https://example.com/reports/${reportId}.pdf`
}

async function sendEmailToDoctor(doctorEmail: string, pdfUrl: string, timeRange: number) {
  // In a real implementation, you'd use an email service like SendGrid or AWS SES
  console.log(`Sending report to ${doctorEmail}: ${pdfUrl} (${timeRange} days)`)
  return true
}
