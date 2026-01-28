
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AINutritionResult, Product, CartItem } from "../types";

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_LOVABLE_API_KEY;
  if (!apiKey) {
    return { client: null, error: "Missing VITE_LOVABLE_API_KEY. Please set it to enable Gemini features." };
  }
  return { client: new GoogleGenAI({ apiKey }), error: null };
};

/**
 * Performance Analysis Logic (تحليل الأداء)
 * Uses gemini-3-pro-preview for high-accuracy biological reasoning and math.
 */
export const getNutritionAdvice = async (profile: UserProfile, lang: 'ar' | 'en' = 'en'): Promise<AINutritionResult> => {
  const { client, error } = getGeminiClient();
  if (!client) {
    return {
      tdee: 0,
      macros: { protein: 0, carbs: 0, fats: 0 },
      recommendations: [],
      hydration: "",
      explanation: error ?? "Gemini is unavailable."
    };
  }
  const prompt = `
    As a world-class sports nutritionist, perform a deep performance analysis (تحليل الأداء) for:
    Age: ${profile.age}, Gender: ${profile.gender}, Weight: ${profile.weight}kg, Height: ${profile.height}cm, 
    Activity: ${profile.activity}, Goal: ${profile.goal}.
    
    Calculate TDEE and daily macros (Protein, Carbs, Fats).
    Provide 3-4 specific supplement recommendations from the DRX EGYPT line (Whey, Creatine, Pre-workout, etc.).
    Provide a hydration strategy.
    
    IMPORTANT: The output language MUST be ${lang === 'ar' ? 'Arabic (العربية)' : 'English'}.
    Return the response in JSON format. Provide a detailed but concise explanation of the rationale in ${lang === 'ar' ? 'Arabic' : 'English'}.
  `;

  const response = await client.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tdee: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER }
            }
          },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          hydration: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["tdee", "macros", "recommendations", "hydration", "explanation"]
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text);
};

/**
 * AI Product Recommendations
 * Analyzes cart contents, view history, and purchase history to return IDs of products that synergize.
 */
export const getAIRecommendations = async (
  cart: CartItem[], 
  allProducts: Product[], 
  viewHistoryNames: string[], 
  purchaseHistoryNames: string[]
): Promise<string[]> => {
  const { client, error } = getGeminiClient();
  if (!client) {
    console.warn(error);
    return [];
  }
  const cartInfo = cart.length > 0 
    ? cart.map(item => `${item.product.name_en} (${item.product.category})`).join(', ')
    : "Empty Cart";
  
  const views = viewHistoryNames.length > 0 ? viewHistoryNames.join(', ') : "None";
  const purchases = purchaseHistoryNames.length > 0 ? purchaseHistoryNames.join(', ') : "None";
  
  const productList = allProducts.map(p => ({ id: p.id, name: p.name_en, cat: p.category, goals: p.goals }));

  const prompt = `
    Analyze the following user profile:
    - Current Cart: [${cartInfo}]
    - Recently Viewed: [${views}]
    - Previous Purchases: [${purchases}]

    From this available product catalog: ${JSON.stringify(productList)}.
    
    Task: Recommend 4 product IDs that would provide the best performance synergy or complete their stack based on their interests and needs. Avoid recommending things they already have in their cart.
    Return only a JSON array of 4 product IDs.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (err) {
    console.error("Recommendation Failure:", err);
    return [];
  }
};

/**
 * Synthesizes a new product image from scratch.
 */
export const generateProductImage = async (name: string, description: string, theme: string = 'dark industrial charcoal texture'): Promise<string> => {
  const { client, error } = getGeminiClient();
  if (!client) {
    throw new Error(error ?? "Gemini is unavailable.");
  }
  const prompt = `High-end professional product photography of a premium supplement container. 
  The product is named "${name}". 
  Technical specs: "${description}". 
  Aesthetic: Sleek packaging, minimalist design, chrome accents, DRX branding. 
  Background: ${theme}. 
  Quality: 8k resolution, hyper-realistic, cinematic lighting.`;
  
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("ASSET SYNTHESIS FAILURE");
};

/**
 * Edits an existing product image using text prompts.
 */
export const editProductImage = async (base64Image: string, editPrompt: string, theme?: string): Promise<string> => {
  const { client, error } = getGeminiClient();
  if (!client) {
    throw new Error(error ?? "Gemini is unavailable.");
  }
  const mimeType = base64Image.split(';')[0].split(':')[1];
  const data = base64Image.split(',')[1];

  const themeInstruction = theme ? ` Change the background environment to: ${theme}.` : '';

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data, mimeType } },
        { text: `Edit this supplement product image: ${editPrompt}.${themeInstruction} Maintain the DRX EGYPT industrial aesthetic. Keep the container visible but modify the requested attributes.` }
      ]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("IMAGE EDIT FAILURE");
};

/**
 * Maps Grounding for Order Tracking.
 */
export const getNearbyLogisticsHubs = async (lat: number, lng: number) => {
  const { client, error } = getGeminiClient();
  if (!client) {
    throw new Error(error ?? "Gemini is unavailable.");
  }
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Find official supplement distribution hubs, premium pharmacies, or logistics centers in Cairo and Alexandria, Egypt that would handle DRX supplements.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    }
  });

  const text = response.text;
  const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return { text, grounding };
};
