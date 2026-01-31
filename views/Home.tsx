import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import drxLogo from '@/assets/drx-logo.jpeg';

interface HomeProps {
  lang: 'ar' | 'en';
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  const navigate = useNavigate();
  const isRTL = lang === 'ar';

  const copy = useMemo(() => {
    return {
      badge: isRTL ? 'الموزّع الرسمي المعتمد' : 'Official Certified Hub',
      title1: isRTL ? 'أداء' : 'German',
      title2: isRTL ? 'ألماني' : 'Performance',
      title3: isRTL ? 'فائق' : 'Engineering',
      subtitle: isRTL
        ? 'منتجات ألمانية أصلية — أداء أعلى، نتائج أسرع، وثقة مضمونة داخل مصر.'
        : 'Original German products — higher performance, faster results, trusted inside Egypt.',
      btnShop: isRTL ? 'تصفّح المتجر' : 'Shop Products',
      btnNew: isRTL ? 'وصل حديثاً' : 'New Arrivals'
    };
  }, [isRTL]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* FULL-BLEED HERO (Break out of container) */}
      <section className="-mt-24 w-screen relative left-1/2 -translate-x-1/2 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={drxLogo}
            alt="DRX Egypt"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 35%' }}
            loading="eager"
            decoding="async"
          />

          {/* Dark overlay for readability (works in both themes) */}
          <div className="absolute inset-0 bg-black/55" />

          {/* Bottom gradient to blend into page background */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-20 mx-auto px-6 flex justify-start">
          <div
            className="max-w-4xl p-8 md:p-12 border border-white/10 shadow-2xl"
            style={{
              background: 'rgba(225, 29, 72, 0.92)',
              clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)'
            }}
          >
            {/* Badge */}
            <span className="bg-black text-white px-4 py-2 font-mono text-sm uppercase mb-4 inline-block font-semibold tracking-wider">
              {copy.badge}
            </span>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-oswald text-white uppercase leading-none mb-6">
              {copy.title1} <br />
              <span className="text-black">{copy.title2}</span>
              <br />
              {copy.title3}
            </h1>

            {/* Subtitle */}
            <p className="text-white text-lg md:text-xl mb-8 font-semibold max-w-xl leading-relaxed">
              {copy.subtitle}
            </p>

            {/* Buttons */}
            <div className="flex gap-4 flex-wrap">
              <button
                className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all text-sm"
                onClick={() => navigate('/shop')}
              >
                {copy.btnShop}
              </button>

              <button
                className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all text-sm"
                onClick={() => navigate('/shop/new')}
              >
                {copy.btnNew}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* (اختياري) مساحة صغيرة بعد الهيرو عشان مايبقاش لازق */}
      <div className="h-10" />
    </div>
  );
};

export default Home;
