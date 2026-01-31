
import React from 'react';
import Calculator from '../components/Calculator';

const CalculatorView: React.FC<{lang: 'ar' | 'en'}> = ({ lang }) => {
  return (
    <div className="py-10">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl font-black font-oswald uppercase mb-4 tracking-tighter">
          Personalized <span className="text-drxred">Science</span>
        </h1>
        <p className="text-zinc-500 text-sm font-mono uppercase tracking-[0.2em]">
          Optimized Nutrition for the Modern Athlete
        </p>
      </div>
      <Calculator lang={lang} />
    </div>
  );
};

export default CalculatorView;
