export enum Category {
  Protein = "Protein",
  Performance = "Performance",
  PreWorkout = "Pre-Workout",
  Recovery = "Recovery",
  Wellness = "Health & Wellness"
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;

  /**
   * Existing image field (usually base64/data url from AI or stored value)
   */
  image: string;

  /**
   * ✅ NEW: Optional external image URL (CDN/Direct link).
   * If set, UI can prefer this over `image`.
   */
  imageUrl?: string;

  category: Category;
  inStock: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  featured: number;
  goals: string[];
  sizes?: string[];
  flavors?: string[];
  rating?: number;
  reviews?: number; // count
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activity: string;
  goal: string;
}

export interface VerificationCode {
  id: string;
  used: boolean;
  usedAt?: string;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  method: string;
  notes?: string;
}

export enum OrderStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Shipped = "Shipped",
  Delivered = "Delivered"
}

export interface AINutritionResult {
  tdee: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  recommendations: string[];
  hydration: string;
  explanation: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  items: Array<{
    product: Product;
    quantity: number;
  }>;
  total: number;
  shippingInfo: ShippingInfo;
  status: OrderStatus;
  createdAt: string;
}

export interface StripeConfig {
  publicKey: string;
  secretKey: string;
  enabled: boolean;
}
