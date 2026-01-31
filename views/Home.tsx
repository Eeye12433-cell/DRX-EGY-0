import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import drxLogo from '@/assets/drx-logo.jpeg';

interface HomeProps {
  lang: 'ar' | 'en';
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="
        relative
        min-h-screen
        w-screen
        left-1/2
        -translate-x-1/2
        flex
        items-center
        justify-center
        bg-bg-primary
        text-text-main
        transition-colors
        duration-300
      "
    >
      {/* BACKGROUND FRAME */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-black/10 dark:from-black dark:via-black dark:to-black" />

      <div className="relative z-10 max-w-7xl w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* LEFT – VISUAL */}
        <div className="flex justify-center">
          <img
            ref={logoRef}
            src={drxLogo}
            alt="DRX"
            className="
              w-[280px]
              sm:w-[380px]
              md:w-[480px]
              lg:w-[560px]
              xl:w-[640px]
              object-contain
              drop-shadow-2xl
            "
          />
        </div>

        {/* RIGHT – CONTENT */}
        <div className="space-y-10">
          <h1 className="font-oswald font-black uppercase leading-[0.9] tracking-tight text-5xl sm:text-6xl lg:text-7xl">
            <span className="block text-drxred">
              {lang === 'ar' ? 'علم مخصص' : 'Personalized'}
            </span>
            <span className="block">
              {lang === 'ar' ? 'للأداء' : 'Science'}
            </span>
          </h1>

          <p className="max-w-xl text-lg text-muted leading-relaxed">
            {lang === 'ar'
              ? 'تحليل متقدم مبني على البيانات لتحسين الأداء البدني والتغذية الذكية.'
              : 'Advanced data-driven analysis for optimized performance and smart nutrition.'}
          </p>

          <div className="flex gap-6 flex-wrap">
            <button className="btn-drx bg-drxred text-white px-10 py-5 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
              {lang === 'ar' ? 'ابدأ التحليل' : 'Start Analysis'}
            </button>

            <button className="btn-drx border border-ui px-10 py-5 font-black uppercase tracking-widest text-text-main hover:border-drxred transition-all">
              {lang === 'ar' ? 'استكشف' : 'Explore'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
