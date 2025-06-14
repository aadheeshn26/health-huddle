
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, messageId } = await req.json();
    
    // Simple content moderation rules
    const inappropriatePatterns = [
      /\b(hate|kill|die|suicide)\b/i,
      /\b(stupid|idiot|moron)\b/i,
      /\b(spam|scam|fake)\b/i,
    ];

    let isInappropriate = false;
    let flaggedReason = '';

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(message)) {
        isInappropriate = true;
        flaggedReason = 'Contains inappropriate language';
        break;
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (isInappropriate) {
      // Flag the message
      const { error } = await supabase
        .from('chat_messages')
        .update({
          is_flagged: true,
          flagged_reason: flaggedReason,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error flagging message:', error);
      }

      return new Response(
        JSON.stringify({ 
          flagged: true, 
          reason: flaggedReason 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ flagged: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in moderate-message function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
