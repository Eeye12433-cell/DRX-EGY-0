import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import drxLogo from '@/assets/drx-logo.jpeg';

interface HomeProps {
  lang: 'ar' | 'en';
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  const navigate = useNavigate();
  const isRTL = lang === 'ar';

  const rootRef = useRef<HTMLDivElement | null>(null);

  const copy = useMemo(() => {
    return {
      badge: isRTL ? 'الموزّع الرسمي المعتمد' : 'Official Certified Hub',
      titleTop: isRTL ? 'Dynamic Rebuild Xceed' : 'Dynamic Rebuild Xceed',
      titleMain1: isRTL ? 'أداء' : 'Stronger.',
      titleMain2: isRTL ? 'ألماني' : 'Smarter.',
      titleMain3: isRTL ? 'فائق' : 'Trusted Nutrition.',
      subtitle: isRTL
        ? 'منتجات ألمانية أصلية — أداء أعلى، نتائج أسرع، وثقة مضمونة داخل مصر.'
        : 'Original German products — higher performance, faster results, trusted inside Egypt.',
      btnShop: isRTL ? 'تصفّح المتجر' : 'Shop Products',
      btnNew: isRTL ? 'وصل حديثاً' : 'New Arrivals',

      whyTitle: isRTL ? 'ليه تختار DRX؟' : 'Why Choose DRX?',
      whySub: isRTL ? '٣ عقود من التميّز في التغذية الرياضية' : 'Three decades of excellence in sports nutrition',
      whyCards: [
        {
          title: isRTL ? 'جودة بريميوم' : 'Premium Quality',
          desc: isRTL
            ? 'مكملات بمعايير GMP ومكوّنات مثبتة علميًا.'
            : 'GMP-certified supplements with scientifically proven ingredients.',
        },
        {
          title: isRTL ? 'أصالة مضمونة' : 'Authentic Products',
          desc: isRTL
            ? 'نظام تحقق ضد التقليد على كل منتج لحمايتك.'
            : 'Anti-counterfeit verification on every product for your safety.',
        },
        {
          title: isRTL ? 'ثقة الرياضيين' : 'Trusted by Athletes',
          desc: isRTL
            ? 'خبرة +30 سنة عالميًا في التغذية الرياضية.'
            : '30+ years of excellence in sports nutrition worldwide.',
        },
      ],

      stats: [
        { k: '30+', v: isRTL ? 'سنة خبرة' : 'Years Experience' },
        { k: 'GMP', v: isRTL ? 'جودة مُعتمدة' : 'Certified Quality' },
        { k: '100%', v: isRTL ? 'منتجات أصلية' : 'Authentic Products' },
        { k: '50K+', v: isRTL ? 'عميل سعيد' : 'Happy Athletes' },
      ],

      testiTitle: isRTL ? 'آراء العملاء' : 'Testimonials',
      testiSub: isRTL
        ? 'رياضيين حقيقيين… نتائج حقيقية. شوف ليه ناس كتير بتثق في DRX.'
        : 'Real athletes. Real results. See why professionals choose DRX for their nutrition needs.',
      testimonials: [
        {
          initials: 'أح',
          name: isRTL ? 'أحمد حسن' : 'Ahmed Hassan',
          role: isRTL ? 'لاعب كمال أجسام' : 'Bodybuilder',
          quote: isRTL
            ? 'مكملات DRX فرّقت معايا جدًا… الجودة واضحة والنتيجة حقيقية.'
            : 'DRX supplements helped me break through my training plateau. The quality is unmatched and results are real.',
        },
        {
          initials: 'مأ',
          name: isRTL ? 'محمود علي' : 'Mahmoud Ali',
          role: isRTL ? 'CrossFit' : 'CrossFit Athlete',
          quote: isRTL
            ? 'جرّبت ماركات كتير… بس DRX ثابتة ونتيجتها دايمًا مضمونة.'
            : "I've tried many brands, but DRX delivers consistent, real results every time. 30 years of excellence shows.",
        },
        {
          initials: 'يك',
          name: isRTL ? 'يوسف كريم' : 'Youssef Karim',
          role: isRTL ? 'رفع أثقال' : 'Weightlifter',
          quote: isRTL
            ? 'مكوّنات نظيفة وجودة تقدر تعتمد عليها… DRX بالنسبة لي شريك أداء.'
            : 'Clean ingredients, lab-tested quality, and performance I can rely on. DRX is my trusted partner.',
        },
        {
          initials: 'عف',
          name: isRTL ? 'عمر فتحي' : 'Omar Fathy',
          role: isRTL ? 'عدّاء ماراثون' : 'Marathon Runner',
          quote: isRTL
            ? 'من البروتين للبري ووركاوت… كل منتج بيعدّي توقعاتي.'
            : 'From protein to pre-workout, every DRX product exceeds expectations.',
        },
      ],
    };
  }, [isRTL]);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(
        '[data-hero-bg]',
        { scale: 1.05, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' }
      );

      gsap.fromTo(
        '[data-hero-box]',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.15 }
      );

