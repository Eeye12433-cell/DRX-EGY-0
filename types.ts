
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
  image: string;
  category: Category;
  inStock: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  featured: number;
  goals: string[];
  reviews?: Review[];
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

export enum OrderStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled"
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  method: 'delivery' | 'pickup';
  address?: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  items: CartItem[];
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

export interface VerificationCode {
  id: string;
  used: boolean;
  usedAt?: string;
}
