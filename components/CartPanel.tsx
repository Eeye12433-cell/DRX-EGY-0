import React from 'react';
import { CartItem } from '../types';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClear: () => void;
  lang: 'ar' | 'en';
  onCheckout: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
  isOpen,
  onClose,
  cart,
  onRemove,
  onUpdateQuantity,
  onClear,
  lang,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[500]">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-full sm:w-[480px] bg-bg-card border-l border-white/10 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-oswald uppercase tracking-tight">
            {lang === 'ar' ? 'سلة' : 'Cart'} <span className="text-drxred">{lang === 'ar' ? 'الشراء' : 'Panel'}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            [ {lang === 'ar' ? 'إغلاق' : 'Close'} ]
          </button>
        </div>

        <div className="p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-zinc-600 font-mono text-[10px] uppercase tracking-mega">
              {lang === 'ar' ? 'السلة فارغة' : 'Cart is empty'}
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 border border-white/10 p-4 bg-black/20">
                <img
                  src={item.product.imageUrl || item.product.image}
                  className="w-16 h-16 object-cover border border-white/5"
                  alt=""
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src !== item.product.image) img.src = item.product.image;
                  }}
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-oswald uppercase tracking-tight text-lg leading-tight">
                        {lang === 'ar' ? item.product.name_ar : item.product.name_en}
                      </div>
                      <div className="text-drxred font-oswald text-xl font-bold mt-1">
                        {item.product.price.toLocaleString()} <span className="text-xs">LE</span>
                      </div>
                      {!!item.product.subscription && (
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-2">
                          {lang === 'ar'
                            ? `اشتراك كل ${item.product.subscription} يوم`
                            : `Auto every ${item.product.subscription} days`}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 hover:text-drxred transition-colors"
                    >
                      [ {lang === 'ar' ? 'حذف' : 'Remove'} ]
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-8 h-8 border border-white/10 bg-black hover:border-drxred transition-colors text-white"
                      >
                        -
                      </button>
                      <div className="w-10 text-center font-mono text-xs">{item.quantity}</div>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-8 h-8 border border-white/10 bg-black hover:border-drxred transition-colors text-white"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-oswald text-xl">
                      {(item.product.price * item.quantity).toLocaleString()} <span className="text-xs">LE</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {cart.length > 0 && (
            <>
              <div className="flex justify-between items-center border-t border-white/10 pt-6">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-mega">
                  {lang === 'ar' ? 'الإجمالي' : 'Total'}
                </span>
                <span className="text-2xl font-oswald font-bold">
                  {total.toLocaleString()} <span className="text-xs">LE</span>
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClear}
                  className="flex-1 border border-white/10 bg-black text-zinc-400 py-4 font-mono text-[10px] uppercase tracking-widest hover:border-drxred hover:text-white transition-all"
                >
                  {lang === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}
                </button>
                <button
                  onClick={onCheckout}
                  className="flex-1 bg-drxred text-white py-4 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all btn-drx"
                >
                  {lang === 'ar' ? 'إتمام الشراء' : 'Checkout'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
