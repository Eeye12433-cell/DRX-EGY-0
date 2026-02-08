import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  'https://drx-egy1.lovable.app',
  'https://id-preview--112c979b-b84d-4d24-bb83-104736208893.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/.*\.lovable\.app$/.test(origin)) return true;
  if (/^https:\/\/.*\.lovableproject\.com$/.test(origin)) return true;
  return false;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

const RATE_LIMIT_WINDOW_SECONDS = 60;
const MAX_ATTEMPTS_PER_WINDOW = 5;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting by IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Clean up old attempts periodically
    try { await supabase.rpc('cleanup_old_verify_attempts'); } catch { /* ignore */ }

    // Count recent attempts
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
    const { count } = await supabase
      .from('verify_code_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('attempted_at', windowStart);

    if ((count ?? 0) >= MAX_ATTEMPTS_PER_WINDOW) {
      return new Response(JSON.stringify({ 
        valid: false, 
        reason: 'rate_limit_exceeded' 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record this attempt
    await supabase.from('verify_code_attempts').insert({ ip_address: clientIp });

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
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
