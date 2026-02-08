import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, Category, VerificationCode, Order, OrderStatus } from '../types';
import { GOALS } from '../constants';
import { generateProductImage, editProductImage } from '../services/aiService';
import { ImageGenerationSkeleton } from './ui/Skeleton';
import { ErrorState } from './ui/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  lang: 'ar' | 'en';
  refetchProducts: () => Promise<void>;
}

const BG_THEMES = [
  { id: 'dark-industrial', label: 'Dark Industrial Charcoal', prompt: 'dark industrial charcoal texture with subtle metallic reflections' },
  { id: 'white-studio', label: 'Clean White Studio', prompt: 'minimalist clean white studio background with soft natural shadows' },
  { id: 'red-gradient', label: 'Abstract DRX Red', prompt: 'abstract deep red and black gradient with dynamic light streaks' },
  { id: 'lab-germany', label: 'German Laboratory', prompt: 'blurred high-tech pharmaceutical laboratory in Germany with glass and stainless steel' },
  { id: 'gym-cyber', label: 'Cyberpunk Gym', prompt: 'futuristic high-end gym at night with neon red lighting and carbon fiber surfaces' },
  { id: 'wood-natural', label: 'Organic Minimalist', prompt: 'natural light wood surface with soft morning light and blurred greenery background' }
];

