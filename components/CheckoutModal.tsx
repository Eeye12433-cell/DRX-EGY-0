import React, { useState } from 'react';
import { CartItem, ShippingInfo, Order, OrderStatus } from '../types';
import { validateShippingForm, ShippingFormData } from '../src/lib/validations';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  lang: 'ar' | 'en';
  onOrderComplete: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, onClose, cart, lang, onOrderComplete 
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    email: '',
    method: 'delivery',
    address: ''
  });

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShipping(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      const formData: ShippingFormData = {
        fullName: shipping.fullName,
        phone: shipping.phone,
        email: shipping.email,
        address: shipping.address || '',
        method: shipping.method,
      };

      const validation = validateShippingForm(formData);
      
      if (!validation.success) {
        setErrors(validation.errors);
        return;
      }

      setErrors({});
      setStep(2);
    }
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trackingNumber = `DRX-TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          tracking_number: trackingNumber,
          total,
          status: 'Pending',
          shipping_full_name: shipping.fullName,
          shipping_phone: shipping.phone,
          shipping_email: shipping.email || null,
          shipping_address: shipping.address || null,
          shipping_method: shipping.method === 'pickup' ? 'pickup' : 'delivery',
          user_id: user?.id || null
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id.startsWith('prod-') ? null : item.product.id,
        product_name: item.product.name_en,
        product_price: item.product.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const newOrder: Order = {
        id: order.id,
        trackingNumber,
        items: [...cart],
        total,
        shippingInfo: shipping,
        status: OrderStatus.Pending,
        createdAt: new Date().toISOString()
      };
      
      onOrderComplete(newOrder);
      setLoading(false);
      setStep(3);
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
      alert(lang === 'ar' ? 'حدث خطأ أثناء إتمام الطلب' : 'An error occurred during checkout');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-bg-card border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
          <h2 className="text-2xl font-black font-oswald uppercase tracking-tight">Secure <span className="text-drxred">Checkout</span></h2>
          <button onClick={onClose} className="text-[10px] font-mono uppercase text-zinc-500 hover:text-white transition-colors">[ Cancel ]</button>
        </div>

        <div className="flex bg-black/60 border-b border-white/5">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 py-3 text-center text-[10px] font-mono uppercase tracking-widest ${step === s ? 'text-drxred border-b-2 border-drxred' : 'text-zinc-700'}`}>
              Step 0{s}
            </div>
          ))}
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-oswald uppercase mb-4">{lang === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    className={`w-full bg-black border p-3 text-sm outline-none focus:border-drxred ${errors.fullName ? 'border-red-500' : 'border-white/10'}`}
                    value={shipping.fullName} 
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    maxLength={100}
                  />
                  {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Phone Number</label>
                  <input 
                    type="tel" 
                    className={`w-full bg-black border p-3 text-sm outline-none focus:border-drxred ${errors.phone ? 'border-red-500' : 'border-white/10'}`}
                    value={shipping.phone} 
                    onChange={e => handleInputChange('phone', e.target.value)}
                    maxLength={20}
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Email Address</label>
                <input 
                  type="email" 
                  className={`w-full bg-black border p-3 text-sm outline-none focus:border-drxred ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                  value={shipping.email} 
                  onChange={e => handleInputChange('email', e.target.value)}
                  maxLength={255}
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Delivery Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleInputChange('method', 'delivery')}
                    className={`p-4 border font-mono text-[10px] uppercase transition-all ${shipping.method === 'delivery' ? 'bg-drxred border-drxred text-white' : 'bg-black border-white/5 text-zinc-600'}`}
                  >
                    Home Delivery
                  </button>
                  <button 
                    onClick={() => handleInputChange('method', 'pickup')}
                    className={`p-4 border font-mono text-[10px] uppercase transition-all ${shipping.method === 'pickup' ? 'bg-drxred border-drxred text-white' : 'bg-black border-white/5 text-zinc-600'}`}
                  >
                    Store Pickup
                  </button>
                </div>
              </div>

              {shipping.method === 'delivery' && (
                <div className="space-y-1 animate-in fade-in duration-300">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Full Shipping Address</label>
                  <textarea 
                    rows={3} 
                    className={`w-full bg-black border p-3 text-sm outline-none focus:border-drxred resize-none ${errors.address ? 'border-red-500' : 'border-white/10'}`}
                    value={shipping.address} 
                    onChange={e => handleInputChange('address', e.target.value)}
                    maxLength={500}
                  />
                  {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>}
                </div>
              )}

              <button onClick={handleNextStep} className="w-full bg-white text-black py-4 font-black uppercase tracking-widest text-xs hover:bg-drxred hover:text-white transition-all mt-6">
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <h3 className="text-xl font-oswald uppercase">{lang === 'ar' ? 'الدفع الإلكتروني' : 'Secure Payment'}</h3>
                <div className="text-right">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase">Total Amount</p>
                  <p className="text-3xl font-oswald text-drxred font-bold">{total.toLocaleString()} <span className="text-sm">LE</span></p>
                </div>
              </div>

              <form onSubmit={processPayment} className="space-y-6">
                <div className="p-6 bg-black border border-white/10 rounded-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Card Details</span>
                    <div className="flex gap-2 opacity-50">
                      <div className="w-8 h-5 bg-white/10 rounded"></div>
                      <div className="w-8 h-5 bg-white/10 rounded"></div>
                    </div>
                  </div>
                  {/* Simulated Stripe Input */}
                  <div className="space-y-4">
                    <input required type="text" placeholder="Card Number" className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-sm outline-none focus:border-drxred" maxLength={19} />
                    <div className="grid grid-cols-2 gap-4">
                      <input required type="text" placeholder="MM / YY" className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-sm outline-none focus:border-drxred" maxLength={7} />
                      <input required type="text" placeholder="CVC" className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-sm outline-none focus:border-drxred" maxLength={4} />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-drxred text-white py-5 font-black uppercase tracking-[0.3em] text-sm hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      {lang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                    </span>
                  ) : (
                    lang === 'ar' ? `دفع ${total.toLocaleString()} جنيه` : `Pay ${total.toLocaleString()} LE`
                  )}
                </button>

                <p className="text-[9px] font-mono text-zinc-600 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                  <span>🔒</span> Secure Encrypted Transaction
                </p>
              </form>
              <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-mono text-zinc-600 uppercase hover:text-zinc-300 mt-4">Back to Shipping</button>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 text-center space-y-8 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl text-green-500">✓</span>
              </div>
              <div>
                <h3 className="text-3xl font-black font-oswald uppercase text-white mb-2">Order <span className="text-drxred">Deployed</span></h3>
                <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Transaction Verified via Stripe Matrix</p>
              </div>
              
              <div className="bg-black/40 border border-white/5 p-6 max-w-sm mx-auto">
                 <p className="text-[10px] font-mono text-zinc-600 uppercase mb-2">Tracking Identifier</p>
                 <p className="text-2xl font-oswald text-white tracking-widest font-bold">#ORD-{Date.now().toString().slice(-6)}</p>
                 <div className="mt-4 pt-4 border-t border-white/5">
                   <p className="text-[10px] text-zinc-400 font-inter italic">Please save this ID for delivery status telemetry.</p>
                 </div>
              </div>

              <button onClick={onClose} className="btn-drx bg-white text-black px-12 py-4 font-bold uppercase tracking-widest text-xs hover:bg-drxred hover:text-white transition-all">
                Return to Matrix
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
