import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    
    // Validate input
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ 
        valid: false, 
        reason: 'invalid_input' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean and format code
    let cleanCode = code.trim().toUpperCase();
    if (!cleanCode.startsWith('DRX-EGY-')) {
      const digits = cleanCode.match(/\d+/);
      if (digits) {
        cleanCode = `DRX-EGY-${digits[0].padStart(3, '0')}`;
      }
    }

    // Validate format
    const codePattern = /^DRX-EGY-\d{3}$/;
    if (!codePattern.test(cleanCode)) {
      return new Response(JSON.stringify({ 
        valid: false, 
        reason: 'invalid_format' 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to access verification_codes table
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if code exists
    const { data: codeData, error: fetchError } = await supabase
      .from('verification_codes')
      .select('id, used, used_at')
      .eq('id', cleanCode)
      .single();

    if (fetchError || !codeData) {
      return new Response(JSON.stringify({ 
        valid: false, 
        reason: 'not_found' 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (codeData.used) {
      return new Response(JSON.stringify({ 
        valid: false, 
        reason: 'already_used',
        usedAt: codeData.used_at
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark code as used
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ 
        used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', cleanCode);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ 
        valid: false, 
        reason: 'update_failed' 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      valid: true,
      code: cleanCode
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(JSON.stringify({ 
      valid: false, 
      reason: 'server_error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
