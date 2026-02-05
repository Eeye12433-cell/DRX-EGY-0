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
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) return;

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
        imageUrl: product.imageUrl || '',
        goals: [...(product.goals || [])]
      });
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
      // Map form data to database format
      const dbData = {
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
        slug: formData.name_en?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `product-${Date.now()}`,
      };

      if (editingId) {
        // Update existing product in database
        const { error } = await supabase
          .from('products')
          .update(dbData)
          .eq('id', editingId);

        if (error) {
          console.error('Failed to update product:', error);
          alert('Failed to update product. Please try again.');
          return;
        }

        // Refetch products from database to ensure UI is in sync
        await refetchProducts();
      } else {
        // Insert new product in database
        const { error } = await supabase
          .from('products')
          .insert(dbData)
          .select();

        if (error) {
          console.error('Failed to add product:', error);
          alert('Failed to add product. Please try again.');
          return;
        }

        // Refetch products from database to ensure UI is in sync
        await refetchProducts();
      }
      
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('An error occurred while saving the product.');
    }
  };

  const deleteProduct = async (id: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
        return;
      }

      // Refetch products from database to ensure UI is in sync
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
                    src={(p.imageUrl || p.image) as string}
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
                        onClick={() => deleteProduct(p.id, lang === 'ar' ? p.name_ar : p.name_en)}
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

      {activeTab === 'codes' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-bg-card border border-ui p-8 rounded-sm shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <h3 className="text-3xl font-oswald uppercase tracking-tight">
                  Verification <span className="text-drxred">Node Registry</span>
                </h3>
                <button
                  onClick={() => openCodeModal()}
                  className="bg-drxred text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  + Add Node
                </button>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <select
                  className="bg-bg-primary border border-ui p-3 text-[10px] font-mono uppercase font-bold outline-none rounded-sm min-w-[150px]"
                  value={codeFilter}
                  onChange={(e) => setCodeFilter(e.target.value as 'all' | 'used' | 'available')}
                >
                  <option value="all">View All Nodes</option>
                  <option value="used">Compromised (Used)</option>
                  <option value="available">Secure (Available)</option>
                </select>
                <input
                  type="text"
                  placeholder="SEARCH CODE ID..."
                  className="bg-bg-primary border border-ui p-3 text-[10px] font-mono outline-none rounded-sm w-full md:w-64 tracking-widest"
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              {filteredCodes.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-30 font-mono text-[10px] uppercase tracking-mega">
                  No codes matching parameters found.
                </div>
              ) : (
                filteredCodes.map(code => (
                  <div
                    key={code.id}
                    className={`group p-4 border font-mono text-[11px] flex flex-col gap-2 transition-all relative overflow-hidden ${
                      code.used ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-bold tracking-widest ${code.used ? 'text-red-500' : 'text-green-500'}`}>
                        {code.id}
                      </span>
                      <span
                        className={`text-[8px] uppercase px-1.5 py-0.5 rounded-sm font-black ${
                          code.used ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                        }`}
                      >
                        {code.used ? 'USED' : 'SECURE'}
                      </span>
                    </div>
                    {code.usedAt && (
                      <span className="text-[8px] text-muted tracking-tighter uppercase">
                        Verified: {new Date(code.usedAt).toLocaleDateString()}
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button onClick={() => openCodeModal(code)} className="text-xs text-white hover:text-drxred font-bold uppercase tracking-widest">
                        [EDIT]
                      </button>
                      <button onClick={() => deleteCode(code.id)} className="text-xs text-drxred hover:text-white font-bold uppercase tracking-widest">
                        [ERASE]
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-bg-card border border-ui p-8 rounded-sm shadow-xl">
            <h3 className="text-3xl font-oswald uppercase mb-8 border-b border-ui pb-6">
              Logistics <span className="text-drxred">Transmission Queue</span>
            </h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left font-mono text-[11px] uppercase tracking-tight">
                <thead>
                  <tr className="border-b border-ui text-muted">
                    <th className="py-6 tracking-mega">Tracking ID</th>
                    <th className="tracking-mega">Customer</th>
                    <th className="tracking-mega">Method</th>
                    <th className="tracking-mega text-center">Units</th>
                    <th className="tracking-mega">Total Val</th>
                    <th className="tracking-mega">Status</th>
                    <th className="tracking-mega">Protocol</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-muted font-bold tracking-mega opacity-30">
                        No telemetry data available.
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="border-b border-ui hover:bg-drxred/5 transition-colors">
                        <td className="py-6 font-bold text-drxred">{order.trackingNumber}</td>
                        <td className="font-semibold">{order.shippingInfo.fullName}</td>
                        <td className="text-muted">{order.shippingInfo.method}</td>
                        <td className="text-center font-bold">{order.items.length}</td>
                        <td className="text-white font-black">{order.total.toLocaleString()} LE</td>
                        <td>
                          <span
                            className={`px-3 py-1 text-[9px] font-black tracking-widest ${
                              order.status === OrderStatus.Delivered
                                ? 'bg-green-500 text-white'
                                : order.status === OrderStatus.Shipped
                                ? 'bg-blue-500 text-white'
                                : 'bg-drxred text-white'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="bg-bg-primary border border-ui p-2 text-[9px] font-bold outline-none rounded-sm"
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          >
                            {Object.values(OrderStatus).map(s => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Verification Code Form Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111] border border-drxred/40 w-full max-w-md p-10 shadow-2xl relative">
            <h2 className="text-3xl font-black font-oswald uppercase text-white mb-8 tracking-tighter">
              Manage <span className="text-drxred">Node</span>
            </h2>
            <form onSubmit={saveCode} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega">Registry Identifier</label>
                <input
                  required
                  type="text"
                  className="w-full bg-black border border-ui p-4 font-mono text-lg outline-none focus:border-drxred uppercase tracking-widest"
                  value={codeFormId}
                  onChange={e => setCodeFormId(e.target.value)}
                  placeholder="DRX-EGY-XXX"
                  disabled={!!editingCodeId}
                />
              </div>
              <div className="flex items-center gap-4 p-4 bg-black border border-ui">
                <input
                  type="checkbox"
                  id="used-check"
                  className="w-5 h-5 accent-drxred"
                  checked={codeFormUsed}
                  onChange={e => setCodeFormUsed(e.target.checked)}
                />
                <label htmlFor="used-check" className="text-[11px] font-mono text-white uppercase font-bold tracking-widest cursor-pointer select-none">
                  Mark as Compromised (Used)
                </label>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-white text-black py-4 font-black uppercase tracking-widest text-xs hover:bg-drxred hover:text-white transition-all shadow-xl">
                  Execute Save
                </button>
                <button type="button" onClick={() => setIsCodeModalOpen(false)} className="px-6 border border-white/10 text-muted font-mono text-[10px] uppercase hover:text-white">
                  Abort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-drxred/40 w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl relative flex flex-col rounded-sm">
            <div className="p-8 border-b border-ui flex justify-between items-center bg-black/20">
              <button onClick={() => setIsFormOpen(false)} className="text-muted hover:text-white font-mono text-[10px] uppercase font-bold tracking-mega transition-colors">
                [ ABORT DEPLOYMENT ]
              </button>
              <h2 className="text-4xl font-black font-oswald uppercase text-white tracking-tighter leading-none">
                SYNTHESIZE <span className="text-drxred">MATRIX UNIT</span>
              </h2>
            </div>

            <form onSubmit={saveProduct} className="flex-1 overflow-y-auto p-12 grid grid-cols-12 gap-12 custom-scrollbar">
              <div className="col-span-12 lg:col-span-5 space-y-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono text-drxred uppercase font-black tracking-mega">Visual Asset Render</span>
                    <button
                      type="button"
                      onClick={handleSynthesizeImage}
                      disabled={isGeneratingImage}
                      className="bg-black border border-drxred text-drxred px-6 py-2 text-[10px] font-mono uppercase font-black tracking-mega hover:bg-drxred hover:text-white transition-all disabled:opacity-50"
                    >
                      {isGeneratingImage ? 'RENDERING...' : '[ AI SYNTHESIZE ]'}
                    </button>
                  </div>

                  {imageError && !isGeneratingImage && (
                    <ErrorState
                      title="Image Generation Failed"
                      message={imageError}
                      onRetry={() => setImageError(null)}
                      variant="inline"
                    />
                  )}

                  <div className="aspect-square w-full bg-black border border-ui flex items-center justify-center relative overflow-hidden group shadow-inner">
                    {isGeneratingImage ? (
                      <ImageGenerationSkeleton />
                    ) : ((formData.imageUrl || formData.image) ? (
                      <img
                        src={(formData.imageUrl || formData.image) as string}
                        className="w-full h-full object-contain"
                        alt="Preview"
                        onError={() => setImageError("Invalid image URL or unreachable resource.")}
                      />
                    ) : (
                      <div className="text-zinc-900 font-bold text-7xl font-oswald uppercase opacity-30 select-none">NO ASSET</div>
                    ))}
                  </div>

                  <div className="p-6 bg-black/40 border border-ui space-y-3 rounded-sm">
                    <label className="text-[10px] font-mono text-drxred uppercase font-black tracking-mega block">
                      External Image URL (optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/product.jpg"
                      className="w-full bg-black/60 border border-ui p-4 text-[11px] font-mono text-zinc-300 outline-none focus:border-drxred rounded-sm"
                      value={(formData.imageUrl as string) || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setImageError(null);
                        setFormData(prev => ({ ...prev, imageUrl: v }));
                      }}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="flex-1 bg-white/5 border border-ui text-white py-3 text-[10px] font-mono font-black uppercase tracking-mega hover:bg-drxred transition-all disabled:opacity-50"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        disabled={!formData.imageUrl}
                      >
                        Clear URL
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-black border border-drxred text-drxred py-3 text-[10px] font-mono font-black uppercase tracking-mega hover:bg-drxred hover:text-white transition-all"
                        onClick={() => setImageError(null)}
                      >
                        Use URL
                      </button>
                    </div>
                    <p className="text-[9px] font-mono text-muted uppercase tracking-widest">
                      If URL is set, preview will use it first.
                    </p>
                  </div>

                  <div className="p-6 bg-black/40 border border-ui space-y-6 rounded-sm">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-drxred uppercase font-black tracking-mega block">Background Matrix Theme</label>
                      <select
                        className="w-full bg-black/60 border border-ui p-3 text-[11px] font-mono text-zinc-300 outline-none focus:border-drxred h-[46px] rounded-sm"
                        value={selectedTheme}
                        onChange={(e) => setSelectedTheme(e.target.value)}
                      >
                        {BG_THEMES.map(theme => (
                          <option key={theme.id} value={theme.prompt}>{theme.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-drxred uppercase font-black tracking-mega block">Neural Edit protocol</label>
                      <textarea
                        value={aiEditPrompt}
                        onChange={e => setAiEditPrompt(e.target.value)}
                        placeholder="e.g. Modify container gloss, add steam effects, change labeling..."
                        className="w-full bg-black/60 border border-ui p-4 text-[11px] font-mono text-zinc-300 outline-none focus:border-drxred resize-none tracking-tight leading-relaxed"
                        rows={3}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAiEdit}
                      disabled={isGeneratingImage || !formData.image}
                      className="w-full bg-white/5 border border-ui text-white py-4 text-[10px] font-mono font-black uppercase tracking-mega hover:bg-drxred transition-all shadow-lg disabled:opacity-50"
                    >
                      Apply Neural Modification
                    </button>
                  </div>
                </div>

                <button className="w-full bg-drxred text-white py-6 font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all text-xs shadow-2xl">
                  INITIALIZE UNIT DEPLOYMENT
                </button>
              </div>

              <div className="col-span-12 lg:col-span-7 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega">Designation [EN]</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-black/40 border border-ui p-4 text-sm font-bold outline-none focus:border-drxred rounded-sm"
                      value={formData.name_en || ''}
                      onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega">Designation [AR]</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-black/40 border border-ui p-4 text-lg text-right font-bold outline-none focus:border-drxred rounded-sm"
                      value={formData.name_ar || ''}
                      onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega">Technical Spec [EN]</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-black/40 border border-ui p-4 text-sm outline-none focus:border-drxred resize-none rounded-sm"
                      value={formData.description_en || ''}
                      onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega">Technical Spec [AR]</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-black/40 border border-ui p-4 text-right text-sm outline-none focus:border-drxred resize-none rounded-sm"
                      value={formData.description_ar || ''}
                      onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega">Value (LE)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      className="w-full bg-black/40 border border-ui p-4 text-lg font-oswald font-bold outline-none focus:border-drxred rounded-sm"
                      value={formData.price || 0}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega">Matrix Category</label>
                    <select
                      className="w-full bg-black/40 border border-ui p-4 text-sm outline-none focus:border-drxred h-[58px] rounded-sm"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                    >
                      {Object.values(Category).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted uppercase font-bold tracking-mega">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-black/40 border border-ui p-4 text-lg font-oswald font-bold outline-none focus:border-drxred rounded-sm"
                      value={formData.featured || 1}
                      onChange={e => setFormData({ ...formData, featured: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <label className="flex items-center gap-4 p-5 bg-black/40 border border-ui cursor-pointer hover:border-drxred transition-all group rounded-sm">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-drxred"
                      checked={formData.inStock}
                      onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                    />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-mega text-muted group-hover:text-white transition-colors">In Stock</span>
                  </label>
                  <label className="flex items-center gap-4 p-5 bg-black/40 border border-ui cursor-pointer hover:border-drxred transition-all group rounded-sm">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-drxred"
                      checked={formData.isNew}
                      onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                    />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-mega text-muted group-hover:text-white transition-colors">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-4 p-5 bg-black/40 border border-ui cursor-pointer hover:border-drxred transition-all group rounded-sm">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-drxred"
                      checked={formData.isBestSeller}
                      onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-mega text-muted group-hover:text-white transition-colors">Best Seller</span>
                  </label>
                </div>

                <div className="space-y-3 p-6 bg-black/30 border border-ui rounded-sm">
                  <label className="text-[10px] font-mono text-drxred uppercase font-black tracking-mega block">Fitness Objective Tags</label>
                  <div className="flex flex-wrap gap-3">
                    {GOALS.map(goal => (
                      <label
                        key={goal}
                        className={`px-5 py-3 border cursor-pointer text-[10px] font-mono uppercase font-bold tracking-mega transition-all rounded-sm ${
                          formData.goals?.includes(goal) ? 'bg-drxred border-drxred text-white' : 'border-ui text-muted hover:text-white hover:border-white/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.goals?.includes(goal)}
                          onChange={e => {
                            const currentGoals = formData.goals || [];
                            setFormData({
                              ...formData,
                              goals: e.target.checked
                                ? [...currentGoals, goal]
                                : currentGoals.filter(g => g !== goal)
                            });
                          }}
                        />
                        {goal}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
