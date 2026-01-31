import React, { useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import drxLogo from "@/assets/drx-logo.jpeg";
interface HomeProps {
  lang: "ar" | "en";
}
const Home: React.FC<HomeProps> = ({
  lang
}) => {
  const navigate = useNavigate();
  const isRTL = lang === "ar";

  // GSAP refs
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      // Hero box entrance
      gsap.fromTo(heroBoxRef.current, {
        opacity: 0,
        x: isRTL ? 40 : -40,
        y: 10,
        rotate: -0.2
      }, {
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      // Sections stagger
      gsap.fromTo(".drx-anim", {
        opacity: 0,
        y: 18
      }, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.12,
        delay: 0.15
      });

      // Cards pop
      gsap.fromTo(".drx-card", {
        opacity: 0,
        y: 22,
        scale: 0.98
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.2
      });
    }, rootRef);
    return () => ctx.revert();
  }, [isRTL]);
  const copy = useMemo(() => {
    return {
      heroTop: isRTL ? "Dynamic Rebuild Xceed" : "Dynamic Rebuild Xceed",
      heroSub: isRTL ? "أقوى. أذكى. تغذية موثوقة." : "Stronger. Smarter. Trusted Nutrition.",
      badge: isRTL ? "الموزّع الرسمي المعتمد" : "Official Certified Hub",
      title1: isRTL ? "أداء" : "Performance",
      title2: isRTL ? "ألماني" : "German",
      title3: isRTL ? "فائق" : "Engineering",
      subtitle: isRTL ? "منتجات أصلية — أداء أعلى، نتائج أسرع، وثقة مضمونة داخل مصر." : "Authentic products — higher performance, faster results, trusted inside Egypt.",
      btnShop: isRTL ? "تصفّح المتجر" : "Shop Products",
      btnNew: isRTL ? "وصل حديثًا" : "New Arrivals",
      whyTitle: isRTL ? "ليه تختار DRX؟" : "Why Choose DRX?",
      whySub: isRTL ? "خبرة سنين في التغذية الرياضية وجودة تقدر تعتمد عليها." : "Decades of excellence in sports nutrition you can trust.",
      why1Title: isRTL ? "جودة ممتازة" : "Premium Quality",
      why1Desc: isRTL ? "مكوّنات مختارة بعناية وقياسات دقيقة تديك نتيجة حقيقية." : "Carefully selected ingredients with consistent, proven results.",
      why2Title: isRTL ? "منتجات أصلية" : "Authentic Products",
      why2Desc: isRTL ? "فحص أصالة ومكافحة تقليد على كل منتج لسلامتك." : "Anti-counterfeit verification on every product for your safety.",
      why3Title: isRTL ? "ثقة الرياضيين" : "Trusted by Athletes",
      why3Desc: isRTL ? "ناس كتير بتعتمد عليها في التمرين والتحسين." : "Chosen by athletes for reliable performance and clean formulas.",
      testTitle: isRTL ? "آراء العملاء" : "Testimonials",
      testHeading: isRTL ? "موثوق بيها من رياضيين كتير" : "Trusted by Athletes Worldwide",
      testSub: isRTL ? "ناس حقيقية ونتايج حقيقية — شوف ليه DRX اختيارهم." : "Real athletes. Real results. See why DRX is their go-to choice.",
      statsTop: [{
        k: "30+",
        ar: "سنة خبرة",
        en: "Years of Excellence"
      }, {
        k: "GMP",
        ar: "جودة معتمدة",
        en: "Certified Quality"
      }, {
        k: "100%",
        ar: "منتج أصلي",
        en: "Authentic Products"
      }],
      statsBottom: [{
        k: "30+",
        ar: "سنة خبرة",
        en: "Years Experience"
      }, {
        k: "GMP",
        ar: "جودة معتمدة",
        en: "Certified Quality"
      }, {
        k: "100%",
        ar: "منتج أصلي",
        en: "Authentic Products"
      }, {
        k: "50K+",
        ar: "عميل مبسوط",
        en: "Happy Athletes"
      }],
      testimonials: [{
        text: isRTL ? "الفرق ظهر معايا في الأداء بعد وقت قليل… خامات محترمة ونتيجة حقيقية." : "My performance improved fast — clean ingredients and real results.",
        name: isRTL ? "محمود حنفي" : "Mahmoud Hanafy",
        role: isRTL ? "لاعب كمال أجسام" : "Bodybuilding Athlete",
        initials: "MH"
      }, {
        text: isRTL ? "جرّبت براندات كتير… DRX ثابتة في الجودة وده أهم حاجة." : "I tried many brands, DRX stays consistent — that’s what matters.",
        name: isRTL ? "أحمد رزق" : "Ahmed Rizk",
        role: isRTL ? "كروس فيت" : "CrossFit Athlete",
        initials: "AR"
      }, {
        text: isRTL ? "مفيش تهريج… مكوّنات نظيفة ونتيجة تقدر تعتمد عليها." : "No hype — clean formula and performance I can rely on.",
        name: isRTL ? "يوسف سعد" : "Youssef Saad",
        role: isRTL ? "رفع أثقال" : "Weightlifter",
        initials: "YS"
      }, {
        text: isRTL ? "البروتين والبري ووركاوت ممتازين… أحسن حاجة إن كل حاجة واضحة." : "Protein and pre-workout exceeded my expectations — super clear quality.",
        name: isRTL ? "عمر فؤاد" : "Omar Fouad",
        role: isRTL ? "عدّاء" : "Runner",
        initials: "OF"
      }]
    };
  }, [isRTL]);
  return <div ref={rootRef} dir={isRTL ? "rtl" : "ltr"} className="w-full">
      {/* =========================
          HERO - FULL BLEED
       ========================= */}
      <section className="-mt-24 w-screen relative left-1/2 -translate-x-1/2 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={drxLogo} alt="DRX Egypt" className="w-full h-full object-cover" style={{
          objectPosition: "center 35%"
        }} loading="eager" decoding="async" />

          {/* Softer overlay (خفيف) */}
          <div className="absolute inset-0 bg-black/45" />

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>

        {/* Content Wrapper */}
        <div className="container relative z-20 mx-auto px-6 flex">
          <div className={`w-full flex ${isRTL ? "justify-end" : "justify-start"}`}>
            {/* HERO BOX */}
            <div ref={heroBoxRef} className={`
                max-w-4xl p-8 md:p-12 border border-white/10 shadow-2xl
                ${isRTL ? "mr-2 md:mr-6" : "ml-2 md:ml-6"}
              `} style={{
            // خففت الكثافة شوية
            background: "rgba(225, 29, 72, 0.82)",
            clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)",
            backdropFilter: "blur(6px)"
          }}>
              {/* Top small title */}
              <div className="drx-anim mb-4">
                <div className="text-white/95 font-oswald uppercase tracking-wide text-lg md:text-xl">
                  {copy.heroTop}
                </div>
                <div className="text-white/90 text-sm md:text-base font-inter">
                  {copy.heroSub}
                </div>
              </div>

              {/* Badge */}
              <span className="drx-anim bg-black text-white px-4 py-2 font-mono text-sm uppercase mb-4 inline-block font-semibold tracking-wider">
                {copy.badge}
              </span>

              {/* Title */}
              <h1 className="drx-anim text-5xl md:text-7xl lg:text-8xl font-black font-oswald text-white uppercase leading-none mb-6">
                {copy.title1} <br />
                <span className="text-black">{copy.title2}</span>
                <br />
                {copy.title3}
              </h1>

              {/* Subtitle */}
              <p className="drx-anim text-white text-lg md:text-xl mb-8 font-semibold max-w-xl leading-relaxed">
                {copy.subtitle}
              </p>

              {/* Buttons */}
              <div className="drx-anim flex gap-4 flex-wrap">
                <button className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all text-sm" onClick={() => navigate("/shop")}>
                  {copy.btnShop}
                </button>

                <button className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all text-sm" onClick={() => navigate("/shop/new")}>
                  {copy.btnNew}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TOP STATS STRIP (Germany-like)
       ========================= */}
      <section className="w-full">
        <div className="w-screen relative left-1/2 -translate-x-1/2">
          <div className="py-10 bg-transparent" style={{
          background: "linear-gradient(90deg, rgba(225,29,72,1) 0%, rgba(245,158,11,1) 100%)"
        }}>
            <div className="container mx-auto px-6">
              <div className="text-center text-white drx-anim">
                <h2 className="font-oswald text-xl md:text-2xl uppercase tracking-wide">
                  Dynamic Rebuild Xceed
                </h2>
                <p className="text-white/90 font-inter mt-1">
                  {isRTL ? "أقوى. أذكى. تغذية موثوقة." : "Stronger. Smarter. Trusted Nutrition."}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {copy.statsTop.map(s => <div key={s.k} className="drx-card bg-black/15 border border-white/20 rounded-xl p-5 text-center">
                    <div className="font-oswald text-3xl md:text-4xl text-white">{s.k}</div>
                    <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-widest text-white/90 mt-1">
                      {isRTL ? s.ar : s.en}
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          WHY CHOOSE
       ========================= */}
      <section className="py-14">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10 drx-anim">
            <h3 className="font-oswald text-3xl md:text-4xl text-drxred uppercase">
              {copy.whyTitle}
            </h3>
            <p className="text-muted mt-2">{copy.whySub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="drx-card bg-bg-card border border-white/10 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-drxred/15 border border-drxred/30 flex items-center justify-center mb-4">
                <span className="text-xl">🏅</span>
              </div>
              <h4 className="font-oswald text-xl text-text-main mb-2 uppercase">{copy.why1Title}</h4>
              <p className="text-muted text-sm leading-relaxed">{copy.why1Desc}</p>
            </div>

            <div className="drx-card bg-bg-card border border-white/10 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-drxred/15 border border-drxred/30 flex items-center justify-center mb-4">
                <span className="text-xl">🛡️</span>
              </div>
              <h4 className="font-oswald text-xl text-text-main mb-2 uppercase">{copy.why2Title}</h4>
              <p className="text-muted text-sm leading-relaxed">{copy.why2Desc}</p>
            </div>

            <div className="drx-card bg-bg-card border border-white/10 rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-drxred/15 border border-drxred/30 flex items-center justify-center mb-4">
                <span className="text-xl">💪</span>
              </div>
              <h4 className="font-oswald text-xl text-text-main mb-2 uppercase">{copy.why3Title}</h4>
              <p className="text-muted text-sm leading-relaxed">{copy.why3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TESTIMONIALS
       ========================= */}
      <section className="py-14">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10 drx-anim">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted">
              {copy.testTitle}
            </div>
            <h3 className="font-oswald text-3xl md:text-4xl text-text-main uppercase mt-2">
              {copy.testHeading}
            </h3>
            <p className="text-muted mt-2 max-w-2xl mx-auto">{copy.testSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {copy.testimonials.map(t => <div key={t.initials} className="drx-card bg-bg-card border border-white/10 rounded-2xl p-7">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-drxred text-white flex items-center justify-center font-bold font-mono">
                    {t.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-1 text-drxred mb-3">
                      {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                    </div>
                    <p className="text-text-main/90 leading-relaxed">
                      “{t.text}”
                    </p>
                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="font-oswald text-lg text-text-main">{t.name}</div>
                        <div className="text-muted text-sm">{t.role}</div>
                      </div>
                      <div className="text-drxred font-mono text-xs uppercase tracking-widest">
                        DRX
                      </div>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* =========================
          BOTTOM STATS
       ========================= */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {copy.statsBottom.map(s => <div key={s.k} className="drx-card bg-bg-card border border-white/10 rounded-2xl p-6 text-center">
                <div className="font-oswald text-3xl text-drxred">{s.k}</div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-muted mt-1">
                  {isRTL ? s.ar : s.en}
                </div>
              </div>)}
          </div>
        </div>
      </section>
    </div>;
};
export default Home;