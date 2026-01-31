import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import drxLogo from '@/assets/drx-logo.jpeg';
interface HomeProps {
  lang: 'ar' | 'en';
}
const Home: React.FC<HomeProps> = ({
  lang
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set([logoRef.current, titleRef.current, badgeRef.current, ctaRef.current], {
        opacity: 0,
        y: 100
      });
      gsap.set(hudRef.current, {
        opacity: 0,
        x: -50
      });
      gsap.set(scanlineRef.current, {
        scaleX: 0
      });

      // Master timeline
      const tl = gsap.timeline({
        delay: 0.3
      });

      // Scanline reveal
      tl.to(scanlineRef.current, {
        scaleX: 1,
        duration: 1.5,
        ease: 'power4.inOut'
      });

      // Logo reveal with 3D effect
      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power4.out'
      }, '-=0.8');

      // Floating animation for logo
      gsap.to(logoRef.current, {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1.5
      });

      // Badge reveal
      tl.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      }, '-=0.6');

      // Title lines stagger reveal
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.4');

      // CTA buttons
      tl.to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.3');

      // HUD elements
      tl.to(hudRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.5');

      // Continuous glow pulse on logo
      gsap.to(logoRef.current, {
        filter: 'drop-shadow(0 0 60px rgba(225, 29, 72, 0.6))',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);
  return <div className="-mt-24" ref={heroRef}>
      {/* HERO SECTION */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden bg-black">
        {/* Animated Scanline */}
        <div ref={scanlineRef} className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-drxred to-transparent z-20 origin-left"></div>

        {/* Background with Logo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(225,29,72,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(225,29,72,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
          {/* Radial Glow */}
          <div className="absolute inset-0 bg-gradient-radial from-drxred/10 via-transparent to-transparent"></div>
        </div>

        {/* Tactical Information HUD */}
        <div ref={hudRef} className="absolute top-32 left-10 z-10 hidden lg:block">
          <div className="space-y-2 border-l-2 border-drxred pl-4">
            <p className="text-[10px] font-mono text-drxred uppercase tracking-[0.5em] font-black">System Status: Optimal</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Sector: Egypt Distribution Matrix</p>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Protocol: Active</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container relative z-10 px-6 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 h-full">
          {/* Left: Logo */}
          <div className="flex-shrink-0 lg:flex-1 flex justify-center lg:justify-start">
            <img ref={logoRef} src={drxLogo} alt="DRX Logo" className="w-[300px] md:w-[450px] lg:w-[550px] h-auto object-contain drop-shadow-[0_0_40px_rgba(225,29,72,0.3)]" />
          </div>

          {/* Right: Content */}
          <div className="flex-1 max-w-2xl">
            {/* Badge */}
            <div ref={badgeRef} className="mb-8 flex items-center gap-6">
              <div className="w-16 h-0.5 bg-drxred"></div>
              <span className="bg-drxred/10 text-drxred px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.4em] font-black border border-drxred/30">
                {lang === 'ar' ? 'الموزع الرسمي المعتمد' : 'Official Certified Hub'}
              </span>
            </div>
            
            {/* Title */}
            <h1 ref={titleRef} className="text-6xl md:text-8xl lg:text-[9rem] font-black font-oswald text-white uppercase leading-[0.85] tracking-tighter mb-12">
              <span className="block text-drxred font-sans text-8xl">{lang === 'ar' ? 'أداء' : 'German'}</span>
              <span className="block">{lang === 'ar' ? 'ألماني' : 'Performance'}</span>
              <span className="block text-zinc-600">{lang === 'ar' ? 'فائق' : 'Engineering'}</span>
            </h1>
            
            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex gap-6 flex-wrap">
              <button onClick={() => window.location.hash = '#/shop'} className="group relative bg-drxred text-white px-12 py-6 font-black uppercase tracking-[0.3em] overflow-hidden btn-drx text-sm">
                <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                  {lang === 'ar' ? 'تصفح المتجر' : 'Shop Matrix'}
                </span>
                <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
              </button>
              <button onClick={() => window.location.hash = '#/calculator'} className="group relative bg-transparent border-2 border-zinc-600 text-white px-12 py-6 font-black uppercase tracking-[0.3em] overflow-hidden btn-drx text-sm hover:border-drxred">
                <span className="relative z-10 group-hover:text-drxred transition-colors duration-300">
                  {lang === 'ar' ? 'حاسبة الـ AI' : 'AI Science'}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Decorative Elements */}
        <div className="absolute bottom-10 left-10 z-10 text-white/20 font-mono text-[9px] uppercase tracking-[1em] rotate-90 origin-left hidden lg:block">
          DRX-EGYPT-MATRIX-V2
        </div>
        <div className="absolute bottom-10 right-10 z-10 text-zinc-600 font-mono text-[9px] uppercase tracking-[0.3em] hidden lg:block">
          2026 // Official Distributor
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-drxred rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>
    </div>;
};
export default Home;