import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import drxLogo from '@/assets/drx-logo.jpeg';

interface HomeHeroProps {
  lang: 'ar' | 'en';
}

const HomeHero: React.FC<HomeHeroProps> = ({ lang }) => {
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);

  const isRTL = lang === 'ar';

  const copy = useMemo(() => ({
    badge: isRTL ? 'الموزّع الرسمي المعتمد' : 'Official Certified Hub',
    line1: isRTL ? 'أداء' : 'German',
    line2: isRTL ? 'ألماني' : 'Performance',
    line3: isRTL ? 'فائق' : 'Engineering',
    ctaShop: isRTL ? 'تصفّح المتجر' : 'Shop Matrix',
    ctaCalc: isRTL ? 'حاسبة الـ AI' : 'AI Science',
    hud1: 'System Status: Optimal',
    hud2: 'Sector: Egypt Distribution Matrix',
    hud3: 'Protocol: Active',
    decoLeft: 'DRX-EGYPT-MATRIX-V2',
    decoRight: '2026 // Official Distributor',
    logoAlt: 'DRX Logo'
  }), [isRTL]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([logoRef.current, titleRef.current, badgeRef.current, ctaRef.current], {
        opacity: 0,
        y: 80
      });
      gsap.set(hudRef.current, { opacity: 0, x: isRTL ? 50 : -50 });
      gsap.set(scanlineRef.current, { scaleX: 0 });

      const tl = gsap.timeline({ delay: 0.25 });

      tl.to(scanlineRef.current, {
        scaleX: 1,
        duration: 1.3,
        ease: 'power4.inOut'
      })
        .to(logoRef.current, { opacity: 1, y: 0, duration: 1.05 }, '-=0.7')
        .to(badgeRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.6')
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.9 }, '-=0.4')
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
        .to(hudRef.current, { opacity: 1, x: 0, duration: 0.5 }, '-=0.5');

      gsap.to(logoRef.current, {
        y: -12,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1.2
      });
    }, heroRef);

    return () => ctx.revert();
  }, [isRTL]);

  return (
    <div ref={heroRef} dir={isRTL ? 'rtl' : 'ltr'} className="-mt-24">
      <div className="w-screen relative left-1/2 -translate-x-1/2">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary text-text-main">
          
          {/* Scanline */}
          <div
            ref={scanlineRef}
            className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-drxred to-transparent z-20"
          />

          {/* Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-card to-bg-primary" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(225,29,72,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(225,29,72,0.25) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}
            />
          </div>

          {/* HUD */}
          <div ref={hudRef} className="absolute top-32 start-10 z-10 hidden lg:block">
            <div className="space-y-2 border-s-2 border-drxred ps-4">
              <p className="text-[10px] font-mono text-drxred uppercase tracking-[0.5em] font-black">
                {copy.hud1}
              </p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-[0.3em]">
                {copy.hud2}
              </p>
              <p className="text-[10px] font-mono text-muted uppercase tracking-[0.3em]">
                {copy.hud3}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="container relative z-10 px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex justify-center lg:justify-start">
              <img
                ref={logoRef}
                src={drxLogo}
                alt={copy.logoAlt}
                className="w-[300px] sm:w-[380px] md:w-[460px] lg:w-[580px] object-contain"
              />
            </div>

            <div className="max-w-2xl">
              <div ref={badgeRef} className="mb-8">
                <span className="bg-drxred/10 text-drxred px-6 py-2.5 font-mono uppercase tracking-[0.4em] font-black border border-drxred/30">
                  {copy.badge}
                </span>
              </div>

              <h1
                ref={titleRef}
                className="font-oswald font-black uppercase leading-[0.85] tracking-tighter mb-12 text-5xl sm:text-6xl md:text-7xl lg:text-[9rem]"
              >
                <span className="block text-drxred">{copy.line1}</span>
                <span className="block">{copy.line2}</span>
                <span className="block text-muted">{copy.line3}</span>
              </h1>

              <div ref={ctaRef} className="flex gap-6 flex-wrap">
                <button
                  onClick={() => navigate('/shop')}
                  className="bg-drxred text-white px-12 py-6 font-black uppercase tracking-[0.3em] btn-drx"
                >
                  {copy.ctaShop}
                </button>
                <button
                  onClick={() => navigate('/calculator')}
                  className="border border-ui px-12 py-6 font-black uppercase tracking-[0.3em] btn-drx"
                >
                  {copy.ctaCalc}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeHero;
