import React, { useState } from 'react';
import { CartItem, ShippingInfo, Order, OrderStatus } from '../types';
import { validateShippingForm, ShippingFormData } from '../src/lib/validations';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';

type PaymentMethod = 'cod' | 'vodafone_cash' | 'instapay' | 'fawry';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  onOrderComplete: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen, onClose, lang, onOrderComplete
}) => {
  const { cart, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    email: '',
    method: 'delivery',
    address: '',
    city: ''
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = shipping.method === 'delivery' ? 50 : 0;
  const total = subtotal + deliveryFee;

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShipping(prev => ({ ...prev, [field]: value }));
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
        method: shipping.method as 'delivery' | 'pickup',
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

  const processOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate cryptographically secure tracking token
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      const trackingToken = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
      const trackingNumber = `DRX-TRK-${trackingToken.substring(0, 12).toUpperCase()}`;

      const { data: { user } } = await supabase.auth.getUser();

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

      clearCart();
      onOrderComplete(newOrder);
      setCompletedOrder(newOrder);
      setLoading(false);
      setStep(3);
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
      alert(lang === 'ar' ? 'حدث خطأ أثناء إتمام الطلب' : 'An error occurred during checkout');
    }
  };

  if (!isOpen) {
    // Reset state when modal is closed
    return null;
  }

  const paymentMethods = [
    {
      id: 'cod' as PaymentMethod,
      name: lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery',
      icon: '💵',
      desc: lang === 'ar' ? 'ادفع نقداً عند استلام طلبك' : 'Pay cash when you receive your order'
    },
    {
      id: 'vodafone_cash' as PaymentMethod,
      name: 'Vodafone Cash',
      icon: '📱',
      desc: lang === 'ar' ? 'حوّل المبلغ على الرقم: 01012345678' : 'Transfer to: 01012345678'
    },
    {
      id: 'instapay' as PaymentMethod,
      name: 'InstaPay',
      icon: '🏦',
      desc: lang === 'ar' ? 'حوّل على: drx.egypt@instapay' : 'Transfer to: drx.egypt@instapay'
    },
    {
      id: 'fawry' as PaymentMethod,
      name: 'Fawry',
      icon: '🟡',
      desc: lang === 'ar' ? 'ادفع نقداً في أي فرع فوري بالكود' : 'Pay cash at any Fawry branch with code'
    }
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-bg-card border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
          <h2 className="text-2xl font-black font-oswald uppercase tracking-tight">
            {lang === 'ar' ? 'إتمام' : 'Secure'} <span className="text-drxred">{lang === 'ar' ? 'الطلب' : 'Checkout'}</span>
          </h2>
          <button onClick={onClose} className="text-[10px] font-mono uppercase text-zinc-500 hover:text-white transition-colors">[ {lang === 'ar' ? 'إلغاء' : 'Cancel'} ]</button>
        </div>

        <div className="flex bg-black/60 border-b border-white/5">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 py-3 text-center text-[10px] font-mono uppercase tracking-widest ${step === s ? 'text-drxred border-b-2 border-drxred' : 'text-zinc-700'}`}>
              {lang === 'ar' ? `خطوة ${s}` : `Step 0${s}`}
            </div>
          ))}
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-oswald uppercase mb-4">{lang === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
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
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                  <input
                    type="tel"
                    className={`w-full bg-black border p-3 text-sm outline-none focus:border-drxred ${errors.phone ? 'border-red-500' : 'border-white/10'}`}
                    value={shipping.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    maxLength={20}
                    placeholder="01xxxxxxxxx"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} ({lang === 'ar' ? 'اختياري' : 'Optional'})</label>
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
                <label className="text-[9px] font-mono text-zinc-500 uppercase">{lang === 'ar' ? 'طريقة التوصيل' : 'Delivery Method'}</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('method', 'delivery')}
                    className={`p-4 border font-mono text-[10px] uppercase transition-all ${shipping.method === 'delivery' ? 'bg-drxred border-drxred text-white' : 'bg-black border-white/5 text-zinc-600 hover:border-white/20'}`}
                  >
                    🚚 {lang === 'ar' ? 'توصيل للمنزل' : 'Home Delivery'}
                    <span className="block text-[8px] mt-1 opacity-70">+50 LE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('method', 'pickup')}
                    className={`p-4 border font-mono text-[10px] uppercase transition-all ${shipping.method === 'pickup' ? 'bg-drxred border-drxred text-white' : 'bg-black border-white/5 text-zinc-600 hover:border-white/20'}`}
                  >
                    🏪 {lang === 'ar' ? 'استلام من المتجر' : 'Store Pickup'}
                    <span className="block text-[8px] mt-1 opacity-70">{lang === 'ar' ? 'مجاناً' : 'Free'}</span>
                  </button>
                </div>
              </div>

              {shipping.method === 'delivery' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase">{lang === 'ar' ? 'المحافظة' : 'City/Governorate'}</label>
                    <select
                      className="w-full bg-black border border-white/10 p-3 text-sm outline-none focus:border-drxred"
                      value={shipping.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                    >
                      <option value="">{lang === 'ar' ? 'اختر المحافظة' : 'Select City'}</option>
                      <option value="cairo">{lang === 'ar' ? 'القاهرة' : 'Cairo'}</option>
                      <option value="giza">{lang === 'ar' ? 'الجيزة' : 'Giza'}</option>
                      <option value="alexandria">{lang === 'ar' ? 'الإسكندرية' : 'Alexandria'}</option>
                      <option value="other">{lang === 'ar' ? 'محافظات أخرى' : 'Other Governorates'}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase">{lang === 'ar' ? 'العنوان بالتفصيل' : 'Full Address'}</label>
                    <textarea
                      rows={3}
                      className={`w-full bg-black border p-3 text-sm outline-none focus:border-drxred resize-none ${errors.address ? 'border-red-500' : 'border-white/10'}`}
                      value={shipping.address}
                      onChange={e => handleInputChange('address', e.target.value)}
                      maxLength={500}
                      placeholder={lang === 'ar' ? 'الشارع، المبنى، الطابق، الشقة' : 'Street, Building, Floor, Apartment'}
                    />
                    {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>}
                  </div>
                </div>
              )}

              <button onClick={handleNextStep} className="w-full bg-white text-black py-4 font-black uppercase tracking-widest text-xs hover:bg-drxred hover:text-white transition-all mt-6">
                {lang === 'ar' ? 'متابعة للدفع' : 'Continue to Payment'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Order Summary */}
              <div className="bg-black/40 border border-white/5 p-4 rounded-sm">
                <h4 className="text-[10px] font-mono text-zinc-500 uppercase mb-3">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h4>
                <div className="space-y-2 text-sm">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-zinc-400">
                      <span>{item.quantity}x {lang === 'ar' ? item.product.name_ar : item.product.name_en}</span>
                      <span>{(item.product.price * item.quantity).toLocaleString()} LE</span>
                    </div>
                  ))}
                  <div className="border-t border-white/5 pt-2 mt-2">
                    <div className="flex justify-between text-zinc-500 text-xs">
                      <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span>{subtotal.toLocaleString()} LE</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 text-xs">
                      <span>{lang === 'ar' ? 'التوصيل' : 'Delivery'}</span>
                      <span>{deliveryFee > 0 ? `${deliveryFee} LE` : (lang === 'ar' ? 'مجاناً' : 'Free')}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg mt-2">
                      <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                      <span className="text-drxred">{total.toLocaleString()} LE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="text-xl font-oswald uppercase">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</h3>
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 border text-left transition-all flex items-start gap-4 ${paymentMethod === method.id
                          ? 'bg-drxred/10 border-drxred'
                          : 'bg-black border-white/10 hover:border-white/30'
                        }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${paymentMethod === method.id ? 'text-drxred' : 'text-white'}`}>
                          {method.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1">{method.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-drxred' : 'border-zinc-600'
                        }`}>
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-drxred" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Instructions */}
              {paymentMethod !== 'cod' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-sm animate-in fade-in duration-300">
                  <p className="text-yellow-500 text-xs font-mono uppercase tracking-widest mb-2">
                    {lang === 'ar' ? '⚠️ تعليمات الدفع' : '⚠️ Payment Instructions'}
                  </p>
                  <p className="text-zinc-400 text-sm">
                    {paymentMethod === 'vodafone_cash' && (
                      lang === 'ar'
                        ? 'قم بتحويل المبلغ الإجمالي على رقم فودافون كاش: 01012345678 ثم أرسل صورة التحويل على واتساب'
                        : 'Transfer the total amount to Vodafone Cash: 01012345678, then send the transfer screenshot via WhatsApp'
                    )}
                    {paymentMethod === 'instapay' && (
                      lang === 'ar'
                        ? 'قم بالتحويل على حساب انستاباي: drx.egypt@instapay ثم أرسل صورة التحويل على واتساب'
                        : 'Transfer to InstaPay account: drx.egypt@instapay, then send the transfer screenshot via WhatsApp'
                    )}
                    {paymentMethod === 'fawry' && (
                      lang === 'ar'
                        ? 'ستحصل على كود دفع فوري بعد تأكيد الطلب. اذهب لأي فرع فوري واستخدم الكود للدفع خلال 48 ساعة.'
                        : 'You will receive a Fawry payment code after order confirmation. Visit any Fawry branch and pay within 48 hours.'
                    )}
                  </p>
                </div>
              )}

              {/* Confirm Order */}
              <form onSubmit={processOrder} className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-drxred text-white py-5 font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      {lang === 'ar' ? 'جاري التأكيد...' : 'Processing...'}
                    </span>
                  ) : (
                    <>
                      {paymentMethod === 'cod'
                        ? (lang === 'ar' ? `تأكيد الطلب - الدفع عند الاستلام` : `Confirm Order - Pay on Delivery`)
                        : (lang === 'ar' ? `تأكيد الطلب - ${total.toLocaleString()} جنيه` : `Confirm Order - ${total.toLocaleString()} LE`)
                      }
                    </>
                  )}
                </button>

                <p className="text-[9px] font-mono text-zinc-600 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                  <span>🔒</span> {lang === 'ar' ? 'بياناتك محمية ومشفرة' : 'Your data is secure & encrypted'}
                </p>
              </form>

              <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-mono text-zinc-600 uppercase hover:text-zinc-300">
                {lang === 'ar' ? '← العودة للشحن' : '← Back to Shipping'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 text-center space-y-8 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl text-green-500">✓</span>
              </div>
              <div>
                <h3 className="text-3xl font-black font-oswald uppercase text-white mb-2">
                  {lang === 'ar' ? 'تم' : 'Order'} <span className="text-drxred">{lang === 'ar' ? 'الطلب بنجاح!' : 'Confirmed!'}</span>
                </h3>
                <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                  {paymentMethod === 'cod' && (lang === 'ar' ? 'سيتم التواصل معك لتأكيد الطلب' : 'We will contact you to confirm')}
                  {paymentMethod === 'fawry' && (lang === 'ar' ? 'اذهب لأي فرع فوري واستخدم كود الدفع' : 'Visit any Fawry branch and use the payment code')}
                  {(paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') && (lang === 'ar' ? 'برجاء إرسال صورة التحويل على واتساب' : 'Please send transfer proof via WhatsApp')}
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 p-6 max-w-sm mx-auto">
                <p className="text-[10px] font-mono text-zinc-600 uppercase mb-2">{lang === 'ar' ? 'رقم التتبع' : 'Tracking Number'}</p>
                <p className="text-xl font-oswald text-white tracking-widest font-bold">{completedOrder?.trackingNumber || 'DRX-TRK-XXXXXX'}</p>
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <p className="text-[10px] text-zinc-400 font-inter">
                    {lang === 'ar' ? 'احفظ هذا الرقم لتتبع طلبك' : 'Save this number to track your order'}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-drxred">
                    <span>📞</span>
                    <span className="font-mono text-sm">01012345678</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={(() => {
                    const orderItems = cart.map(item =>
                      `${item.quantity}x ${lang === 'ar' ? item.product.name_ar : item.product.name_en} (${item.product.price} LE)`
                    ).join('%0A');
                    const trackingNum = completedOrder?.trackingNumber || '';
                    const paymentLabel = paymentMethod === 'cod' ? (lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery')
                      : paymentMethod === 'vodafone_cash' ? 'Vodafone Cash'
                        : paymentMethod === 'instapay' ? 'InstaPay'
                          : 'Fawry';
                    const msg = lang === 'ar'
                      ? `مرحباً DRX! 🛒%0Aطلب جديد:%0A${orderItems}%0A%0Aالإجمالي: ${total.toLocaleString()} LE%0Aطريقة الدفع: ${paymentLabel}%0Aرقم التتبع: ${trackingNum}%0Aالاسم: ${encodeURIComponent(shipping.fullName)}%0Aالهاتف: ${shipping.phone}`
                      : `Hi DRX! 🛒%0ANew Order:%0A${orderItems}%0A%0ATotal: ${total.toLocaleString()} LE%0APayment: ${paymentLabel}%0ATracking: ${trackingNum}%0AName: ${encodeURIComponent(shipping.fullName)}%0APhone: ${shipping.phone}`;
                    return `https://wa.me/201012345678?text=${msg}`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-green-500 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>💬</span> {lang === 'ar' ? 'تأكيد عبر واتساب' : 'Confirm via WhatsApp'}
                </a>
                <button onClick={onClose} className="btn-drx bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-drxred hover:text-white transition-all">
                  {lang === 'ar' ? 'العودة للمتجر' : 'Back to Shop'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
