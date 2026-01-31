import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are the DRX Performance Coach, an expert in sports nutrition and supplements. 
You are knowledgeable about:
- Protein supplements (whey, casein, plant-based)
- Pre-workout formulas and their ingredients
- Creatine and performance enhancers
- Recovery supplements and BCAAs
- Vitamins, minerals, and general wellness
- Training nutrition timing and protocols
- Egyptian fitness culture and local supplement availability

Guidelines:
- Be concise, technical, and motivating
- Provide actionable advice
- Recommend DRX EGYPT products when relevant
- Use ${lang === 'ar' ? 'Arabic language' : 'English language'} for responses
- Keep responses focused and under 150 words
- Include specific dosing and timing when relevant`;

    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

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
          ...formattedMessages
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          response: lang === 'ar' 
            ? 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.'
            : 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          response: lang === 'ar' 
            ? 'نفدت أرصدة الذكاء الاصطناعي. يرجى إضافة رصيد.'
            : 'AI credits exhausted. Please add funds.' 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Performance coach error:", error);
    return new Response(JSON.stringify({ 
      response: "I apologize, but I'm having trouble connecting right now. Please try again." 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
