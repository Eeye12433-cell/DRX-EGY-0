
import React, { useState } from 'react';
import { CartItem, ShippingInfo, Order, OrderStatus, StripeConfig } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  stripeConfig: StripeConfig;
  lang: 'ar' | 'en';
  onOrderComplete: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, onClose, cart, stripeConfig, lang, onOrderComplete 
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    email: '',
    method: 'delivery',
    address: ''
  });

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleNextStep = () => {
    if (step === 1) {
      if (!shipping.fullName || !shipping.phone || !shipping.email || (shipping.method === 'delivery' && !shipping.address)) {
        alert(lang === 'ar' ? 'يرجى إكمال جميع الحقول' : 'Please fill all required fields');
        return;
      }
      setStep(2);
    }
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate Stripe Payment processing
    setTimeout(() => {
      const trackingNumber = `DRX-TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
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
    }, 2000);
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
                  <input type="text" className="w-full bg-black border border-white/10 p-3 text-sm outline-none focus:border-drxred" value={shipping.fullName} onChange={e => setShipping({...shipping, fullName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Phone Number</label>
                  <input type="text" className="w-full bg-black border border-white/10 p-3 text-sm outline-none focus:border-drxred" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Email Address</label>
                <input type="email" className="w-full bg-black border border-white/10 p-3 text-sm outline-none focus:border-drxred" value={shipping.email} onChange={e => setShipping({...shipping, email: e.target.value})} />
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Delivery Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShipping({...shipping, method: 'delivery'})}
                    className={`p-4 border font-mono text-[10px] uppercase transition-all ${shipping.method === 'delivery' ? 'bg-drxred border-drxred text-white' : 'bg-black border-white/5 text-zinc-600'}`}
                  >
                    Home Delivery
                  </button>
                  <button 
                    onClick={() => setShipping({...shipping, method: 'pickup'})}
                    className={`p-4 border font-mono text-[10px] uppercase transition-all ${shipping.method === 'pickup' ? 'bg-drxred border-drxred text-white' : 'bg-black border-white/5 text-zinc-600'}`}
                  >
                    Store Pickup
                  </button>
                </div>
              </div>

              {shipping.method === 'delivery' && (
                <div className="space-y-1 animate-in fade-in duration-300">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Full Shipping Address</label>
                  <textarea rows={3} className="w-full bg-black border border-white/10 p-3 text-sm outline-none focus:border-drxred resize-none" value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} />
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

              {!stripeConfig.enabled ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 text-center">
                  <p className="text-xs font-mono text-yellow-500 uppercase tracking-widest">Stripe Gateway Not Configured</p>
                  <p className="text-[9px] text-zinc-500 mt-2">Administrator must enable payments in terminal.</p>
                </div>
              ) : (
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
                      <input required type="text" placeholder="Card Number" className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-sm outline-none focus:border-drxred" />
                      <div className="grid grid-cols-2 gap-4">
                        <input required type="text" placeholder="MM / YY" className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-sm outline-none focus:border-drxred" />
                        <input required type="text" placeholder="CVC" className="w-full bg-transparent border-b border-white/10 py-2 font-mono text-sm outline-none focus:border-drxred" />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-drxred text-white py-4 font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Authorizing...</>
                    ) : `Pay ${total.toLocaleString()} LE Now`}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-mono text-zinc-600 uppercase hover:text-zinc-300">Back to Shipping</button>
                </form>
              )}
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
