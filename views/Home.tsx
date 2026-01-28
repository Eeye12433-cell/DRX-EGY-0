
import React from 'react';

interface HomeProps {
  lang: 'ar' | 'en';
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  return (
    <div className="-mt-24">
      {/* HERO SECTION */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden bg-black">
        {/* Main Brand Image Integration */}
        <div className="absolute inset-0 z-0">
          <img 
            src="input_file_2.png" 
            className="w-full h-full object-cover opacity-80"
            alt="DRX Performance Hero"
          />
          {/* Scientific Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-black/20 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Tactical Information HUD */}
        <div className="absolute top-32 left-10 z-10 hidden lg:block">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-drxred uppercase tracking-[0.5em] font-black">System Status: Optimal</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Sector: Egypt Distribution Matrix</p>
          </div>
        </div>

        <div className="container relative z-10 px-6 flex justify-end items-center h-full">
          <div 
            className="max-w-5xl bg-drxred p-12 md:p-24 shadow-[0_40px_100px_-20px_rgba(225,29,72,0.4)] border-r-[12px] border-white/20 backdrop-blur-sm" 
            style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}
          >
            <div className="mb-12 flex items-center gap-8">
               <div className="w-16 h-0.5 bg-black/40"></div>
               <span className="bg-black/80 text-white px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.6em] font-black border border-white/10">
                 {lang === 'ar' ? 'الموزع الرسمي المعتمد' : 'Official Certified Hub'}
               </span>
            </div>
            
            <h1 className="text-8xl md:text-[11.5rem] font-black font-oswald text-white uppercase leading-[0.78] tracking-tighter mb-16 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              {lang === 'ar' ? 'أداء' : 'German'} <br/>
              <span className="text-black">{lang === 'ar' ? 'ألماني' : 'Performance'}</span><br/>
              {lang === 'ar' ? 'فائق' : 'Engineering'}
            </h1>
            
            <div className="flex gap-8 flex-wrap">
              <button 
                onClick={() => window.location.hash = '#/shop'}
                className="bg-black text-white px-16 py-8 font-black uppercase tracking-[0.4em] hover:bg-zinc-900 transition-all btn-drx border border-white/10 text-lg group"
              >
                <span className="group-hover:text-drxred transition-colors">
                  {lang === 'ar' ? 'تصفح المتجر' : 'Shop Matrix'}
                </span>
              </button>
              <button 
                onClick={() => window.location.hash = '#/calculator'}
                className="bg-white text-black px-16 py-8 font-black uppercase tracking-[0.4em] hover:bg-drxred hover:text-white transition-all btn-drx shadow-2xl text-lg"
              >
                {lang === 'ar' ? 'حاسبة الـ AI' : 'AI Science'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Deco */}
        <div className="absolute bottom-10 left-10 z-10 text-white/20 font-mono text-[9px] uppercase tracking-[1em] rotate-90 origin-left">
          DRX-EGYPT-MATRIX-V2
        </div>
      </section>
    </div>
  );
};

export default Home;
