import React, { useLayoutEffect, useMemo, useRef, useEffect, useState } from "react";
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [countersAnimated, setCountersAnimated] = useState(false);
  const copy = useMemo(() => {
    const ar = {
      heroBadge: "الموزّع الرسمي المعتمد",
      heroTitleTop: "Dynamic Rebuild",
      heroTitleBottom: "Xceed",
      heroTitleSub: "أقوى. أذكى. تغذية موثوقة.",
      heroBtnShop: "تصفّح المتجر",
      heroBtnNew: "وصل حديثًا",
      statYears: 30,
      statYearsLabel: "سنة خبرة",
      statGmp: "GMP",
      statGmpLabel: "جودة معتمدة",
      statAuth: 100,
      statAuthLabel: "منتجات أصلية",
      statClients: 50,
      statClientsLabel: "ألف عميل",
      whyTitle: "ليه تختار DRX؟",
      whySub: "٣ عقود خبرة في التغذية الرياضية على مستوى العالم",
      why1Title: "جودة بريميوم",
      why1Desc: "مكملات بمعايير تصنيع قوية ومكونات مدروسة علميًا",
      why2Title: "أصلي ومضمون",
      why2Desc: "نظام تحقق ضد التقليد على كل منتج لسلامتك",
      why3Title: "موثوق للرياضيين",
      why3Desc: "نتايج ثابتة على مدار سنين وتجربة ناس كتير",
      testiBadge: "آراء العملاء",
      testiTitle: "موثوق من رياضيين في كل مكان",
      testiSub: "ناس حقيقية ونتايج حقيقية — شوف ليه ناس كتير بتختار DRX",
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
      ctaTitle: "ابدأ رحلتك الآن",
      ctaSub: "انضم لآلاف الرياضيين اللي اختاروا DRX",
      ctaBtn: "تسوق الآن"
    };
    const en = {
      heroBadge: "Official Certified Hub",
      heroTitleTop: "Dynamic Rebuild",
      heroTitleBottom: "Xceed",
      heroTitleSub: "Stronger. Smarter. Trusted Nutrition.",
      heroBtnShop: "Shop Products",
      heroBtnNew: "New Arrivals",
      statYears: 30,
      statYearsLabel: "Years of Excellence",
      statGmp: "GMP",
      statGmpLabel: "Certified Quality",
      statAuth: 100,
      statAuthLabel: "Authentic Products",
      statClients: 50,
      statClientsLabel: "K+ Athletes",
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
      testiSub: "Real athletes. Real results. See why professionals choose DRX.",
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
      ctaTitle: "Start Your Journey",
      ctaSub: "Join thousands of athletes who chose DRX",
      ctaBtn: "Shop Now"
    };
    return isRTL ? ar : en;
  }, [isRTL]);

  // Animated counter component
  const AnimatedCounter = ({
    value,
    suffix = "",
    prefix = ""
  }: {
    value: number | string;
    suffix?: string;
    prefix?: string;
  }) => {
    const counterRef = useRef<HTMLSpanElement>(null);
    useEffect(() => {
      if (!countersAnimated || !counterRef.current) return;
      if (typeof value === "string") return;
      gsap.fromTo(counterRef.current, {
        textContent: 0
      }, {
        textContent: value,
        duration: 2,
        ease: "power2.out",
        snap: {
          textContent: 1
        },
        onUpdate: function () {
          if (counterRef.current) {
            counterRef.current.textContent = prefix + Math.round(Number(counterRef.current.textContent || 0)) + suffix;
          }
        }
      });
    }, [countersAnimated, value, suffix, prefix]);
    return <span ref={counterRef}>{prefix}{typeof value === "string" ? value : 0}{suffix}</span>;
  };

  // Main GSAP animations - simplified for reliability
  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      // Create master timeline with slight delay to ensure DOM is ready
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out"
        },
        delay: 0.1
      });

      // Set initial visible state first, then animate
      gsap.set([".hero-badge", ".hero-title-line", ".hero-subtitle", ".hero-cta", ".hero-stat"], {
        visibility: "visible"
      });

      // Hero scanline effect
      tl.fromTo(".hero-scanline", {
        scaleX: 0
      }, {
        scaleX: 1,
        duration: 0.8
      });

      // Hero content stagger
      tl.fromTo(".hero-badge", {
        opacity: 0,
        y: -20,
        scale: 0.9
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5
      }, "-=0.3");

      // Title split animation
      tl.fromTo(".hero-title-line", {
        opacity: 0,
        y: 60,
        skewY: 3
      }, {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 0.7,
        stagger: 0.15
      }, "-=0.2");

      // Subtitle
      tl.fromTo(".hero-subtitle", {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.5
      }, "-=0.3");

      // CTA buttons
      tl.fromTo(".hero-cta", {
        opacity: 0,
        y: 20,
        scale: 0.95
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.1
      }, "-=0.2");

      // Stats cards with 3D flip
      tl.fromTo(".hero-stat", {
        opacity: 0,
        rotateY: -30,
        transformOrigin: "left center"
      }, {
        opacity: 1,
        rotateY: 0,
        duration: 0.6,
        stagger: 0.1
      }, "-=0.3");

      // Floating particles - simpler animation
      gsap.to(".particle", {
        y: "random(-15, 15)",
        x: "random(-8, 8)",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3
      });

      // Glow pulse
      gsap.to(".glow-pulse", {
        boxShadow: "0 0 60px hsl(var(--primary) / 0.4)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Cards hover effect setup
      const cards = gsap.utils.toArray<HTMLElement>(".hover-card");
      cards.forEach(card => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.02,
            y: -5,
            duration: 0.3,
            ease: "power2.out"
          });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });

      // Trigger counter animation
      setTimeout(() => setCountersAnimated(true), 1200);
    }, rootRef);
    return () => ctx.revert();
  }, [lang]);

  // Parallax effect on mouse move - throttled for performance
  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const xPos = (e.clientX / window.innerWidth - 0.5) * 15;
        const yPos = (e.clientY / window.innerHeight - 0.5) * 15;
        gsap.to(".parallax-layer", {
          x: xPos,
          y: yPos,
          duration: 0.8,
          ease: "power2.out"
        });
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);
  return <div ref={rootRef} dir={isRTL ? "rtl" : "ltr"} className="overflow-hidden">
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(8)].map((_, i) => <div key={i} className="particle absolute w-1 h-1 rounded-full bg-primary/30" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }} />)}
      </div>

      {/* HERO SECTION */}
      <section ref={heroRef} className="-mt-24 w-screen relative left-1/2 -translate-x-1/2 min-h-screen flex items-center overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
                linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
              `,
          backgroundSize: "50px 50px"
        }} />
        </div>

        {/* Hero Background Image with Parallax */}
        <div className="absolute inset-0 z-0">
          <img src={drxLogo} alt="DRX Egypt" className="hero-bg-image w-full h-[120%] object-cover will-change-transform" style={{
          objectPosition: "center 35%"
        }} loading="eager" decoding="async" />
          {/* Multiple gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          {/* Animated vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] opacity-0" />
        </div>

        {/* Scanline Effect */}
        <div className="hero-scanline absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 z-10 origin-left" />

        {/* HUD Corners */}
        <div className="absolute top-32 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/40 z-20" />
        <div className="absolute top-32 right-8 w-16 h-16 border-r-2 border-t-2 border-primary/40 z-20" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-primary/40 z-20" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/40 z-20" />

        {/* Main Content */}
        <div className="container relative z-20 mx-auto px-6 py-20">
          <div className="">
            <div className="max-w-4xl w-full parallax-layer shadow-md">
              {/* Badge - visible by default, animated after */}
              <div className="hero-badge inline-flex items-center gap-3 mb-8 opacity-100">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] border border-white/20 rounded-full">
                  {copy.heroBadge}
                </span>
              </div>

              {/* Title with Split Lines - visible by default */}
              <h1 className="mb-6">
                <span className="hero-title-line block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-oswald text-white uppercase leading-[0.9] tracking-tight opacity-100">
                  {copy.heroTitleTop}
                </span>
                <span className="hero-title-line block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-oswald uppercase leading-[0.9] tracking-tight glow-pulse opacity-100" style={{
                color: "hsl(var(--primary))"
              }}>
                  {copy.heroTitleBottom}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle text-white/80 text-lg md:text-2xl mb-10 font-medium max-w-2xl leading-relaxed">
                {copy.heroTitleSub}
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-4 flex-wrap mb-12">
                <button className="hero-cta group relative bg-primary text-white px-10 py-5 font-bold uppercase tracking-widest text-sm rounded-xl overflow-hidden transition-all hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)]" onClick={() => navigate("/shop")}>
                  <span className="relative z-10 flex items-center gap-2">
                    {copy.heroBtnShop}
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button className="hero-cta group bg-white/10 backdrop-blur-sm text-white px-10 py-5 font-bold uppercase tracking-widest text-sm rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all" onClick={() => navigate("/shop/new")}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {copy.heroBtnNew}
                  </span>
                </button>
              </div>

              {/* Stats Grid */}
              <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{
                v: copy.statYears,
                l: copy.statYearsLabel,
                suffix: "+",
                isNum: true
              }, {
                v: copy.statGmp,
                l: copy.statGmpLabel,
                suffix: "",
                isNum: false
              }, {
                v: copy.statAuth,
                l: copy.statAuthLabel,
                suffix: "%",
                isNum: true
              }, {
                v: copy.statClients,
                l: copy.statClientsLabel,
                suffix: "K+",
                isNum: true
              }].map((s, idx) => <div key={idx} className="hero-stat group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:border-primary/50 hover:bg-white/10 transition-all cursor-default">
                    <div className="text-white font-oswald text-3xl md:text-4xl font-bold group-hover:text-primary transition-colors">
                      {s.isNum ? <AnimatedCounter value={s.v as number} suffix={s.suffix} /> : s.v}
                    </div>
                    <div className="text-white/60 text-xs font-mono uppercase tracking-wider mt-2">
                      {s.l}
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-2">
            <div className="w-1 h-3 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="reveal-section container mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-mono uppercase tracking-widest mb-4">
            {isRTL ? "مميزاتنا" : "Our Features"}
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-oswald text-foreground uppercase mb-4">
            {copy.whyTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
            {copy.whySub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
          title: copy.why1Title,
          desc: copy.why1Desc,
          icon: "⚡",
          gradient: "from-yellow-500/20 to-orange-500/20"
        }, {
          title: copy.why2Title,
          desc: copy.why2Desc,
          icon: "✅",
          gradient: "from-green-500/20 to-emerald-500/20"
        }, {
          title: copy.why3Title,
          desc: copy.why3Desc,
          icon: "🏅",
          gradient: "from-primary/20 to-rose-500/20"
        }].map((c, idx) => <div key={idx} className="hover-card group relative bg-card border border-border rounded-3xl p-8 overflow-hidden transition-all hover:border-primary/50">
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:border-primary/30 transition-all">
                {c.icon}
              </div>
              
              <h3 className="relative z-10 font-oswald text-2xl text-foreground mb-3 uppercase">
                {c.title}
              </h3>
              <p className="relative z-10 text-muted-foreground leading-relaxed">
                {c.desc}
              </p>

              {/* Corner accent */}
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>)}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="reveal-section relative py-24 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
        backgroundSize: "40px 40px"
      }} />

        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono uppercase tracking-widest text-primary mb-4">
              <span>⭐</span> {copy.testiBadge}
            </div>

            <h2 className="text-4xl md:text-5xl font-black font-oswald text-foreground uppercase mb-4">
              {copy.testiTitle}
            </h2>
            <p className="text-muted-foreground text-lg">
              {copy.testiSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[{
            text: copy.t1,
            name: copy.t1Name,
            role: copy.t1Role,
            initials: "MS"
          }, {
            text: copy.t2,
            name: copy.t2Name,
            role: copy.t2Role,
            initials: "KM"
          }, {
            text: copy.t3,
            name: copy.t3Name,
            role: copy.t3Role,
            initials: "DA"
          }, {
            text: copy.t4,
            name: copy.t4Name,
            role: copy.t4Role,
            initials: "AF"
          }].map((t, idx) => <div key={idx} className="hover-card group relative bg-card border border-border rounded-3xl p-8 overflow-hidden hover:border-primary/50 transition-all">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

                <div className="flex items-start gap-5">
                  {/* Avatar */}
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center font-mono text-sm font-bold text-primary group-hover:scale-110 transition-transform">
                    {t.initials}
                  </div>

                  <div className="flex-1">
                    {/* Stars */}
                    <div className="flex gap-1 text-primary mb-4">
                      {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>)}
                    </div>

                    {/* Quote */}
                    <p className="text-foreground/90 leading-relaxed text-lg mb-6">
                      "{t.text}"
                    </p>

                    {/* Author */}
                    <div className="pt-5 border-t border-border flex items-center justify-between">
                      <div>
                        <div className="font-bold text-foreground">{t.name}</div>
                        <div className="text-muted-foreground text-sm">{t.role}</div>
                      </div>
                      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground/50">
                        DRX
                      </div>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="reveal-section container mx-auto px-6 pb-24">
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black font-oswald text-foreground uppercase mb-4">
              {copy.ctaTitle}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              {copy.ctaSub}
            </p>
            <button className="group bg-primary text-white px-12 py-5 font-bold uppercase tracking-widest text-sm rounded-xl hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)] transition-all" onClick={() => navigate("/shop")}>
              <span className="flex items-center gap-3">
                {copy.ctaBtn}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-8" />
    </div>;
};
export default Home;