      gsap.fromTo(
        '[data-hero-badge]',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', delay: 0.35 }
      );

      // Section reveal using IntersectionObserver + GSAP
      const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            io.unobserve(el);
            gsap.fromTo(
              el,
              { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
            );
          });
        },
        { threshold: 0.18 }
      );

      els.forEach((el) => io.observe(el));

      return () => io.disconnect();
    }, rootRef);

    return () => ctx.revert();
  }, [lang]);

  // ✅ البوكس الأحمر: يمين/شمال مع “مسافة بسيطة” من بداية الصفحة
  const heroAlign = isRTL ? 'justify-end' : 'justify-start';
  const heroBoxInset = isRTL ? 'md:mr-6 lg:mr-10' : 'md:ml-6 lg:ml-10';

  return (
    <div ref={rootRef} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* FULL-BLEED HERO */}
      <section className="-mt-24 w-screen relative left-1/2 -translate-x-1/2 min-h-[92vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0" data-hero-bg>
          <img
            src={drxLogo}
            alt="DRX Egypt"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 35%' }}
            loading="eager"
            decoding="async"
          />

          {/* ✅ بدل ما الأحمر يطغى: نعمل overlay خفيف ومحترف */}
          <div className="absolute inset-0 bg-black/40" />

          {/* ✅ ڤينيت خفيف على الجوانب لعمق بصري */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(1200px 500px at 20% 20%, rgba(0,0,0,0.0), rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.55) 100%)',
            }}
          />

          {/* Bottom gradient to blend into page background */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>

        {/* Content */}
        <div className={`container relative z-20 mx-auto px-4 md:px-6 flex ${heroAlign}`}>
          <div
            data-hero-box
            className={`w-full max-w-4xl p-7 md:p-10 border border-white/10 shadow-2xl ${heroBoxInset}`}
            style={{
              // ✅ تخفيف الكثافة: 0.78 بدل 0.92 + تدرّج بسيط
              background:
                'linear-gradient(135deg, rgba(225,29,72,0.78), rgba(225,29,72,0.70))',
              clipPath: 'polygon(6% 0, 100% 0, 95% 100%, 0 100%)',
              backdropFilter: 'blur(6px)',
            }}
          >
            {/* Badge */}
            <span
              data-hero-badge
              className="bg-black/90 text-white px-4 py-2 font-mono text-[11px] md:text-sm uppercase mb-4 inline-block font-semibold tracking-wider"
            >
              {copy.badge}
            </span>

            {/* Small top line */}
            <p className="text-white/90 font-mono text-[11px] md:text-sm uppercase tracking-[0.18em] mb-3">
              {copy.titleTop}
            </p>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-oswald text-white uppercase leading-[0.95] mb-5">
              {copy.titleMain1} <br />
              <span className="text-black">{copy.titleMain2}</span>
              <br />
              {copy.titleMain3}
            </h1>

            {/* Subtitle */}
            <p className="text-white text-base md:text-xl mb-8 font-semibold max-w-xl leading-relaxed">
              {copy.subtitle}
            </p>

            {/* Buttons */}
            <div className="flex gap-4 flex-wrap">
              <button
                className="bg-black text-white px-7 md:px-8 py-4 font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all text-sm"
                onClick={() => navigate('/shop')}
              >
                {copy.btnShop}
              </button>

              <button
                className="bg-white text-black px-7 md:px-8 py-4 font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all text-sm"
                onClick={() => navigate('/shop/new')}
              >
                {copy.btnNew}
              </button>
            </div>

            {/* ✅ Stats mini-row داخل الهيرو بشكل متناسق */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {copy.stats.map((s) => (
                <div
                  key={s.k}
                  className="border border-white/10 bg-black/25 px-4 py-3"
                  style={{ clipPath: 'polygon(6% 0, 100% 0, 94% 100%, 0 100%)' }}
                >
                  <div className="text-white font-oswald text-2xl md:text-3xl font-black leading-none">
                    {s.k}
                  </div>
                  <div className="text-white/80 font-mono text-[10px] uppercase tracking-widest mt-1">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-10" />

      {/* WHY CHOOSE */}
      <section className="container mx-auto px-4 md:px-8 py-14">
        <div data-reveal className="max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-oswald uppercase text-text-main">
            {copy.whyTitle} <span className="text-drxred">{isRTL ? 'DRX' : 'DRX'}</span>
          </h2>
          <p className="text-muted mt-3 font-inter max-w-2xl">{copy.whySub}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {copy.whyCards.map((c) => (
            <div
              key={c.title}
              data-reveal
              className="bg-bg-card border border-white/10 p-7 hover:border-drxred/40 transition-all"
              style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
            >
              <h3 className="text-xl font-oswald uppercase text-text-main mb-2">
                {c.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{c.desc}</p>

              <div className="mt-5 h-[2px] w-16 bg-drxred/70" />
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 md:px-8 pb-16">
        <div data-reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-drxred font-mono text-[11px] uppercase tracking-[0.25em]">
              {copy.testiTitle}
            </p>
            <h2 className="text-4xl md:text-5xl font-oswald uppercase text-text-main mt-2">
              {isRTL ? 'موثوق من رياضيين في كل مكان' : 'Trusted by Athletes Worldwide'}
            </h2>
            <p className="text-muted mt-3">{copy.testiSub}</p>
          </div>

          <button
            data-reveal
            className="btn-drx bg-drxred text-white px-7 py-4 font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all"
            onClick={() => navigate('/shop')}
          >
            {isRTL ? 'ابدأ التسوق' : 'Start Shopping'}
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {copy.testimonials.map((t) => (
            <div
              key={t.name}
              data-reveal
              className="bg-bg-card border border-white/10 p-7 hover:border-drxred/40 transition-all"
            >
              <p className="text-text-main/90 text-sm leading-relaxed">
                “{t.quote}”
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-drxred/15 border border-drxred/30 flex items-center justify-center">
                  <span className="font-oswald font-black text-drxred">{t.initials}</span>
                </div>
                <div>
                  <div className="text-text-main font-oswald text-lg leading-none">
                    {t.name}
                  </div>
                  <div className="text-muted text-[11px] font-mono uppercase tracking-widest mt-1">
                    {t.role}
                  </div>
                </div>
              </div>

              <div className="mt-5 h-[1px] w-full bg-white/5" />
              <div className="mt-4 flex gap-2">
                <span className="inline-block w-2 h-2 bg-drxred rounded-full" />
                <span className="inline-block w-2 h-2 bg-white/20 rounded-full" />
                <span className="inline-block w-2 h-2 bg-white/20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-6" />
    </div>
  );
};

export default Home;
