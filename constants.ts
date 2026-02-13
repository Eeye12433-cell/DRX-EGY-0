
import { Product, Category } from './types';

export const INITIAL_PRODUCTS: Product[] = [];

export const CATEGORIES = [
  'All Products',
  'Protein',
  'Performance',
  'Pre-Workout',
  'Recovery',
  'Health & Wellness',
];

export const GOALS = [
  { id: 'bulking', label_ar: 'ضخامة عضلية', label_en: 'Bulking', emoji: '💪' },
  { id: 'cutting', label_ar: 'تنشيف', label_en: 'Cutting', emoji: '🔥' },
  { id: 'endurance', label_ar: 'تحمل', label_en: 'Endurance', emoji: '⚡' },
  { id: 'recovery', label_ar: 'استشفاء', label_en: 'Recovery', emoji: '🧘' }
];

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label_ar: 'خامل (مكتب)', label_en: 'Sedentary' },
  { id: 'light', label_ar: 'نشاط خفيف (1-3 أيام)', label_en: 'Lightly Active' },
  { id: 'moderate', label_ar: 'نشاط متوسط (3-5 أيام)', label_en: 'Moderately Active' },
  { id: 'heavy', label_ar: 'نشاط عالي (6-7 أيام)', label_en: 'Very Active' },
  { id: 'extreme', label_ar: 'نشاط رياضي محترف', label_en: 'Extreme Athlete' }
];
