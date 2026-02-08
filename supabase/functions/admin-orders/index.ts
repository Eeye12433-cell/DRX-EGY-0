import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // ✅ Always handle preflight properly (this fixes “Failed to send request” in many cases)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ Only allow POST
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    // 1) Validate auth header
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.slice("bearer ".length).trim();
    if (!token) return json({ error: "Authentication required" }, 401);

    // 2) Read env
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return json({ error: "Server misconfigured: missing env vars" }, 500);
    }

    // 3) Auth client (validates user token)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // ✅ Robust token verification
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return json({ error: "Invalid or expired token" }, 401);
    }
    const userId = userData.user.id;

    // 4) Service client (privileged DB ops)
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // 5) Admin role check
    const { data: roleData, error: roleError } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role check error:", roleError);
      return json({ error: "Server error" }, 500);
    }
    if (!roleData) {
      return json({ error: "Admin access required" }, 403);
    }

    // 6) Parse body
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const action = body?.action;

    // ✅ Lightweight verification endpoint (recommended for AdminPanel gating)
    if (action === "ping") {
      return json({ ok: true, is_admin: true }, 200);
    }

    if (action === "list") {
      const { data: orders, error } = await supabaseService
        .from("orders")
        .select(`*, order_items (*)`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Orders list error:", error);
        return json({ error: "Server error" }, 500);
      }

      return json({ orders: orders || [] }, 200);
    }

    if (action === "update_status") {
      const orderId = body?.orderId;
      const status = body?.status;

      if (!orderId || !status) {
        return json({ error: "orderId and status are required" }, 400);
      }

      const { error } = await supabaseService
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) {
        console.error("Update status error:", error);
        return json({ error: "Server error" }, 500);
      }

      return json({ success: true }, 200);
    }

    return json({ error: "Invalid action" }, 400);
  } catch (err) {
    console.error("Admin orders error:", err);
    return json({ error: "Server error" }, 500);
  }
});
