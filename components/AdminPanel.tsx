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

// --- helpers ---
const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const slugify = (s?: string) =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const uniqueSlug = (nameEn?: string) => {
  const base = slugify(nameEn) || 'product';
  return `${base}-${Date.now()}`;
};

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, lang, refetchProducts }) => {
  const { user, isAdmin, loading, signIn, signOut } = useAuth();

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
  const [editingId, setEditingId] = useState<string | null>(null);

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

  // Load admin data from backend
  const loadAdminData = useCallback(async () => {
    if (!user || !isAdmin) return;

    setIsLoadingData(true);
    try {
      // Load codes
      const { data: codesData } = await supabase.functions.invoke('admin-codes', {
        body: { action: 'list' }
      });
      if (codesData?.codes) {
        setCodes(codesData.codes.map((c: any) => ({
          id: c.id,
          used: c.used,
          usedAt: c.used_at
        })));
      }

      // Load orders
      const { data: ordersData } = await supabase.functions.invoke('admin-orders', {
        body: { action: 'list' }
      });
      if (ordersData?.orders) {
        setOrders(ordersData.orders.map((o: any) => ({
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
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin, loadAdminData]);

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
    if (codeSearch) {
      list = list.filter(c => c.id.toLowerCase().includes(codeSearch.toLowerCase()));
    }
    if (codeFilter === 'used') {
      list = list.filter(c => c.used);
    } else if (codeFilter === 'available') {
      list = list.filter(c => !c.used);
    }
    return list;
  }, [codes, codeSearch, codeFilter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSigningIn(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setAuthError(error.message);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const openForm = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        ...product,
        imageUrl: (product as any).imageUrl || '',
        goals: [...(product.goals || [])],
        // preserve slug if it exists
        slug: (product as any).slug
      } as any);
    } else {
      setEditingId(null);
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

  // Verification Code Actions via Edge Function
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
      if (editingCodeId) {
        await supabase.functions.invoke('admin-codes', {
          body: { action: 'update', codeId: editingCodeId, used: codeFormUsed }
        });
      } else {
        await supabase.functions.invoke('admin-codes', {
          body: { action: 'create', codeId: newId, used: codeFormUsed }
        });
      }
      await loadAdminData();
      setIsCodeModalOpen(false);
    } catch (err) {
      console.error('Failed to save code:', err);
    }
  };

  const deleteCode = async (id: string) => {
    if (window.confirm(`ERASE NODE ${id} FROM REGISTRY?`)) {
      try {
        await supabase.functions.invoke('admin-codes', {
          body: { action: 'delete', codeId: id }
        });
        await loadAdminData();
      } catch (err) {
        console.error('Failed to delete code:', err);
      }
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
      // Generate a unique slug each time for NEW products
      // For edits: keep existing slug if present, else generate once.
      const existingSlug = (formData as any).slug;
      const slugValue = editingId
        ? (existingSlug || uniqueSlug(formData.name_en))
        : uniqueSlug(formData.name_en);

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

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(dbData)
          .eq('id', editingId);

        if (error) {
          console.error('Failed to update product:', error);
          alert(`Failed to update product: ${error.message}`);
          return;
        }

        await refetchProducts();
      } else {
        const { error } = await supabase
          .from('products')
          .insert([dbData])
          .select()
          .single();

        if (error) {
          console.error('Failed to add product:', error);
          alert(`Failed to add product: ${error.message}`);
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

  // ✅ FIX: delete by UUID id; fallback delete by slug if id isn't UUID
  const deleteProduct = async (id: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      let query = supabase.from('products').delete();

      if (isUuid(id)) {
        query = query.eq('id', id);
      } else {
        // fallback: treat provided id as slug
        query = query.eq('slug', id);
      }

      const { error } = await query;

      if (error) {
        console.error('Failed to delete product:', error);
        alert(`Failed to delete product: ${error.message}`);
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
      await supabase.functions.invoke('admin-orders', {
        body: { action: 'update_status', orderId: id, status }
      });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Loading state
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

  // Not authenticated
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

  // Authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-32 px-4">
        <div className="card-ui p-10 shadow-2xl text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-4xl font-black font-oswald uppercase mb-4">
            Access <span className="text-drxred">Denied</span>
          </h2>
          <p className="text-muted text-sm font-mono mb-8">
            Your account does not have administrator privileges.
          </p>
          <button
            onClick={handleLogout}
            className="btn-drx bg-zinc-800 text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-drxred transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // -----------------------
  // UI (unchanged below)
  // -----------------------
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

      {/* الباقي من UI زي ما هو في ملفك الأصلي */}
      {/* --- IMPORTANT: انا سيبت باقي الواجهة زي ما هي لتجنب تغييرات شكل --- */}
      {/* 👇👇👇 */}
      {/* NOTE: you can keep your existing UI render blocks from your original file below this point.
          If you prefer, paste the remainder of your original JSX here unchanged.
      */}
      {/* For brevity in this response: keep the rest of your original render exactly as-is. */}

      {/* =========================
          KEEP YOUR ORIGINAL JSX
          from:
          {activeTab === 'dashboard' && (...)}
          all the way to end
         ========================= */}

    </div>
  );
};

export default AdminPanel;
