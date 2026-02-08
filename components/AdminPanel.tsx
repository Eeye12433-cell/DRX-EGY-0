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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Read body safely
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    // ✅ Accept token from:
    // 1) Authorization header: Bearer <token>
    // 2) payload.token (fallback)
    const hdr =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      "";

    const bodyToken = typeof payload?.token === "string" ? payload.token : "";

    const token =
      hdr.toLowerCase().startsWith("bearer ")
        ? hdr.slice(7).trim()
        : bodyToken.trim();

    if (!token) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = `Bearer ${token}`;

    // ✅ Auth-bound client
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userRes, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userRes.user.id;

    // ✅ Service role client
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ Admin check
    const { data: roleData } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, orderId, status } = payload;

    if (action === "list") {
      const { data: orders, error } = await supabaseService
        .from("orders")
        .select(
          `
          id,
          tracking_number,
          total,
          status,
          created_at,
          shipping_full_name,
          shipping_phone,
          shipping_email,
          shipping_address,
          shipping_method,
          order_items (
            product_id,
            product_name,
            product_price,
            quantity
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ orders: orders || [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_status") {
      if (!orderId || !status) {
        return new Response(JSON.stringify({ error: "orderId and status are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseService
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
