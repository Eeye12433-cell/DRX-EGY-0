import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 1) Validate auth header
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    const token = authHeader.slice("bearer ".length).trim();
    if (!token) {
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    // 2) Create clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return jsonResponse({ error: "Server misconfigured: missing env vars" }, 500);
    }

    // Client used ONLY to validate the user token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Service role for privileged DB operations (bypasses RLS)
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // 3) Verify token (robust)
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError || !userData?.user?.id) {
      return jsonResponse({ error: "Invalid or expired token" }, 401);
    }

    const userId = userData.user.id;

    // 4) Check admin role
    const { data: roleData, error: roleError } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role check error:", roleError);
      return jsonResponse({ error: "Server error" }, 500);
    }

    if (!roleData) {
      return jsonResponse({ error: "Admin access required" }, 403);
    }

    // 5) Parse body safely
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const action = body?.action;

    // ✅ Optional: allow UI to "ping" admin verification quickly
    if (action === "ping") {
      return jsonResponse({ ok: true, is_admin: true });
    }

    // 6) Actions
    if (action === "list") {
      const { data: orders, error } = await supabaseService
        .from("orders")
        .select(
          `
          *,
          order_items (*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Orders list error:", error);
        return jsonResponse({ error: "Server error" }, 500);
      }

      return jsonResponse({ orders: orders || [] }, 200);
    }

    if (action === "update_status") {
      const orderId = body?.orderId;
      const status = body?.status;

      if (!orderId || !status) {
        return jsonResponse({ error: "orderId and status are required" }, 400);
      }

      const { error } = await supabaseService
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) {
        console.error("Update status error:", error);
        return jsonResponse({ error: "Server error" }, 500);
      }

      return jsonResponse({ success: true }, 200);
    }

    return jsonResponse({ error: "Invalid action" }, 400);
  } catch (error) {
    console.error("Admin orders error:", error);
    return jsonResponse({ error: "Server error" }, 500);
  }
});