const isUuid = (v?: string) =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const slugify = (s?: string) =>
  (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const uniqueSlug = (nameEn?: string) => `${slugify(nameEn) || 'product'}-${Date.now()}`;

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, lang, refetchProducts }) => {
  const { user, loading, signIn, signOut } = useAuth();

  // ✅ Server-verified admin gate (source of truth)
  const [serverAdminChecked, setServerAdminChecked] = useState(false);
  const [serverIsAdmin, setServerIsAdmin] = useState(false);
  const [serverAdminError, setServerAdminError] = useState<string | null>(null);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'codes' | 'orders'>('dashboard');

  // Data from backend
  const [codes, setCodes] = useState<VerificationCode[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Product Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(BG_THEMES[0].prompt);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingKeyType, setEditingKeyType] = useState<'id' | 'slug'>('id');

  const [formData, setFormData] = useState<Partial<Product>>({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: 0,
    image: '',
    imageUrl: '',
    category: Category.Protein,
    inStock: true,
    isNew: false,
    isBestSeller: false,
    featured: 1,
    goals: []
  });

  // Code Management State
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);
  const [codeFormId, setCodeFormId] = useState('');
  const [codeFormUsed, setCodeFormUsed] = useState(false);
  const [codeSearch, setCodeSearch] = useState('');
  const [codeFilter, setCodeFilter] = useState<'all' | 'used' | 'available'>('all');

  const getAuthHeaders = useCallback(async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, []);

  // ✅ Server-side admin verification (hard gate)
  const verifyAdminServerSide = useCallback(async () => {
    if (!user) {
      setServerAdminChecked(false);
      setServerIsAdmin(false);
      setServerAdminError(null);
      return;
    }

    setServerAdminError(null);
    setServerAdminChecked(false);

    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        setServerIsAdmin(false);
        setServerAdminChecked(true);
        return;
      }

      // We call an admin-only function; success => admin, fail => not admin
      const { data, error } = await supabase.functions.invoke('admin-orders', {
        body: { action: 'list' },
        headers
      });

      if (error) {
        // 401/403 => not admin or token issue
        setServerIsAdmin(false);
        setServerAdminError(error.message || 'Admin verification failed');
      } else {
        // If it returns orders array, we consider it verified admin.
        setServerIsAdmin(true);
        if (data?.orders) {
          // preload orders right away to reduce additional calls
          setOrders((data.orders || []).map((o: any) => ({
            id: o.id,
            trackingNumber: o.tracking_number,
            total: o.total,
            status: o.status as OrderStatus,
            createdAt: o.created_at,
            shippingInfo: {
              fullName: o.shipping_full_name,
              phone: o.shipping_phone,
              email: o.shipping_email,
              address: o.shipping_address,
              method: o.shipping_method,
              city: ''
            },
            items: (o.order_items || []).map((item: any) => ({
              product: {
                id: item.product_id,
                name_en: item.product_name,
                name_ar: item.product_name,
                price: item.product_price,
                description_ar: '',
                description_en: '',
                image: '',
                category: Category.Protein,
                inStock: true,
                isNew: false,
                isBestSeller: false,
                featured: 0,
                goals: []
              },
              quantity: item.quantity
            }))
          })));
        }
      }
    } catch (e: any) {
      setServerIsAdmin(false);
      setServerAdminError(e?.message || 'Admin verification error');
    } finally {
      setServerAdminChecked(true);
    }
  }, [user, getAuthHeaders]);

  useEffect(() => {
    verifyAdminServerSide();
  }, [verifyAdminServerSide]);

  const loadCodes = useCallback(async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const { data } = await supabase.functions.invoke('admin-codes', {
      body: { action: 'list' },
      headers
    });
    if (data?.codes) {
      setCodes(data.codes.map((c: any) => ({
        id: c.id,
        used: c.used,
        usedAt: c.used_at
      })));
    }
  }, [getAuthHeaders]);

  const loadAdminData = useCallback(async () => {
    if (!user || !serverIsAdmin) return;
    setIsLoadingData(true);
    try {
      await loadCodes();
      // orders already preloaded in verifyAdminServerSide, but safe to refresh:
      const headers = await getAuthHeaders();
      if (!headers) return;
      const { data } = await supabase.functions.invoke('admin-orders', {
        body: { action: 'list' },
        headers
      });
      if (data?.orders) {
        setOrders((data.orders || []).map((o: any) => ({
          id: o.id,
          trackingNumber: o.tracking_number,
          total: o.total,
          status: o.status as OrderStatus,
          createdAt: o.created_at,
          shippingInfo: {
            fullName: o.shipping_full_name,
            phone: o.shipping_phone,
            email: o.shipping_email,
            address: o.shipping_address,
            method: o.shipping_method,
            city: ''
          },
          items: (o.order_items || []).map((item: any) => ({
            product: {
              id: item.product_id,
              name_en: item.product_name,
              name_ar: item.product_name,
              price: item.product_price,
              description_ar: '',
              description_en: '',
              image: '',
              category: Category.Protein,
              inStock: true,
              isNew: false,
              isBestSeller: false,
              featured: 0,
              goals: []
            },
            quantity: item.quantity
          }))
        })));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, serverIsAdmin, getAuthHeaders, loadCodes]);

  useEffect(() => {
    if (user && serverIsAdmin) loadAdminData();
  }, [user, serverIsAdmin, loadAdminData]);

  const analytics = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + (p.price * (p.inStock ? 1 : 0)), 0);
    const usedCodesCount = codes.filter(c => c.used).length;
    return {
      totalValue,
      productCount: products.length,
      orderCount: orders.length,
      usedCodesCount,
      totalCodesCount: codes.length
    };
  }, [products, codes, orders]);

  const filteredCodes = useMemo(() => {
    let list = codes;
    if (codeSearch) list = list.filter(c => c.id.toLowerCase().includes(codeSearch.toLowerCase()));
    if (codeFilter === 'used') list = list.filter(c => c.used);
    if (codeFilter === 'available') list = list.filter(c => !c.used);
    return list;
  }, [codes, codeSearch, codeFilter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const { error } = await signIn(email, password);
      if (error) setAuthError(error.message);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setServerAdminChecked(false);
    setServerIsAdmin(false);
    setServerAdminError(null);
  };

  const getDbKey = (p: Product) => {
    const raw = String(p.id || '');
    if (isUuid(raw)) return { column: 'id' as const, value: raw };
    const slug = (p as any).slug ? String((p as any).slug) : raw;
    return { column: 'slug' as const, value: slug };
  };

  const openForm = (product?: Product) => {
    if (product) {
      const key = getDbKey(product);
      setEditingKey(key.value);
      setEditingKeyType(key.column);
      setFormData({
        ...product,
        imageUrl: (product as any).imageUrl || '',
        goals: [...(product.goals || [])],
        slug: (product as any).slug
      } as any);
    } else {
      setEditingKey(null);
      setEditingKeyType('id');
      setFormData({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        price: 0,
        image: '',
        imageUrl: '',
        category: Category.Protein,
        inStock: true,
        isNew: true,
        isBestSeller: false,
        featured: products.length + 1,
        goals: []
      });
    }
    setAiEditPrompt('');
    setImageError(null);
    setIsFormOpen(true);
  };

  const openCodeModal = (code?: VerificationCode) => {
    if (code) {
      setEditingCodeId(code.id);
      setCodeFormId(code.id);
      setCodeFormUsed(code.used);
    } else {
      setEditingCodeId(null);
      setCodeFormId(`DRX-EGY-${Math.floor(Math.random() * 900 + 100)}`);
      setCodeFormUsed(false);
    }
    setIsCodeModalOpen(true);
  };

  const saveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = codeFormId.trim().toUpperCase();
    if (!newId) return;

    try {
      const headers = await getAuthHeaders();
      if (!headers) return;

      if (editingCodeId) {
        await supabase.functions.invoke('admin-codes', {
          body: { action: 'update', codeId: editingCodeId, used: codeFormUsed },
          headers
        });
      } else {
        await supabase.functions.invoke('admin-codes', {
          body: { action: 'create', codeId: newId, used: codeFormUsed },
          headers
        });
      }
      await loadCodes();
      setIsCodeModalOpen(false);
    } catch (err) {
      console.error('Failed to save code:', err);
    }
  };

  const deleteCode = async (id: string) => {
    if (!window.confirm(`ERASE NODE ${id} FROM REGISTRY?`)) return;
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      await supabase.functions.invoke('admin-codes', {
        body: { action: 'delete', codeId: id },
        headers
      });
      await loadCodes();
    } catch (err) {
      console.error('Failed to delete code:', err);
    }
  };

  const handleSynthesizeImage = async () => {
    if (!formData.name_en || !formData.description_en) {
      setImageError("Name (EN) and Technical Spec (EN) are required.");
      return;
    }
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const imageData = await generateProductImage(formData.name_en, formData.description_en, selectedTheme);
      setFormData(prev => ({ ...prev, image: imageData }));
    } catch (err: any) {
      setImageError(err?.message || "Image synthesis failed. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAiEdit = async () => {
    if (!formData.image || !aiEditPrompt) {
      setImageError("Current image and edit prompt required.");
      return;
    }
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const editedData = await editProductImage(formData.image, aiEditPrompt, selectedTheme);
      setFormData(prev => ({ ...prev, image: editedData }));
    } catch (err: any) {
      setImageError(err?.message || "AI edit failed. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existingSlug = (formData as any).slug;
      const slugValue = editingKey ? (existingSlug || uniqueSlug(formData.name_en)) : uniqueSlug(formData.name_en);

      const dbData: any = {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        description_ar: formData.description_ar,
        description_en: formData.description_en,
        price: formData.price,
        image: formData.image,
        category: formData.category,
        in_stock: formData.inStock,
        is_new: formData.isNew,
        is_best_seller: formData.isBestSeller,
        featured: formData.featured,
        goals: formData.goals,
        slug: slugValue,
      };

      if (editingKey) {
        const q = supabase.from('products').update(dbData);
        const { error } =
          editingKeyType === 'id'
            ? await q.eq('id', editingKey)
            : await q.eq('slug', editingKey);

        if (error) {
          console.error('Failed to update product:', error);
          alert(`Failed to update product: ${error.message} (code: ${error.code})`);
          return;
        }
        await refetchProducts();
      } else {
        const { error } = await supabase.from('products').insert([dbData]).select().single();
        if (error) {
          console.error('Failed to add product:', error);
          alert(`Failed to add product: ${error.message} (code: ${error.code})`);
          return;
        }
        await refetchProducts();
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('An error occurred while saving the product.');
    }
  };

  const deleteProduct = async (p: Product) => {
    const name = lang === 'ar' ? p.name_ar : p.name_en;
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      const key = getDbKey(p);
      const q = supabase.from('products').delete();
      const { error } = key.column === 'id'
        ? await q.eq('id', key.value)
        : await q.eq('slug', key.value);

      if (error) {
        console.error('Failed to delete product:', error);
        alert(`Failed to delete product: ${error.message} (code: ${error.code})`);
        return;
      }

      await refetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('An error occurred while deleting the product.');
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;

      await supabase.functions.invoke('admin-orders', {
        body: { action: 'update_status', orderId: id, status },
        headers
      });

      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // ====== UI Guards ======
  if (loading) {
    return (
      <div className="max-w-md mx-auto py-32 px-4">
        <div className="card-ui p-10 shadow-2xl text-center">
          <div className="text-4xl font-black font-oswald uppercase mb-4">Loading...</div>
          <div className="animate-spin w-8 h-8 border-2 border-drxred border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-32 px-4">
        <div className="card-ui p-10 shadow-2xl">
          <h2 className="text-4xl font-black font-oswald uppercase text-center mb-10">
            Admin <span className="text-drxred">Access</span>
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega block">Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="w-full bg-transparent border-b border-ui p-4 font-mono text-sm outline-none focus:border-drxred transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega block">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full bg-transparent border-b border-ui p-4 font-mono text-sm outline-none focus:border-drxred transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {authError && (
              <div className="text-drxred text-sm font-mono text-center p-3 bg-drxred/10 border border-drxred/20 rounded">
                {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={isSigningIn}
              className="btn-drx w-full bg-drxred text-white py-5 font-bold uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {isSigningIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-muted text-[10px] font-mono mt-6 uppercase tracking-widest">
            Admin accounts must be assigned the admin role in the database
          </p>
        </div>
      </div>
    );
  }

  // ✅ Hard gate: don’t show admin UI until server check completes
  if (!serverAdminChecked) {
    return (
      <div className="max-w-md mx-auto py-32 px-4">
        <div className="card-ui p-10 shadow-2xl text-center">
          <div className="text-4xl font-black font-oswald uppercase mb-4">Verifying…</div>
          <div className="animate-spin w-8 h-8 border-2 border-drxred border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted text-xs font-mono mt-6 uppercase tracking-widest">
            Server-side admin verification
          </p>
        </div>
      </div>
    );
  }

  // ✅ Not admin (server says so)
  if (!serverIsAdmin) {
    return (
      <div className="max-w-md mx-auto py-32 px-4">
        <div className="card-ui p-10 shadow-2xl text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-4xl font-black font-oswald uppercase mb-4">
            Access <span className="text-drxred">Denied</span>
          </h2>
          <p className="text-muted text-sm font-mono mb-6">
            Your account does not have administrator privileges.
          </p>
          {serverAdminError && (
            <p className="text-[10px] font-mono text-drxred/80 bg-drxred/10 border border-drxred/20 p-3 rounded">
              {serverAdminError}
            </p>
          )}
          <div className="flex gap-3 justify-center mt-8">
            <button
              onClick={() => verifyAdminServerSide()}
              className="btn-drx bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-drxred hover:text-white transition-all"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="btn-drx bg-zinc-800 text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-drxred transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====== Admin UI (safe to show) ======
  return (
    <div className="py-6 space-y-10 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-ui pb-8">
        <div>
          <h1 className="text-6xl font-black font-oswald uppercase tracking-tighter leading-none">
            System <span className="text-drxred">Management</span>
          </h1>
          <p className="text-[10px] font-mono text-muted mt-2 uppercase tracking-[0.4em]">
            Administrator Uplink Established // {user.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-bg-card p-1 border border-ui rounded-sm overflow-x-auto custom-scrollbar">
            {(['dashboard', 'products', 'codes', 'orders'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-mega whitespace-nowrap transition-all ${
                  activeTab === tab ? 'bg-drxred text-white shadow-lg' : 'text-muted hover:text-drxred'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-mega text-muted hover:text-drxred transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {isLoadingData && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-drxred border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted text-sm font-mono mt-4">Loading data...</p>
        </div>
      )}

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
          <div className="card-ui border-t-4 border-drxred p-8">
            <span className="text-[10px] font-mono text-muted uppercase block mb-3 font-bold tracking-mega">
              Active Matrix Units
            </span>
            <div className="text-6xl font-oswald font-bold">{analytics.productCount}</div>
          </div>
          <div className="card-ui border-t-4 border-blue-500 p-8">
            <span className="text-[10px] font-mono text-muted uppercase block mb-3 font-bold tracking-mega">
              Processed Orders
            </span>
            <div className="text-6xl font-oswald font-bold">{analytics.orderCount}</div>
          </div>
          <div className="card-ui border-t-4 border-green-500 p-8">
            <span className="text-[10px] font-mono text-muted uppercase block mb-3 font-bold tracking-mega">
              Verified Integrity
            </span>
            <div className="text-6xl font-oswald font-bold">
              {analytics.totalCodesCount > 0 ? ((analytics.usedCodesCount / analytics.totalCodesCount) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="card-ui border-t-4 border-yellow-500 p-8">
            <span className="text-[10px] font-mono text-muted uppercase block mb-3 font-bold tracking-mega">
              Gross Value
            </span>
            <div className="text-4xl font-oswald font-bold">
              {analytics.totalValue.toLocaleString()} <span className="text-lg">LE</span>
            </div>
          </div>
        </div>
      )}

      {/* Products (same UI as you had, but using deleteProduct(p) and openForm(p) ) */}
      {activeTab === 'products' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-bg-card border border-ui p-8 rounded-sm shadow-xl">
            <h3 className="text-3xl font-oswald uppercase tracking-tight">Active Matrix Units</h3>
            <button
              onClick={() => openForm()}
              className="bg-drxred text-white px-10 py-4 text-[10px] font-black uppercase tracking-mega hover:bg-white hover:text-drxred border border-drxred transition-all shadow-lg"
            >
              + Deploy New Unit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {products.map(p => (
              <div key={p.id} className="card-ui group relative flex flex-col">
                <div className="aspect-square bg-black overflow-hidden relative">
                  <img
                    src={((p as any).imageUrl || p.image) as string}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    alt=""
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (p.image && target.src !== p.image) target.src = p.image;
                    }}
                  />
                </div>
                <div className="p-8">
                  <h4 className="text-lg font-bold uppercase mb-4 font-oswald tracking-tight">
                    {lang === 'ar' ? p.name_ar : p.name_en}
                  </h4>
                  <div className="flex justify-between items-end">
                    <div className="text-3xl font-oswald text-drxred font-bold">
                      {p.price.toLocaleString()} <span className="text-sm">LE</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openForm(p)}
                        className="text-[10px] font-mono font-bold uppercase text-muted hover:text-drxred underline decoration-drxred/30 underline-offset-4 tracking-mega transition-colors"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => deleteProduct(p)}
                        className="text-[10px] font-mono font-bold uppercase text-muted hover:text-red-500 underline decoration-red-500/30 underline-offset-4 tracking-mega transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Codes + Orders tabs + Modals: keep as in your existing file
          - Just make sure functions.invoke calls include headers from getAuthHeaders
          - You can paste your existing sections below if you want, or I can rebuild full file end-to-end */}
    </div>
  );
};

export default AdminPanel;
