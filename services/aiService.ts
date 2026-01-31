import { UserProfile, AINutritionResult, Product, CartItem } from "../types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Performance Analysis Logic (تحليل الأداء)
 * Uses Lovable AI gateway via edge function
 */
export const getNutritionAdvice = async (profile: UserProfile, lang: 'ar' | 'en' = 'en'): Promise<AINutritionResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('nutrition-advice', {
      body: { profile, lang }
    });

    if (error) {
      console.error("Nutrition advice error:", error);
      return {
        tdee: 0,
        macros: { protein: 0, carbs: 0, fats: 0 },
        recommendations: [],
        hydration: "",
        explanation: error.message || "AI analysis unavailable"
      };
    }

    if (data.error) {
      return {
        tdee: 0,
        macros: { protein: 0, carbs: 0, fats: 0 },
        recommendations: [],
        hydration: "",
        explanation: data.error
      };
    }

    return data;
  } catch (err) {
    console.error("Nutrition advice error:", err);
    return {
      tdee: 0,
      macros: { protein: 0, carbs: 0, fats: 0 },
      recommendations: [],
      hydration: "",
      explanation: "Connection to AI failed"
    };
  }
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
  try {
    const cartInfo = cart.length > 0 
      ? cart.map(item => `${item.product.name_en} (${item.product.category})`).join(', ')
      : "Empty Cart";
    
    const viewHistory = viewHistoryNames.length > 0 ? viewHistoryNames.join(', ') : "None";
    const purchaseHistory = purchaseHistoryNames.length > 0 ? purchaseHistoryNames.join(', ') : "None";
    const productList = allProducts.map(p => ({ id: p.id, name: p.name_en, cat: p.category, goals: p.goals }));

    const { data, error } = await supabase.functions.invoke('ai-recommendations', {
      body: { cartInfo, viewHistory, purchaseHistory, productList }
    });

    if (error) {
      console.error("Recommendations error:", error);
      return [];
    }

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Recommendations error:", err);
    return [];
  }
};

/**
 * Synthesizes a new product image from scratch.
 */
export const generateProductImage = async (name: string, description: string, theme: string = 'dark industrial charcoal texture'): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: { name, description, theme }
  });

  if (error) {
    throw new Error(error.message || "Image synthesis failed");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.imageUrl) {
    throw new Error("No image generated");
  }

  return data.imageUrl;
};

/**
 * Edits an existing product image using text prompts.
 */
export const editProductImage = async (existingImage: string, editPrompt: string, theme?: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: { existingImage, editPrompt, theme: theme || 'dark industrial charcoal texture' }
  });

  if (error) {
    throw new Error(error.message || "Image edit failed");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.imageUrl) {
    throw new Error("No image generated");
  }

  return data.imageUrl;
};
