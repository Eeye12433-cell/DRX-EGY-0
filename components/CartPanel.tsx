
import React from 'react';
import { CartItem } from '../types';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  lang: 'ar' | 'en';
  onCheckout: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ 
  isOpen, onClose, cart, onRemove, onUpdateQuantity, onClearCart, lang, onCheckout 
}) => {
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[199] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />
      <aside 
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-bg-secondary z-[200] border-l border-white/10 transition-transform duration-500 shadow-2xl p-6 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h2 className="text-2xl font-oswald uppercase tracking-tight">Shopping <span className="text-drxred">Cart</span></h2>
          <div className="flex items-center gap-4">
            {cart.length > 0 && (
              <button 
                onClick={onClearCart}
                className="text-[10px] font-mono uppercase text-zinc-500 hover:text-drxred transition-colors"
              >
                [{lang === 'ar' ? 'مسح السلة' : 'Clear All'}]
              </button>
            )}
            <button onClick={onClose} className="text-xs font-mono uppercase text-zinc-500 hover:text-white transition-colors">[Close]</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-500 font-mono text-sm uppercase">{lang === 'ar' ? 'السلة فارغة' : 'Empty Cart'}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 p-4 bg-bg-card border border-white/5 group relative">
                <img src={item.product.image} className="w-16 h-16 object-cover border border-white/5" alt="" />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[11px] font-bold uppercase tracking-tight max-w-[150px]">
                      {lang === 'ar' ? item.product.name_ar : item.product.name_en}
                    </h4>
                    <button 
                      onClick={() => onRemove(item.product.id)}
                      className="text-zinc-700 hover:text-drxred transition-colors text-[9px] uppercase font-mono"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-drxred/20 hover:text-drxred transition-all text-xs"
                      >
                        -
                      </button>
                      <span className="text-[10px] font-mono min-w-[20px] text-center font-bold">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-drxred/20 hover:text-drxred transition-all text-xs"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-drxred font-oswald text-lg leading-none">
                      {(item.product.price * item.quantity).toLocaleString()} <span className="text-[10px] font-mono">LE</span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-8 border-t border-white/10 mt-6">
          <div className="flex justify-between items-end mb-6">
            <span className="text-xs font-mono uppercase text-zinc-500">Total Matrix Value</span>
            <span className="text-4xl font-oswald text-drxred font-bold">{total.toLocaleString()} <span className="text-lg">LE</span></span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="btn-drx w-full bg-white text-black py-5 font-black uppercase tracking-[0.4em] text-xs hover:bg-drxred hover:text-white transition-colors shadow-2xl disabled:opacity-50"
          >
            {lang === 'ar' ? 'إتمام الشراء' : 'Secure Checkout'}
          </button>
          <p className="text-[10px] text-zinc-600 font-mono mt-4 text-center uppercase tracking-widest opacity-60">
            {lang === 'ar' ? 'شحن مجاني للطلبات فوق 5000 ج.م' : 'Free shipping on orders over 5000 LE'}
          </p>
        </div>
      </aside>
    </>
  );
};

export default CartPanel;
