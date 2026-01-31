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

  const copy = useMemo(() => {
    return {
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
      logoAlt: 'DRX Logo',
      skipLabel: isRTL ? 'تخطي إلى المحتوى' : 'Skip to content',
      contentAria: isRTL ? 'محتوى القسم الرئيسي' : 'Hero main content',
      scrollLabel: isRTL ? 'مرّر لأسفل' : 'Scroll down'
    };
  }, [isRTL]);

  useEffect(() => {
    // Respect OS Reduced Motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Set to final state without animations
      gsap.set([logoRef.current, titleRef.current, badgeRef.current, ctaRef.current, hudRef.current], {
        opacity: 1,
        x: 0,
        y: 0,
        clearProps: 'transform'
      });
      gsap.set(scanlineRef.current, { scaleX: 1, clearProps: 'transform' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([logoRef.current, titleRef.current, badgeRef.current, ctaRef.current], {
        opacity: 0,
        y: 80
      });
      gsap.set(hudRef.current, { opacity: 0, x: isRTL ? 50 : -50 });
      gsap.set(scanlineRef.current, { scaleX: 0, transformOrigin: 'left center' });

      const tl = gsap.timeline({ delay: 0.25 });

      tl.to(scanlineRef.current, {
        scaleX: 1,
        duration: 1.3,
        ease: 'power4.inOut'
      });

      tl.to(
        logoRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: 'power4.out'
        },
        '-=0.75'
      );

      // Gentle float
      gsap.to(logoRef.current, {
        y: -12,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1.2
      });

      tl.to(
        badgeRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'back.out(1.7)'
        },
        '-=0.6'
      );

      tl.to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: 'power3.out'
        },
        '-=0.45'
      );

      tl.to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power2.out'
        },
        '-=0.3'
      );

      tl.to(
        hudRef.current,
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          ease: 'power2.out'
        },
        '-=0.55'
      );

      // Glow pulse
      gsap.to(logoRef.current, {
        filter: 'drop-shadow(0 0 60px rgba(225, 29, 72, 0.6))',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.8
      });
    }, heroRef);

    return () => ctx.revert();
  }, [isRTL]);

  return (
    <div className="-mt-24" ref={heroRef} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Full-bleed breakout */}
      <div className="w-screen relative left-1/2 -translate-x-1/2">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-[999] bg-black text-white border border-zinc-700 px-4 py-2 font-mono text-xs"
        >
          {copy.skipLabel}
        </a>

        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-black">
          {/* Scanline */}
          <div
            ref={scanlineRef}
            className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-drxred to-transparent z-20 origin-left"
            aria-hidden="true"
          />

          {/* Background */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />

            {/* Grid */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(225,29,72,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(225,29,72,0.3) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}
            />

            {/* Radial glow */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at center, rgba(225,29,72,0.12) 0%, transparent 60%)'
              }}
            />
          </div>

          {/* HUD */}
          <div ref={hudRef} className="absolute top-32 start-10 z-10 hidden lg:block">
            <div className="space-y-2 border-s-2 border-drxred ps-4">
              <p className="text-[10px] font-mono text-drxred uppercase tracking-[0.5em] font-black">
                {copy.hud1}
              </p>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
                {copy.hud2}
              </p>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
                {copy.hud3}
              </p>
            </div>
          </div>

          {/* Content */}
          <div
            id="main"
            aria-label={copy.contentAria}
            className="container relative z-10 px-6 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 h-full"
          >
            {/* Logo */}
            <div className="flex-shrink-0 lg:flex-1 flex justify-center lg:justify-start">
              <img
                ref={logoRef}
                src={drxLogo}
                alt={copy.logoAlt}
                className="w-[280px] sm:w-[340px] md:w-[450px] lg:w-[560px] h-auto object-contain drop-shadow-[0_0_40px_rgba(225,29,72,0.3)] shadow-md"
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Text */}
            <div className="flex-1 max-w-2xl">
              {/* Badge */}
              <div ref={badgeRef} className="mb-8 flex items-center gap-6">
                <span className="bg-drxred/10 text-drxred px-6 py-2.5 font-mono uppercase tracking-[0.4em] font-black border border-drxred/30 text-base sm:text-lg lg:text-xl">
                  {copy.badge}
                </span>
              </div>

              {/* Title */}
              <h1
                ref={titleRef}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-[9rem] font-black font-oswald text-white uppercase leading-[0.85] tracking-tighter mb-10 sm:mb-12"
              >
                <span className="block text-drxred font-sans text-6xl sm:text-7xl md:text-8xl lg:text-[8rem]">
                  {copy.line1}
                </span>
                <span className="block">{copy.line2}</span>
                <span className="block text-zinc-600">{copy.line3}</span>
              </h1>

              {/* CTAs */}
              <div ref={ctaRef} className="flex gap-4 sm:gap-6 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="group relative bg-drxred text-white px-8 sm:px-12 py-5 sm:py-6 font-black uppercase tracking-[0.3em] overflow-hidden btn-drx text-sm focus:outline-none focus:ring-2 focus:ring-drxred/60"
                >
                  <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                    {copy.ctaShop}
                  </span>
                  <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/calculator')}
                  className="group relative bg-transparent border-2 border-zinc-600 text-white px-8 sm:px-12 py-5 sm:py-6 font-black uppercase tracking-[0.3em] overflow-hidden btn-drx text-sm hover:border-drxred focus:outline-none focus:ring-2 focus:ring-drxred/60"
                >
                  <span className="relative z-10 group-hover:text-drxred transition-colors duration-300">
                    {copy.ctaCalc}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Decorative labels */}
          <div className="absolute bottom-20 sm:bottom-10 start-10 z-10 text-white/20 font-mono text-[9px] uppercase tracking-[1em] rotate-90 origin-left hidden lg:block">
            {copy.decoLeft}
          </div>
          <div className="absolute bottom-20 sm:bottom-10 end-10 z-10 text-zinc-600 font-mono text-[9px] uppercase tracking-[0.3em] hidden lg:block">
            {copy.decoRight}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-10" aria-label={copy.scrollLabel}>
            <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-drxred rounded-full animate-bounce" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeHero;
