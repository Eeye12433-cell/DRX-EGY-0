import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { Product, CartItem, Order, OrderStatus } from './types';
import { INITIAL_PRODUCTS } from './constants';
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

const ContactView: React.FC<{ lang: 'ar' | 'en' }> = ({ lang }) => (
  <div className="max-w-2xl mx-auto py-20 px-4">
    <h2 className="text-5xl font-oswald uppercase mb-8 text-center">
      {lang === 'ar' ? 'تواصل' : 'Contact'}{' '}
      <span className="text-drxred">{lang === 'ar' ? 'معنا' : 'Us'}</span>
    </h2>
    <div className="bg-bg-card border border-white/5 p-10 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          placeholder={lang === 'ar' ? 'الاسم' : 'Name'}
          className="bg-bg-primary border border-white/10 p-4 font-mono text-xs focus:border-drxred outline-none"
        />
        <input
          type="email"
          placeholder={lang === 'ar' ? 'الايميل' : 'Email'}
          className="bg-bg-primary border border-white/10 p-4 font-mono text-xs focus:border-drxred outline-none"
        />
      </div>
      <textarea
        rows={5}
        placeholder={lang === 'ar' ? 'رسالتك' : 'Message'}
        className="w-full bg-bg-primary border border-white/10 p-4 font-mono text-xs focus:border-drxred outline-none resize-none"
      ></textarea>
      <button className="w-full bg-drxred text-white py-4 font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all btn-drx">
        {lang === 'ar' ? 'إرسال' : 'Send Message'}
      </button>
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
      <h2 className="text-5xl font-oswald uppercase mb-12 text-drxred">
        {lang === 'ar' ? title.ar : title.en}
      </h2>
      <div className="space-y-8 text-zinc-400 font-inter">
        <p className="text-lg leading-relaxed">
          {lang === 'ar'
            ? 'نحن في DRX EGYPT نلتزم بأعلى معايير الجودة والشفافية مع عملائنا.'
            : 'At DRX EGYPT, we are committed to the highest standards of quality and transparency with our customers.'}
        </p>
        <section>
          <h3 className="text-text-main uppercase font-oswald text-xl mb-4">
            01. {lang === 'ar' ? 'الالتزام بالجودة' : 'Quality Commitment'}
          </h3>
          <p>
            {lang === 'ar'
              ? 'جميع منتجاتنا تخضع للفحص والتحقق من الأصالة.'
              : 'All our products undergo inspection and authenticity verification.'}
          </p>
        </section>
        <section>
          <h3 className="text-text-main uppercase font-oswald text-xl mb-4">
            02. {lang === 'ar' ? 'التوزيع الرسمي' : 'Official Distribution'}
          </h3>
          <p>
            {lang === 'ar'
              ? "Nature's Rule Egypt هي الموزع الرسمي الوحيد في مصر."
              : "Nature's Rule Egypt is the only official distributor in Egypt."}
          </p>
        </section>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewHistory, setViewHistory] = useState<string[]>([]);
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

  // Load persisted state (only non-sensitive data)
  useEffect(() => {
    const savedProducts = localStorage.getItem('drx-products');
    setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS);

    const savedTheme = localStorage.getItem('drx-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);

    const savedLang = localStorage.getItem('drx-lang');
    if (savedLang === 'ar' || savedLang === 'en') setLang(savedLang);

    const savedCart = localStorage.getItem('drx-cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedViewHistory = localStorage.getItem('drx-view-history');
    if (savedViewHistory) setViewHistory(JSON.parse(savedViewHistory));
  }, []);

  // Persist state + apply theme/lang to root (only non-sensitive data)
  useEffect(() => {
    localStorage.setItem('drx-products', JSON.stringify(products));
    localStorage.setItem('drx-cart', JSON.stringify(cart));
    localStorage.setItem('drx-theme', theme);
    localStorage.setItem('drx-lang', lang);
    localStorage.setItem('drx-view-history', JSON.stringify(viewHistory));

    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [products, cart, theme, lang, viewHistory]);

  // Track product views
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'product' && pathParts[2]) {
      const productId = pathParts[2];
      setViewHistory((prev) => {
        if (prev.includes(productId)) return prev;
        return [productId, ...prev].slice(0, 10);
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    gsap.fromTo(
      '.page-content',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [location.pathname]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((item) => item.product.id !== productId));

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => window.confirm(lang === 'ar' ? 'هل تريد إفراغ السلة؟' : 'Clear entire cart?') && setCart([]);

  const handleOrderComplete = (newOrder: Order) => {
    // Orders are now saved directly to Supabase database
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    navigate(`/track?id=${newOrder.trackingNumber}`);
  };

  const toggleCompare = (product: Product) => {
    setCompareList((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : prev.length < 4
        ? [...prev, product]
        : prev
    );
  };

  const viewHistoryNames = useMemo(() => {
    return viewHistory
      .map((id) => products.find((p) => p.id === id)?.name_en)
      .filter(Boolean) as string[];
  }, [viewHistory, products]);

  return (
    <div className="min-h-screen font-inter overflow-x-hidden selection:bg-drxred selection:text-white bg-bg-primary text-text-main">
      <Navbar
        onMenuClick={() => setIsSidebarOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onAdminClick={() => navigate('/admin')}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        lang={lang}
        onNavigate={(path) => {
          navigate(path);
          setIsSidebarOpen(false);
        }}
      />

      <CartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        lang={lang}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        lang={lang}
        onOrderComplete={handleOrderComplete}
      />

      <PerformanceCoach isOpen={isCoachOpen} onClose={() => setIsCoachOpen(false)} lang={lang} />

      <ComparisonBar
        items={compareList}
        onRemove={(id) => setCompareList((prev) => prev.filter((p) => p.id !== id))}
        onCompare={() => setIsMatrixOpen(true)}
        lang={lang}
      />
      {isMatrixOpen && (
        <ComparisonMatrix products={compareList} onClose={() => setIsMatrixOpen(false)} lang={lang} />
      )}

      <button
        onClick={() => setIsCoachOpen(true)}
        className="fixed bottom-8 right-8 z-[350] w-16 h-16 bg-drxred text-white rounded-full shadow-[0_0_30px_#e11d48] flex items-center justify-center hover:scale-110 transition-transform animate-bounce"
      >
        <span className="text-2xl">🤖</span>
      </button>

      <main className="pt-24 min-h-[calc(100vh-100px)]">
        <div className="page-content container mx-auto px-4 md:px-8">
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route
              path="/shop"
              element={
                <Shop
                  lang={lang}
                  products={products}
                  setProducts={setProducts}
                  addToCart={addToCart}
                  onCompare={toggleCompare}
                  compareList={compareList}
                  cart={cart}
                  viewHistoryNames={viewHistoryNames}
                  purchaseHistoryNames={[]}
                />
              }
            />
            <Route
              path="/shop/:mode"
              element={
                <Shop
                  lang={lang}
                  products={products}
                  setProducts={setProducts}
                  addToCart={addToCart}
                  onCompare={toggleCompare}
                  compareList={compareList}
                  cart={cart}
                  viewHistoryNames={viewHistoryNames}
                  purchaseHistoryNames={[]}
                />
              }
            />
            <Route
              path="/product/:id"
              element={<ProductDetailView lang={lang} products={products} setProducts={setProducts} addToCart={addToCart} />}
            />
            <Route path="/calculator" element={<CalculatorView lang={lang} />} />
            <Route path="/verify" element={<VerifyView lang={lang} />} />
            <Route path="/track" element={<TrackOrderView lang={lang} />} />
            <Route path="/contact" element={<ContactView lang={lang} />} />
            <Route
              path="/admin"
              element={
                <AdminPanel
                  lang={lang}
                  products={products}
                  setProducts={setProducts}
                />
              }
            />
            <Route path="/policies/:type" element={<PolicyView lang={lang} type={location.pathname.split('/').pop() || ''} />} />
          </Routes>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
};

export default App;
