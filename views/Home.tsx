import React, { useLayoutEffect, useMemo, useRef, useEffect, useState } from "react";
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

  const AnimatedCounter = ({ value, suffix = "", prefix = "" }: { value: number | string; suffix?: string; prefix?: string }) => {
    const counterRef = useRef<HTMLSpanElement>(null);
    useEffect(() => {
      if (!countersAnimated || !counterRef.current) return;
      if (typeof value === "string") return;
      gsap.fromTo(counterRef.current, { textContent: 0 }, {
        textContent: value,
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = prefix + Math.round(Number(counterRef.current.textContent || 0)) + suffix;
          }
        }
      });
    }, [countersAnimated, value, suffix, prefix]);
    return <span ref={counterRef}>{prefix}{typeof value === "string" ? value : 0}{suffix}</span>;
  };

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set([".hero-badge", ".hero-title-line", ".hero-subtitle", ".hero-cta", ".hero-stat"], { visibility: "visible" });
      gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 })
        .fromTo(".hero-scanline", { scaleX: 0 }, { scaleX: 1, duration: 0.8 })
        .fromTo(".hero-badge", { opacity: 0, y: -20 }, { opacity: 1, y: 0 }, "-=0.3")
        .fromTo(".hero-title-line", { opacity: 0, y: 60 }, { opacity: 1, y: 0, stagger: 0.15 }, "-=0.2")
        .fromTo(".hero-subtitle", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.3")
        .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 }, "-=0.2")
        .fromTo(".hero-stat", { opacity: 0, rotateY: -30 }, { opacity: 1, rotateY: 0, stagger: 0.1 }, "-=0.3");
      setTimeout(() => setCountersAnimated(true), 1200);
    }, rootRef);
    return () => ctx.revert();
  }, [lang]);

  return (
    <div ref={rootRef} dir={isRTL ? "rtl" : "ltr"} className="overflow-hidden">

      {/* HERO */}
      <section ref={heroRef} className="-mt-24 w-screen relative left-1/2 -translate-x-1/2 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={drxLogo} className="w-full h-[120%] object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="container relative z-20 mx-auto px-6 py-20">
          <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
            <div className="max-w-4xl w-full">
              <h1 className="mb-6">
                <span className="block text-6xl font-black text-white">{copy.heroTitleTop}</span>
                <span className="block text-6xl font-black text-primary">{copy.heroTitleBottom}</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {[copy.why1Title, copy.why2Title, copy.why3Title].map((t, i) => (
            <div key={i} className="bg-card border rounded-3xl p-8 text-center">{t}</div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
          {[copy.t1, copy.t2, copy.t3, copy.t4].map((t, i) => (
            <div key={i} className="bg-card border rounded-3xl p-8">
              <p className="mb-6">"{t}"</p>
              <div className="pt-5 border-t text-center">
                <div className="font-bold">DRX</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
