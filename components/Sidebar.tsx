
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  onNavigate: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, lang, onNavigate }) => {
  const sections = [
    {
      title: lang === 'ar' ? 'التسوق' : 'SHOP',
      links: [
        { label_ar: 'وصل حديثاً', label_en: 'New Arrivals', path: '/shop/new' },
        { label_ar: 'الأكثر مبيعاً', label_en: 'Best Sellers', path: '/shop/best' },
        { label_ar: 'تسوق حسب الهدف', label_en: 'Shop by Goal', path: '/shop/goals' },
        { label_ar: 'تسوق حسب الفئة', label_en: 'Shop by Category', path: '/shop/categories' },
        { label_ar: 'جميع المنتجات', label_en: 'All Products', path: '/shop' },
      ]
    },
    {
      title: lang === 'ar' ? 'الدعم' : 'SUPPORT',
      links: [
        { label_ar: 'حاسبة التغذية AI', label_en: 'AI Nutrition Calculator', path: '/calculator' },
        { label_ar: 'التحقق من المنتج', label_en: 'Product Verification', path: '/verify' },
        { label_ar: 'تواصل معنا', label_en: 'Contact Us', path: '/contact' },
      ]
    },
    {
      title: lang === 'ar' ? 'السياسات' : 'POLICIES',
      links: [
        { label_ar: 'سياسة الشحن', label_en: 'Shipping Policy', path: '/policies/shipping' },
        { label_ar: 'سياسة الاسترجاع', label_en: 'Refund Policy', path: '/policies/refund' },
        { label_ar: 'سياسة الخصوصية', label_en: 'Privacy Policy', path: '/policies/privacy' },
        { label_ar: 'شروط الخدمة', label_en: 'Terms of Service', path: '/policies/terms' },
      ]
    }
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/80 z-[140] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />
      <aside 
        className={`fixed ${lang === 'ar' ? 'right-0' : 'left-0'} top-0 h-full w-[320px] bg-bg-secondary z-[150] border-x border-white/5 transition-transform duration-500 p-8 overflow-y-auto ${isOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}
      >
        <div className="flex justify-between items-center mb-12">
            <h3 className="text-2xl font-black font-oswald uppercase text-drxred">DRX<span className="text-white">EGYPT</span></h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>
        
        <div className="space-y-10">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h4 className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.3em] border-b border-white/5 pb-2">
                {section.title}
              </h4>
              <nav className="space-y-2">
                {section.links.map(link => (
                  <button 
                    key={link.path}
                    onClick={() => onNavigate(link.path)}
                    className="block w-full text-start text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-drxred transition-all py-2 hover:translate-x-2 rtl:hover:-translate-x-2"
                  >
                    {lang === 'ar' ? link.label_ar : link.label_en}
                  </button>
                ))}
              </nav>
            </div>
          ))}
          
          <div className="pt-8 border-t border-white/5">
             <button 
                onClick={() => onNavigate('/admin')}
                className="w-full border border-drxred/30 py-4 text-[10px] font-mono uppercase tracking-widest text-drxred hover:bg-drxred hover:text-white transition-all font-bold"
             >
                {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Terminal'}
             </button>
          </div>
        </div>

        <div className="mt-16 text-[9px] font-mono text-zinc-700 uppercase leading-relaxed tracking-widest">
          Nature's Rule Egypt<br/>
          German Performance Hub<br/>
          Tax ID: 552-331-333
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
