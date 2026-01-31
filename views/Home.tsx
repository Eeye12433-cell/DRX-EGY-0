import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import drxLogo from "@/assets/drx-logo.jpeg";

interface HomeProps {
  lang: "ar" | "en";
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  const navigate = useNavigate();
  const isRTL = lang === "ar";

  const rootRef = useRef<HTMLDivElement | null>(null);

  const copy = useMemo(() => {
    const ar = {
      heroBadge: "الموزّع الرسمي المعتمد",
      heroTitleTop: "Dynamic Rebuild Xceed",
      heroTitleSub: "أقوى. أذكى. تغذية موثوقة.",
      heroBtnShop: "تصفّح المتجر",
      heroBtnNew: "وصل حديثًا",
      statYears: "30+",
      statYearsLabel: "سنة خبرة",
      statGmp: "GMP",
      statGmpLabel: "جودة معتمدة",
      statAuth: "100%",
      statAuthLabel: "منتجات أصلية",
      whyTitle: "ليه تختار DRX؟",
      whySub: "٣ عقود خبرة في التغذية الرياضية على مستوى العالم",
      why1Title: "جودة بريميوم",
      why1Desc: "مكملات بمعايير تصنيع قوية ومكونات مدروسة علميًا",
      why2Title: "أصلي ومضمون",
      why2Desc: "نظام تحقق ضد التقليد على كل منتج لسلامتك",
      why3Title: "موثوق للرياضيين",
      why3Desc: "نتايج ثابتة على مدار سنين وتجربة ناس كتير",
      testiBadge: "Testimonials",
      testiTitle: "موثوق من رياضيين في كل مكان",
      testiSub:
        "ناس حقيقية ونتايج حقيقية — شوف ليه ناس كتير بتختار DRX في رحلتها.",
      t1: "DRX فرق معايا جدًا… خامات نظيفة ونتيجة واضحة من أول شهر.",
      t1Name: "ميدو سلامة",
      t1Role: "لاعب كمال أجسام",
      t2: "جربت ماركات كتير… بس DRX ثابت في الجودة وده أهم حاجة عندي.",
      t2Name: "كابتن كريم منصور",
      t2Role: "مدرب CrossFit",
      t3: "مفيش تهييج ولا هبد… أداء محترم ومكونات حقيقية.",
      t3Name: "دنيا أشرف",
      t3Role: "لاعبة فيتنس",
      t4: "من بروتين لبري-ووركاوت… كله متوازن ومضمون.",
      t4Name: "أحمد فوزي",
      t4Role: "عدّاء ماراثون",
      bottom1: "30+",
      bottom1Label: "سنة خبرة",
      bottom2: "GMP",
      bottom2Label: "جودة معتمدة",
      bottom3: "100%",
      bottom3Label: "أصلي",
      bottom4: "50K+",
      bottom4Label: "عميل مبسوط",
    };

    const en = {
      heroBadge: "Official Certified Hub",
      heroTitleTop: "Dynamic Rebuild Xceed",
      heroTitleSub: "Stronger. Smarter. Trusted Nutrition.",
      heroBtnShop: "Shop Products",
      heroBtnNew: "New Arrivals",
      statYears: "30+",
      statYearsLabel: "Years of Excellence",
      statGmp: "GMP",
      statGmpLabel: "Certified Quality",
      statAuth: "100%",
      statAuthLabel: "Authentic Products",
      whyTitle: "Why Choose DRX?",
      whySub: "Three decades of excellence in sports nutrition worldwide",
      why1Title: "Premium Quality",
      why1Desc: "High-standard supplements with proven ingredients",
      why2Title: "Authentic Products",
      why2Desc: "Anti-counterfeit verification on every product",
      why3Title: "Trusted by Athletes",
      why3Desc: "Consistent results backed by decades of trust",
      testiBadge: "Testimonials",
      testiTitle: "Trusted by Athletes Worldwide",
      testiSub:
        "Real athletes. Real results. See why professionals choose DRX.",
      t1: "DRX helped me break through my plateau — clean quality and real results.",
      t1Name: "Mido Salama",
      t1Role: "Bodybuilder",
      t2: "I've tried many brands — DRX stays consistent. That's what matters.",
      t2Name: "Coach Karim Mansour",
      t2Role: "CrossFit Coach",
      t3: "No hype — solid performance and reliable ingredients.",
      t3Name: "Donia Ashraf",
      t3Role: "Fitness Athlete",
      t4: "From protein to pre-workout — everything is balanced and legit.",
      t4Name: "Ahmed Fawzy",
      t4Role: "Marathon Runner",
      bottom1: "30+",
      bottom1Label: "Years Experience",
      bottom2: "GMP",
      bottom2Label: "Certified Quality",
      bottom3: "100%",
      bottom3Label: "Authentic Products",
      bottom4: "50K+",
      bottom4Label: "Happy Athletes",
    };

    return isRTL ? ar : en;
  }, [isRTL]);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-anim='fade-up']", { opacity: 0, y: 18 });
      gsap.set("[data-anim='card']", { opacity: 0, y: 16, scale: 0.98 });

      gsap.to("[data-anim='fade-up']", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.1,
      });

      gsap.to("[data-anim='card']", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.15,
      });
    }, rootRef);

    return () => ctx.revert();
  }, [lang]);

  return (
    <div ref={rootRef} dir={isRTL ? "rtl" : "ltr"}>
      {/* HERO (Full Bleed) */}
      <section className="-mt-24 w-screen relative left-1/2 -translate-x-1/2 min-h-[92vh] flex items-center overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 z-0">
          <img
            src={drxLogo}
            alt="DRX Egypt"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 35%" }}
            loading="eager"
            decoding="async"
          />
          {/* overlay */}
          <div className="absolute inset-0 bg-black/45" />
          {/* bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>

        {/* CONTENT */}
        <div className="container relative z-20 mx-auto px-6">
          <div
            className={`flex ${
              isRTL ? "justify-end" : "justify-start"
            }`}
          >
            {/* IMPORTANT: box starts after small page margin */}
            <div
              className="max-w-3xl w-full sm:w-[92%] md:w-[820px]"
              style={{
                marginInlineStart: isRTL ? undefined : "12px",
                marginInlineEnd: isRTL ? "12px" : undefined,
              }}
            >
              <div
                className="p-7 md:p-10 border border-white/10 shadow-2xl backdrop-blur-md"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,15,15,0.75), rgba(15,15,15,0.55))",
                  borderRadius: "14px",
                }}
              >
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span
                    data-anim="fade-up"
                    className="bg-white/10 text-white px-4 py-2 font-mono text-[11px] uppercase inline-block font-semibold tracking-wider border border-white/10 rounded-full"
                  >
                    {copy.heroBadge}
                  </span>

                  <span
                    data-anim="fade-up"
                    className="text-white/75 font-mono text-[11px] uppercase tracking-widest"
                  >
                    DRX • EGYPT
                  </span>
                </div>

                <h1
                  data-anim="fade-up"
                  className="text-4xl md:text-6xl lg:text-7xl font-black font-oswald text-white uppercase leading-[0.95] mb-4"
                >
                  {copy.heroTitleTop}
                </h1>

                <p
                  data-anim="fade-up"
                  className="text-white/90 text-base md:text-xl mb-7 font-semibold max-w-xl leading-relaxed"
                >
                  {copy.heroTitleSub}
                </p>

                <div data-anim="fade-up" className="flex gap-4 flex-wrap">
                  <button
                    className="bg-[#e11d48] text-white px-8 py-4 font-bold uppercase tracking-widest hover:brightness-110 transition-all text-sm rounded-xl shadow-lg shadow-[#e11d48]/20"
                    onClick={() => navigate("/shop")}
                  >
                    {copy.heroBtnShop}
                  </button>

                  <button
                    className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all text-sm rounded-xl"
                    onClick={() => navigate("/shop/new")}
                  >
                    {copy.heroBtnNew}
                  </button>
                </div>

                {/* MINI STATS (top, like germany) */}
                <div className="mt-7 grid grid-cols-3 gap-3">
                  {[
                    { v: copy.statYears, l: copy.statYearsLabel },
                    { v: copy.statGmp, l: copy.statGmpLabel },
                    { v: copy.statAuth, l: copy.statAuthLabel },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      data-anim="fade-up"
                      className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
                    >
                      <div className="text-white font-oswald text-2xl md:text-3xl">
                        {s.v}
                      </div>
                      <div className="text-white/70 text-[11px] md:text-xs font-mono uppercase tracking-wider mt-1">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* subtle hint / spacer */}
              <div className="h-8" />
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="container mx-auto px-6 py-14">
        <div className="text-center max-w-3xl mx-auto">
          <h2
            data-anim="fade-up"
            className="text-3xl md:text-4xl font-black font-oswald text-text-main uppercase"
          >
            <span className="text-[#e11d48]">{copy.whyTitle}</span>
          </h2>
          <p
            data-anim="fade-up"
            className="mt-3 text-muted text-sm md:text-base"
          >
            {copy.whySub}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: copy.why1Title, desc: copy.why1Desc, icon: "⚡" },
            { title: copy.why2Title, desc: copy.why2Desc, icon: "✅" },
            { title: copy.why3Title, desc: copy.why3Desc, icon: "🏅" },
          ].map((c, idx) => (
            <div
              key={idx}
              data-anim="card"
              className="bg-bg-card border border-white/10 rounded-2xl p-7 hover:border-[#e11d48]/60 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl mb-4">
                {c.icon}
              </div>
              <h3 className="font-oswald text-xl text-text-main mb-2 uppercase">
                {c.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-6 pb-14">
        <div className="text-center max-w-3xl mx-auto">
          <div
            data-anim="fade-up"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono uppercase tracking-widest text-white/80"
          >
            ⭐ {copy.testiBadge}
          </div>

          <h2
            data-anim="fade-up"
            className="mt-4 text-3xl md:text-4xl font-black font-oswald text-text-main uppercase"
          >
            {copy.testiTitle}
          </h2>
          <p data-anim="fade-up" className="mt-3 text-muted text-sm md:text-base">
            {copy.testiSub}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { text: copy.t1, name: copy.t1Name, role: copy.t1Role, initials: "MS" },
            { text: copy.t2, name: copy.t2Name, role: copy.t2Role, initials: "KM" },
            { text: copy.t3, name: copy.t3Name, role: copy.t3Role, initials: "DA" },
            { text: copy.t4, name: copy.t4Name, role: copy.t4Role, initials: "AF" },
          ].map((t, idx) => (
            <div
              key={idx}
              data-anim="card"
              className="bg-bg-card border border-white/10 rounded-2xl p-7 relative overflow-hidden"
            >
              {/* small accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#e11d48]/80" />

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/80">
                  {t.initials}
                </div>

                <div className="flex-1">
                  <div className="flex gap-1 text-[#e11d48] mb-3">
                    {"★★★★★".split("").map((s, i) => (
                      <span key={i} className="text-sm">
                        {s}
                      </span>
                    ))}
                  </div>

                  <p className="text-white/85 leading-relaxed">
                    “{t.text}”
                  </p>

                  <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-text-main font-bold">{t.name}</div>
                      <div className="text-muted text-sm">{t.role}</div>
                    </div>

                    <div className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                      DRX
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM STATS STRIP */}
        <div className="mt-10 bg-bg-card border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { v: copy.bottom1, l: copy.bottom1Label },
              { v: copy.bottom2, l: copy.bottom2Label },
              { v: copy.bottom3, l: copy.bottom3Label },
              { v: copy.bottom4, l: copy.bottom4Label },
            ].map((s, idx) => (
              <div key={idx} data-anim="fade-up" className="py-2">
                <div className="text-text-main font-oswald text-2xl md:text-3xl">
                  {s.v}
                </div>
                <div className="text-muted text-[11px] md:text-xs font-mono uppercase tracking-wider mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-8" />
    </div>
  );
};

export default Home;
