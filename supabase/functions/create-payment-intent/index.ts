import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno";

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
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
}

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { amount, currency = "EGP" } = await req.json();

        if (!amount || amount <= 0) {
            throw new Error("Invalid amount");
        }

        const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
        if (!STRIPE_SECRET_KEY) {
            throw new Error("Stripe secret key not configured");
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Create PaymentIntent
        // 100 * amount because Stripe uses smallest currency unit (cents/piastres)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return new Response(
            JSON.stringify({ clientSecret: paymentIntent.client_secret }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Payment error:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown payment error"
            }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
