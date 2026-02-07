import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  // يفضّل لاحقًا تقييده على دومينك
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  return xff.split(",")[0].trim();
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // backward compatibility: trackingNumber or trackingToken
    const rawToken = body.trackingToken ?? body.trackingNumber;

    if (!rawToken || typeof rawToken !== "string") {
      return new Response(
        JSON.stringify({ error: "Tracking token is required", order: null }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const trackingToken = rawToken.trim();

    // basic hard validation (reduce brute force surface)
    if (trackingToken.length < 20 || trackingToken.length > 120) {
      return new Response(
        JSON.stringify({ error: "Invalid tracking token", order: null }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ----------------------------
    // Anti-enumeration / rate limit
    // ----------------------------
    const ip = getClientIp(req);

    const { count: attempts } = await supabase
      .from("guest_order_lookup_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip", ip)
      .gte(
        "attempted_at",
        new Date(Date.now() - 10 * 60 * 1000).toISOString()
      );

    if ((attempts ?? 0) > 30) {
      return new Response(
        JSON.stringify({ error: "Too many attempts", order: null }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tokenHash = await sha256Hex(trackingToken);
    const tokenFingerprint = tokenHash.slice(0, 12);

    // log lookup attempt (even if it fails)
    await supabase.from("guest_order_lookup_attempts").insert({
      ip,
      token_fingerprint: tokenFingerprint,
    });

    // ----------------------------
    // Secure lookup (GUEST ONLY)
    // ----------------------------
    const { data: order } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        shipping_method,
        created_at
      `
      )
      .is("user_id", null)
      .eq("guest_tracking_token_hash", tokenHash)
      .maybeSingle();

    // same response whether token invalid or not found
    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found", order: null }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ----------------------------
    // Tracking-safe response ONLY
    // ----------------------------
    return new Response(
      JSON.stringify({
        order: {
          status: order.status,
          shippingMethod: order.shipping_method,
          createdAt: order.created_at,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Track order error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", order: null }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
