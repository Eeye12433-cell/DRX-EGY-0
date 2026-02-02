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
    const { trackingNumber } = await req.json();
    
    // Validate input
    if (!trackingNumber || typeof trackingNumber !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'Tracking number is required',
        order: null 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean tracking number
    const cleanTrackingNumber = trackingNumber.trim().toUpperCase();
    
    // Validate format (basic validation)
    if (cleanTrackingNumber.length < 5 || cleanTrackingNumber.length > 50) {
      return new Response(JSON.stringify({ 
        error: 'Invalid tracking number format',
        order: null 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to query orders securely
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Lookup order by tracking number only - returns limited fields
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        tracking_number,
        status,
        shipping_method,
        shipping_full_name,
        total,
        created_at
      `)
      .eq('tracking_number', cleanTrackingNumber)
      .single();

    if (fetchError || !order) {
      return new Response(JSON.stringify({ 
        error: 'Order not found',
        order: null 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get order items
    const { data: items } = await supabase
      .from('order_items')
      .select('product_name, quantity, product_price')
      .eq('order_id', order.id);

    return new Response(JSON.stringify({ 
      order: {
        trackingNumber: order.tracking_number,
        status: order.status,
        shippingMethod: order.shipping_method,
        customerName: order.shipping_full_name,
        total: order.total,
        createdAt: order.created_at,
        items: items || []
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Track order error:", error);
    return new Response(JSON.stringify({ 
      error: 'Server error',
      order: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
