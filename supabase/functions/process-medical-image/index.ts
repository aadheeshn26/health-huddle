
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, mimeType } = await req.json()
    
    if (!image) {
      throw new Error('No image data provided')
    }

    console.log('Processing medical image with Google Vision API');

    const visionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    if (!visionApiKey) {
      throw new Error('Google Vision API key not configured')
    }

    // Prepare the request for Google Vision API
    const visionRequest = {
      requests: [
        {
          image: {
            content: image
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 50
            },
            {
              type: "DOCUMENT_TEXT_DETECTION",
              maxResults: 50
            }
          ],
          imageContext: {
            languageHints: ["en"]
          }
        }
      ]
    }

    // Call Google Vision API
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visionRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Vision API error:', errorText)
      throw new Error(`Google Vision API error: ${response.status} - ${errorText}`)
    }

    const visionResult = await response.json()
    console.log('Vision API response received');

    // Extract text from the response
    let extractedText = ''
    
    if (visionResult.responses && visionResult.responses[0]) {
      const annotations = visionResult.responses[0]
      
      // Try document text detection first (better for structured documents)
      if (annotations.fullTextAnnotation && annotations.fullTextAnnotation.text) {
        extractedText = annotations.fullTextAnnotation.text
      }
      // Fallback to regular text detection
      else if (annotations.textAnnotations && annotations.textAnnotations.length > 0) {
        extractedText = annotations.textAnnotations[0].description || ''
      }
    }

    console.log('Extracted text length:', extractedText.length);

    return new Response(
      JSON.stringify({ 
        extractedText,
        success: true,
        message: extractedText ? 'Text successfully extracted from image' : 'No text found in image'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-medical-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
