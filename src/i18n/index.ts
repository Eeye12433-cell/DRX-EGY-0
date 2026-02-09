import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'All Products': 'All Products',
      'Protein': 'Protein',
      'Performance': 'Performance',
      'Pre-Workout': 'Pre-Workout',
      'Recovery': 'Recovery',
      'Health & Wellness': 'Health & Wellness',
      'shop.title': 'Shop',
      'shop.showing': 'Showing',
      'shop.of': 'of',
      'shop.products': 'products',
      'shop.searchPlaceholder': 'Search products...',
      'shop.noProducts': 'No products found.',
      'productCard.outOfStock': 'Out of Stock',
      'productCard.locateSalesRep': 'Locate Sales Rep',
      'productCard.distributorNote': 'Available through authorized distributors',
      'product.addToCart': 'Add to Cart',
      'product.backToShop': 'Back to Shop',
      'verification.button.label': 'Verify Product',
      'verification.title': 'Verify Product Authenticity',
      'verification.placeholder': 'Enter verification code',
      'verification.submit': 'Verify',
      'verification.close': 'Close',
      'calculator.recommendations.title': 'Recommended For You',
      'calculator.recommendations.subtitle': 'Based on your profile and goals',
      'calculator.recommendations.viewProduct': 'View Product',
    },
  },
  ar: {
    translation: {
      'All Products': 'جميع المنتجات',
      'Protein': 'بروتين',
      'Performance': 'أداء',
      'Pre-Workout': 'قبل التمرين',
      'Recovery': 'استشفاء',
      'Health & Wellness': 'صحة وعافية',
      'shop.title': 'المتجر',
      'shop.showing': 'عرض',
      'shop.of': 'من',
      'shop.products': 'منتج',
      'shop.searchPlaceholder': 'ابحث عن منتج...',
      'shop.noProducts': 'لا توجد منتجات.',
      'productCard.outOfStock': 'نفد المخزون',
      'productCard.locateSalesRep': 'موقع الموزع',
      'productCard.distributorNote': 'متوفر عبر الموزعين المعتمدين',
      'product.addToCart': 'أضف للسلة',
      'product.backToShop': 'العودة للمتجر',
      'verification.button.label': 'تحقق من المنتج',
      'verification.title': 'تحقق من أصالة المنتج',
      'verification.placeholder': 'أدخل رمز التحقق',
      'verification.submit': 'تحقق',
      'verification.close': 'إغلاق',
      'calculator.recommendations.title': 'موصى لك',
      'calculator.recommendations.subtitle': 'بناءً على ملفك الشخصي وأهدافك',
      'calculator.recommendations.viewProduct': 'عرض المنتج',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
