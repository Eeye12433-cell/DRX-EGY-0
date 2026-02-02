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
    // Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the token
    const { data: claims, error: authError } = await supabase.auth.getUser(token);
    if (authError || !claims?.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { profile, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a world-class sports nutritionist. Perform a deep performance analysis (تحليل الأداء).
Calculate TDEE and daily macros (Protein, Carbs, Fats).
Provide 3-4 specific supplement recommendations from the DRX EGYPT line (Whey, Creatine, Pre-workout, etc.).
Provide a hydration strategy.
The output language MUST be ${lang === 'ar' ? 'Arabic (العربية)' : 'English'}.`;

    const userPrompt = `Analyze this athlete profile:
Age: ${profile.age}, Gender: ${profile.gender}, Weight: ${profile.weight}kg, Height: ${profile.height}cm, 
Activity: ${profile.activity}, Goal: ${profile.goal}.

Return JSON with this exact structure:
{
  "tdee": number,
  "macros": { "protein": number, "carbs": number, "fats": number },
  "recommendations": ["string", "string", "string", "string"],
  "hydration": "string",
  "explanation": "string"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_nutrition_result",
              description: "Return the calculated nutrition analysis",
              parameters: {
                type: "object",
                properties: {
                  tdee: { type: "number", description: "Total Daily Energy Expenditure in kcal" },
                  macros: {
                    type: "object",
                    properties: {
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fats: { type: "number" }
                    },
                    required: ["protein", "carbs", "fats"]
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 supplement recommendations"
                  },
                  hydration: { type: "string", description: "Hydration strategy" },
                  explanation: { type: "string", description: "Scientific rationale" }
                },
                required: ["tdee", "macros", "recommendations", "hydration", "explanation"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_nutrition_result" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unexpected response format");
  } catch (error) {
    console.error("Nutrition advice error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
