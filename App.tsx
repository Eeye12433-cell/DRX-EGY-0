import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';

import {
  Product,
  VerificationCode,
  CartItem,
  Order,
  StripeConfig
} from './types';

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

/* ---------------------------------- */
/* Inline Views */
/* ---------------------------------- */

const ContactView: React.FC<{ lang: 'ar' | 'en' }> = ({ lang }) => (
  <div className="max-w-2xl mx-auto py-20 px-4">
    <h2 className="text-5xl font-oswald uppercase mb-8 text-center">
      {lang === 'ar' ? 'تواصل' : 'Contact'}{' '}
      <span className="text-drxred">{lang === 'ar' ? 'معنا' : 'Us'}</span>
    </h2>

    <div className="bg-bg-card border border-ui p-10 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          placeholder={lang === 'ar' ? 'الاسم' : 'Name'}
          className="bg-bg-primary border border-ui p-4 font-mono text-xs outline-none"
        />
        <input
          type="email"
          placeholder={lang === 'ar' ? 'الايميل' : 'Email'}
          className="bg-bg-primary border border-ui p-4 font-mono text-xs outline-none"
        />
      </div>

      <textarea
        rows={5}
        placeholder={lang === 'ar' ? 'رسالتك' : 'Message'}
        className="w-full bg-bg-primary border border-ui p-4 font-mono text-xs outline-none resize-none"
      />

      <button className="w-full bg-drxred text-white py-4 font-bold uppercase tracking-widest btn-drx">
        {lang === 'ar' ? 'إرسال' : 'Send Message'}
      </button>
    </div>
  </div>
);

/* ---------------------------------- */
/* App */
/* ---------------------------------- */

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [codes, setCodes] = useState<Record<string, VerificationCode>>({});
  const [viewHistory, setViewHistory] = useState<string[]>([]);

  const [stripeConfig, setStripeConfig] = useState<StripeConfig>({
    publicKey: '',
    secretKey: '',
    enabled: false
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  /* ---------------------------------- */
  /* Init */
  /* ---------------------------------- */

  useEffect(() => {
    setProducts(
      JSON.parse(localStorage.getItem('drx-products') || 'null') ??
        INITIAL_PRODUCTS
    );

    setCart(JSON.parse(localStorage.getItem('drx-cart') || '[]'));
    setOrders(JSON.parse(localStorage.getItem('drx-orders') || '[]'));
    setViewHistory(JSON.parse(localStorage.getItem('drx-view-history') || '[]'));
    setStripeConfig(
      JSON.parse(localStorage.getItem('drx-stripe-config') || 'null') || {
        publicKey: '',
        secretKey: '',
        enabled: false
      }
    );

    const savedLang = localStorage.getItem('drx-lang') as 'ar' | 'en';
    const savedTheme = localStorage.getItem('drx-theme') as 'dark' | 'light';

    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  /* ---------------------------------- */
  /* Persist + THEME FIX (IMPORTANT) */
  /* ---------------------------------- */

  useEffect(() => {
    localStorage.setItem('drx-products', JSON.stringify(products));
    localStorage.setItem('drx-cart', JSON.stringify(cart));
    localStorage.setItem('drx-orders', JSON.stringify(orders));
    localStorage.setItem('drx-view-history', JSON.stringify(viewHistory));
    localStorage.setItem('drx-stripe-config', JSON.stringify(stripeConfig));
    localStorage.setItem('drx-lang', lang);
    localStorage.setItem('drx-theme', theme);

    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [products, cart, orders, viewHistory, stripeConfig, lang, theme]);

  /* ---------------------------------- */
  /* Page Transition */
  /* ---------------------------------- */

  useEffect(() => {
    gsap.fromTo(
      '.page-content',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4 }
    );
  }, [location.pathname]);

  /* ---------------------------------- */
  /* Helpers */
  /* ---------------------------------- */

  const addToCart = (product: Product) => {
    setCart(prev => {
      const found = prev.find(i => i.product.id === product.id);
      if (found) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const toggleCompare = (product: Product) => {
    setCompareList(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : prev.length < 4
        ? [...prev, product]
        : prev
    );
  };

  const purchaseHistoryNames = useMemo(() => {
    const names = new Set<string>();
    orders.forEach(o => o.items.forEach(i => names.add(i.product.name_en)));
    return Array.from(names);
  }, [orders]);

  const viewHistoryNames = useMemo(
    () =>
      viewHistory
        .map(id => products.find(p => p.id === id)?.name_en)
        .filter(Boolean) as string[],
    [viewHistory, products]
  );

  /* ---------------------------------- */
  /* Render */
  /* ---------------------------------- */

  return (
    <div className="min-h-screen font-inter overflow-x-hidden selection:bg-drxred selection:text-white">
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
        onNavigate={path => {
          navigate(path);
          setIsSidebarOpen(false);
        }}
      />

      <CartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        lang={lang}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        stripeConfig={stripeConfig}
        lang={lang}
        onOrderComplete={order => {
          setOrders(prev => [...prev, order]);
          setCart([]);
          navigate(`/track?id=${order.trackingNumber}`);
        }}
      />

      <PerformanceCoach
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        lang={lang}
      />

      <ComparisonBar
        items={compareList}
        onRemove={id => setCompareList(p => p.filter(x => x.id !== id))}
        onCompare={() => setIsMatrixOpen(true)}
        lang={lang}
      />

      {isMatrixOpen && (
        <ComparisonMatrix
          products={compareList}
          onClose={() => setIsMatrixOpen(false)}
          lang={lang}
        />
      )}

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
                  purchaseHistoryNames={purchaseHistoryNames}
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
                  purchaseHistoryNames={purchaseHistoryNames}
                />
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProductDetailView
                  lang={lang}
                  products={products}
                  setProducts={setProducts}
                  addToCart={addToCart}
                />
              }
            />
            <Route path="/calculator" element={<CalculatorView lang={lang} />} />
            <Route
              path="/verify"
              element={<VerifyView lang={lang} codes={codes} setCodes={setCodes} />}
            />
            <Route path="/track" element={<TrackOrderView lang={lang} orders={orders} />} />
            <Route path="/contact" element={<ContactView lang={lang} />} />
            <Route
              path="/admin"
              element={
                <AdminPanel
                  lang={lang}
                  products={products}
                  setProducts={setProducts}
                  codes={codes}
                  setCodes={setCodes}
                  orders={orders}
                  setOrders={setOrders}
                  stripeConfig={stripeConfig}
                  setStripeConfig={setStripeConfig}
                />
              }
            />
          </Routes>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
};

export default App;
