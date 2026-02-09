import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { Product, Order } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './views/Home';
import Shop from './views/Shop';
import CalculatorView from './views/CalculatorView';
import VerifyView from './views/VerifyView';
import AdminPanel from './components/AdminPanel';
import CartPanel from './components/CartPanel';
import Footer from './components/Footer';
import CheckoutModal from './components/CheckoutModal';
import TrackOrderView from './views/TrackOrderView';
import ProductDetailView from './views/ProductDetailView';
import PerformanceCoach from './components/PerformanceCoach';
import ComparisonBar from './components/ComparisonBar';
import ComparisonMatrix from './components/ComparisonMatrix';
import { useProducts } from '@/hooks/useProducts';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CartProvider } from '@/hooks/useCart';

import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const ContactView: React.FC<{ lang: 'ar' | 'en' }> = ({ lang }) => (
  <div className="max-w-6xl mx-auto py-20 px-4">
    <div className="text-center mb-16">
      <h2 className="text-6xl font-black font-oswald uppercase tracking-tighter mb-4">
        {lang === 'ar' ? 'تواصل' : 'Contact'}
      </h2>
      <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">
        {lang === 'ar' ? 'ابق على تواصل معنا' : 'Get in touch with us'}
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Form Container */}
      <div className="bg-bg-card border border-white/5 p-8 md:p-12 h-full flex flex-col justify-between">
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-mega block">
              {lang === 'ar' ? 'الاسم بالكامل' : 'Full name'}
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full bg-bg-primary border-b border-white/10 p-4 font-mono text-sm outline-none focus:border-drxred transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-mega block">
              {lang === 'ar' ? 'عنوان البريد الإلكتروني' : 'Email address'}
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className="w-full bg-bg-primary border-b border-white/10 p-4 font-mono text-sm outline-none focus:border-drxred transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-mega block">
              {lang === 'ar' ? 'الرسالة' : 'Message'}
            </label>
            <textarea
              rows={4}
              placeholder={lang === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
              className="w-full bg-bg-primary border-b border-white/10 p-4 font-mono text-sm outline-none focus:border-drxred transition-all resize-none"
            ></textarea>
          </div>
        </div>
        <button className="w-full bg-[#f97316] text-white py-5 mt-12 font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all rounded shadow-lg">
          {lang === 'ar' ? 'إرسال الرسالة' : 'Send message'}
        </button>
      </div>

      {/* Info Cards Container */}
      <div className="flex flex-col gap-6">
        {/* Email Card */}
        <div className="bg-bg-card border border-white/5 p-8 rounded flex items-center gap-6 group hover:border-drxred/30 transition-all">
          <div className="p-4 bg-zinc-900 rounded-lg group-hover:bg-drxred/10 transition-all">
            <Mail className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-mega block mb-1">
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </h4>
            <a href="mailto:support@drxegypt.com" className="text-zinc-200 font-bold hover:text-drxred transition-colors">
              support@drxegypt.com
            </a>
          </div>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-bg-card border border-white/5 p-8 rounded flex items-center gap-6 group hover:border-drxred/30 transition-all">
          <div className="p-4 bg-zinc-900 rounded-lg group-hover:bg-drxred/10 transition-all">
            <Phone className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-mega block mb-1">
              {lang === 'ar' ? 'دعم الواتساب' : 'WhatsApp Support'}
            </h4>
            <a href="https://wa.me/201080011665" target="_blank" rel="noopener noreferrer" className="block text-zinc-200 font-bold hover:text-drxred transition-colors">
              +20 108 001 1665
            </a>
            <span className="text-[9px] text-green-500 uppercase tracking-widest font-bold">
              {lang === 'ar' ? 'انقر للدردشة معنا!' : 'Click to chat with us!'}
            </span>
          </div>
        </div>

        {/* Headquarters Card */}
        <div className="bg-bg-card border border-white/5 p-8 rounded flex items-center gap-6 group hover:border-drxred/30 transition-all">
          <div className="p-4 bg-zinc-900 rounded-lg group-hover:bg-drxred/10 transition-all">
            <MapPin className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-mega block mb-1">
              {lang === 'ar' ? 'المقر الرئيسي' : 'Headquarters'}
            </h4>
            <p className="text-zinc-200 font-bold">
              {lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}
            </p>
          </div>
        </div>

        {/* Response Time Card */}
        <div className="bg-bg-card border border-white/5 p-8 rounded-lg flex flex-col justify-center bg-zinc-900/50">
          <h4 className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-mega block mb-3">
            {lang === 'ar' ? 'وقت الرد' : 'Response Time'}
          </h4>
          <p className="text-xs text-zinc-400 font-mono italic leading-relaxed">
            {lang === 'ar'
              ? 'نرد عادةً على جميع الاستفسارات خلال 24-48 ساعة عمل.'
              : 'We typically respond to all inquiries within 24-48 business hours.'}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const PolicyView: React.FC<{ lang: 'ar' | 'en'; type: string }> = ({ lang, type }) => {
  const titles: Record<string, { ar: string; en: string }> = {
    shipping: { ar: 'سياسة الشحن', en: 'Shipping Policy' },
    refund: { ar: 'سياسة الاسترجاع', en: 'Refund Policy' },
    privacy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    terms: { ar: 'شروط الخدمة', en: 'Terms of Service' },
  };
  const title = titles[type] || { ar: 'سياسة', en: 'Policy' };

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 prose prose-invert">
      <h2 className="text-5xl font-oswald uppercase mb-12 text-drxred">{lang === 'ar' ? title.ar : title.en}</h2>
      <div className="space-y-8 text-zinc-400 font-inter">
        <p className="text-lg leading-relaxed">
          {lang === 'ar' ? 'نحن في DRX EGYPT نلتزم بأعلى معايير الجودة والشفافية مع عملائنا.' : 'At DRX EGYPT, we are committed to the highest standards of quality and transparency with our customers.'}
        </p>
        <section>
          <h3 className="text-text-main uppercase font-oswald text-xl mb-4">01. {lang === 'ar' ? 'الالتزام بالجودة' : 'Quality Commitment'}</h3>
          <p>{lang === 'ar' ? 'جميع منتجاتنا تخضع للفحص والتحقق من الأصالة.' : 'All our products undergo inspection and authenticity verification.'}</p>
        </section>
        <section>
          <h3 className="text-text-main uppercase font-oswald text-xl mb-4">02. {lang === 'ar' ? 'التوزيع الرسمي' : 'Official Distribution'}</h3>
          <p>{lang === 'ar' ? "Nature's Rule Egypt هي الموزع الرسمي الوحيد في مصر." : "Nature's Rule Egypt is the only official distributor in Egypt."}</p>
        </section>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { products, setProducts, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const { i18n } = useTranslation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const navigate = useNavigate();
  const location = useLocation();

  // Sync lang with i18n
  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('drx-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);
    const savedLang = localStorage.getItem('drx-lang');
    if (savedLang === 'ar' || savedLang === 'en') setLang(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem('drx-theme', theme);
    localStorage.setItem('drx-lang', lang);
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [theme, lang]);

  useEffect(() => {
    gsap.fromTo('.page-content', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  }, [location.pathname]);

  const handleOrderComplete = (newOrder: Order) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    navigate(`/track?id=${newOrder.trackingNumber}`);
  };

  const toggleCompare = (product: Product) => {
    setCompareList((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : prev.length < 4 ? [...prev, product] : prev
    );
  };

  return (
    <CurrencyProvider>
      <CartProvider>
        <div className="min-h-screen font-inter overflow-x-hidden selection:bg-drxred selection:text-white bg-bg-primary text-text-main">
          <Navbar
            onMenuClick={() => setIsSidebarOpen(true)}
            onCartClick={() => setIsCartOpen(true)}
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            onAdminClick={() => navigate('/admin')}
          />

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} lang={lang} onNavigate={(path) => { navigate(path); setIsSidebarOpen(false); }} />

          <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} lang={lang} onCheckout={() => setIsCheckoutOpen(true)} />

          <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} lang={lang} onOrderComplete={handleOrderComplete} />

          <PerformanceCoach isOpen={isCoachOpen} onClose={() => setIsCoachOpen(false)} lang={lang} />

          <ComparisonBar items={compareList} onRemove={(id) => setCompareList((prev) => prev.filter((p) => p.id !== id))} onCompare={() => setIsMatrixOpen(true)} lang={lang} />
          {isMatrixOpen && <ComparisonMatrix products={compareList} onClose={() => setIsMatrixOpen(false)} lang={lang} />}

          <button onClick={() => setIsCoachOpen(true)} className="fixed bottom-8 right-8 z-[350] w-16 h-16 bg-drxred text-white rounded-full shadow-[0_0_30px_#e11d48] flex items-center justify-center hover:scale-110 transition-transform animate-bounce">
            <span className="text-2xl">🤖</span>
          </button>

          <main className="pt-24 min-h-[calc(100vh-100px)]">
            <div className="page-content container mx-auto px-4 md:px-8">
              <Routes>
                <Route path="/" element={<Home lang={lang} />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:mode" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetailView />} />
                <Route path="/calculator" element={<CalculatorView lang={lang} />} />
                <Route path="/verify" element={<VerifyView lang={lang} />} />
                <Route path="/track" element={<TrackOrderView lang={lang} />} />
                <Route path="/contact" element={<ContactView lang={lang} />} />
                <Route path="/admin" element={<AdminPanel lang={lang} products={products} setProducts={setProducts} refetchProducts={refetchProducts} />} />
                <Route path="/policies/:type" element={<PolicyView lang={lang} type={location.pathname.split('/').pop() || ''} />} />
              </Routes>
            </div>
          </main>

          <Footer lang={lang} />
        </div>
      </CartProvider>
    </CurrencyProvider>
  );
};

export default App;
