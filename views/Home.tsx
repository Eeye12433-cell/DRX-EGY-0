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
    const ar = {
      badge: 'الموزّع الرسمي المعتمد',
      titleTop: 'Dynamic Rebuild Xceed',
      titleMain1: 'أداء',
      titleMain2: 'ألماني',
      titleMain3: 'فائق',
      subtitle:
        'منتجات ألمانية أصلية — أداء أعلى، نتائج أسرع، وثقة مضمونة داخل مصر.',
      btnShop: 'تصفّح المتجر',
      btnNew: 'وصل حديثاً',

      // Stats
      stat1: '30+',
      stat1Label: 'سنوات من التميّز',
      stat2: 'GMP',
      stat2Label: 'جودة معتمدة',
      stat3: '100%',
      stat3Label: 'منتجات أصلية',
      stat4: '50K+',
      stat4Label: 'عملاء سعداء',

      // Why choose
      whyTitle: 'ليه تختار DRX؟',
      whySub: 'ثلاثة عقود من الخبرة في التغذية الرياضية',
      why1Title: 'جودة بريميوم',
      why1Desc: 'مكملات بمعايير GMP ومكونات مدروسة وموثوقة.',
      why2Title: 'منتجات أصلية',
      why2Desc: 'نظام تحقق ضد التقليد على كل منتج لسلامتك.',
      why3Title: 'موثوق عالميًا',
      why3Desc: 'خبرة 30+ سنة وثقة الرياضيين حول العالم.',

      // Testimonials
      testTitle: 'آراء الأبطال',
      testSub: 'نتائج حقيقية من رياضيين حقيقيين.',
      t1: 'مكملات DRX ساعدتني أكسر ثبات الأداء… الجودة والنتائج واضحة.',
      t2: 'جربت علامات كتير… DRX ثابتة وبتدي نفس النتيجة كل مرة.',
      t3: 'مكونات نظيفة وجودة مختبرة وأداء أقدر أعتمد عليه.',
      t4: 'من البروتين للبري-وركاوت… كل منتج فوق التوقعات.',
      role1: 'لاعب كمال أجسام',
      role2: 'CrossFit Athlete',
      role3: 'رفع أثقال',
      role4: 'عدّاء ماراثون',
    };

    const en = {
      badge: 'Official Certified Hub',
      titleTop: 'Dynamic Rebuild Xceed',
      titleMain1: 'German',
      titleMain2: 'Performance',
      titleMain3: 'Engineering',
      subtitle:
        'Original German products — higher performance, faster results, trusted inside Egypt.',
      btnShop: 'Shop Products',
      btnNew: 'New Arrivals',

      // Stats
      stat1: '30+',
      stat1Label: 'Years of Excellence',
      stat2: 'GMP',
      stat2Label: 'Certified Quality',
      stat3: '100%',
      stat3Label: 'Authentic Products',
      stat4: '50K+',
      stat4Label: 'Happy Athletes',

      // Why choose
      whyTitle: 'Why Choose DRX?',
      whySub: 'Three decades of excellence in sports nutrition',
      why1Title: 'Premium Quality',
      why1Desc: 'GMP-certified supplements with proven ingredients.',
      why2Title: 'Authentic Products',
      why2Desc: 'Anti-counterfeit verification on every product.',
      why3Title: 'Trusted by Athletes',
      why3Desc: '30+ years of excellence trusted worldwide.',

      // Testimonials
      testTitle: 'Testimonials',
      testSub: 'Real athletes. Real results.',
      t1: 'DRX supplements helped me break through my training plateau. Unmatched quality.',
      t2: 'I’ve tried many brands, but DRX delivers consistent results every time.',
      t3: 'Clean ingredients, tested quality, and performance I can rely on.',
      t4: 'From protein to pre-workout, every product exceeds expectations.',
      role1: 'Professional Bodybuilder',
      role2: 'CrossFit Athlete',
      role3: 'Olympic Weightlifter',
      role4: 'Marathon Runner',
    };

    return isRTL ? ar : en;
  }, [isRTL]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* FULL-BLEED HERO */}
      <section className="-mt-24 w-screen relative left-1/2 -translate-x-1/2 min-h-[92vh] flex items-center overflow-hidden">
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

          {/* Dark overlay (خفيف عشان الصورة تبان أكتر) */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Bottom blend */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-20 mx-auto px-6 flex justify-start">
          <div
            className="max-w-4xl p-8 md:p-12 border border-white/10 shadow-2xl backdrop-blur-[2px]"
            style={{
              background: 'rgba(225, 29, 72, 0.72)', // ✅ أخف كثافة
              clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)',
            }}
          >
            <span className="bg-black text-white px-4 py-2 font-mono text-sm uppercase mb-4 inline-block font-semibold tracking-wider">
              {copy.badge}
            </span>

            <div className="text-white/95 font-mono uppercase tracking-[0.2em] text-xs mb-3">
              {copy.titleTop}
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-oswald text-white uppercase leading-none mb-6">
              {copy.titleMain1} <br />
              <span className="text-black">{copy.titleMain2}</span>
              <br />
              {copy.titleMain3}
            </h1>

            <p className="text-white text-lg md:text-xl mb-8 font-semibold max-w-xl leading-relaxed">
              {copy.subtitle}
            </p>

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

      {/* STATS STRIP */}
      <section className="w-screen relative left-1/2 -translate-x-1/2 bg-bg-card border-y border-white/5">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { v: copy.stat1, l: copy.stat1Label },
              { v: copy.stat2, l: copy.stat2Label },
              { v: copy.stat3, l: copy.stat3Label },
              { v: copy.stat4, l: copy.stat4Label },
            ].map((s, idx) => (
              <div key={idx} className="border border-white/5 bg-black/20 p-6 text-center">
                <div className="text-4xl font-oswald font-black text-drxred">{s.v}</div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mt-2">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-oswald font-black uppercase">
            {copy.whyTitle} <span className="text-drxred">DRX</span>
          </h2>
          <p className="text-zinc-400 mt-3">{copy.whySub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            { t: copy.why1Title, d: copy.why1Desc },
            { t: copy.why2Title, d: copy.why2Desc },
            { t: copy.why3Title, d: copy.why3Desc },
          ].map((c, idx) => (
            <div key={idx} className="bg-bg-card border border-white/5 p-8">
              <div className="text-[10px] font-mono uppercase tracking-widest text-drxred">
                0{idx + 1}
              </div>
              <h3 className="text-2xl font-oswald uppercase mt-3">{c.t}</h3>
              <p className="text-zinc-400 mt-3 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="w-screen relative left-1/2 -translate-x-1/2 bg-bg-card border-y border-white/5">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-oswald font-black uppercase">
              {copy.testTitle} <span className="text-drxred">DRX</span>
            </h2>
            <p className="text-zinc-400 mt-3">{copy.testSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {[
              { txt: copy.t1, initials: 'AH', name: 'Milo Henry', role: copy.role1 },
              { txt: copy.t2, initials: 'MA', name: 'Felix Leon', role: copy.role2 },
              { txt: copy.t3, initials: 'YK', name: 'Hanz Rio', role: copy.role3 },
              { txt: copy.t4, initials: 'OF', name: 'Luca Theo', role: copy.role4 },
            ].map((t, idx) => (
              <div key={idx} className="bg-black/20 border border-white/5 p-8">
                <p className="text-zinc-200 leading-relaxed">“{t.txt}”</p>
                <div className="flex items-center gap-4 mt-6">
                  <div className="w-12 h-12 rounded-full bg-drxred text-white flex items-center justify-center font-black">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-oswald uppercase text-white">{t.name}</div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom counters (زي اللي تحت في موقع ألمانيا) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { v: '30+', l: isRTL ? 'سنوات خبرة' : 'Years Experience' },
              { v: 'GMP', l: isRTL ? 'جودة معتمدة' : 'Certified Quality' },
              { v: '100%', l: isRTL ? 'أصلي' : 'Authentic Products' },
              { v: '50K+', l: isRTL ? 'عملاء سعداء' : 'Happy Athletes' },
            ].map((s, idx) => (
              <div key={idx} className="border border-white/5 bg-black/25 p-6 text-center">
                <div className="text-3xl font-oswald font-black text-white">{s.v}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-2">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-10" />
    </div>
  );
};

export default Home;
