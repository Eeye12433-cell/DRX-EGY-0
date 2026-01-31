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
    const { name, description, theme, editPrompt, existingImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt: string;
    
    if (existingImage && editPrompt) {
      // Edit existing image
      prompt = `Edit this supplement product image: ${editPrompt}. Change the background environment to: ${theme}. Maintain the DRX EGYPT industrial aesthetic. Keep the container visible but modify the requested attributes.`;
    } else {
      // Generate new image
      prompt = `High-end professional product photography of a premium supplement container. 
The product is named "${name}". 
Technical specs: "${description}". 
Aesthetic: Sleek packaging, minimalist design, chrome accents, DRX branding. 
Background: ${theme}. 
Quality: 8k resolution, hyper-realistic, cinematic lighting.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          { 
            role: "user", 
            content: existingImage 
              ? [
                  { type: "image_url", image_url: { url: existingImage } },
                  { type: "text", text: prompt }
                ]
              : prompt
          }
        ],
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
      console.error("Image generation error:", response.status, errorText);
      throw new Error("Image generation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Check if content contains base64 image data
    if (typeof content === 'string' && content.startsWith('data:image')) {
      return new Response(JSON.stringify({ imageUrl: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle array format response
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          return new Response(JSON.stringify({ imageUrl: part.image_url.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Image generation failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
