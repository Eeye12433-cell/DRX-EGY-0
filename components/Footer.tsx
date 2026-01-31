import React from 'react';
const Footer: React.FC<{
  lang: 'ar' | 'en';
}> = ({
  lang
}) => {
  return <footer className="bg-bg-secondary border-t border-drxred/20 py-16 opacity-100">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-start">
        <div className="md:col-span-1">
          <h3 className="text-2xl font-black font-oswald text-white mb-4">DRX<span className="text-drxred">EGYPT</span></h3>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest leading-relaxed">
            {lang === 'ar' ? 'مركز التوزيع الرسمي' : 'Official Distribution Center'}<br />
            Nature's Rule Egypt<br />
            Tax ID: 552-331-333
          </p>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-drxred mb-4">
            {lang === 'ar' ? 'النظام البيئي' : 'Ecosystem'}
          </h4>
          <ul className="text-xs font-mono uppercase space-y-2 text-zinc-500">
            <li><a href="#/shop" className="hover:text-white transition-colors">{lang === 'ar' ? 'المنتجات' : 'Products'}</a></li>
            <li><a href="#/calculator" className="hover:text-white transition-colors">{lang === 'ar' ? 'علوم الـ AI' : 'AI Science'}</a></li>
            <li><a href="#/verify" className="hover:text-white transition-colors">{lang === 'ar' ? 'التحقق' : 'Verification'}</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-drxred mb-4">
            {lang === 'ar' ? 'قانوني' : 'Legal'}
          </h4>
          <ul className="text-xs font-mono uppercase space-y-2 text-zinc-500">
            <li><a href="#/policies/privacy" className="hover:text-white transition-colors">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a></li>
            <li><a href="#/policies/terms" className="hover:text-white transition-colors">{lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}</a></li>
            <li><a href="#/policies/refund" className="hover:text-white transition-colors">{lang === 'ar' ? 'سياسة الاسترجاع' : 'Refund Policy'}</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-drxred mb-4">
            {lang === 'ar' ? 'اتصل بنا' : 'Contact'}
          </h4>
          <p className="text-xs font-mono text-zinc-500 uppercase">
            {lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}<br />
            Support@drxegypt.com
          </p>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center">
        <p className="text-zinc-700 uppercase tracking-[0.5em] font-sans text-sm">
          © 2026 Nature's Rule Egypt. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
        </p>
      </div>
    </footer>;
};
export default Footer;