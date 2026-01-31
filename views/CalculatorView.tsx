import React from 'react';
import Calculator from '../components/Calculator';
const CalculatorView: React.FC<{
  lang: 'ar' | 'en';
}> = ({
  lang
}) => {
  return <div className="py-10">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-5xl font-oswald uppercase mb-4 tracking-tighter font-medium font-sans md:text-4xl">
          Personalized <span className="text-drxred">Science</span>
        </h1>
        <p className="text-sm font-mono uppercase tracking-[0.2em] text-zinc-50">
          Optimized Nutrition for the Modern Athlete
        </p>
      </div>
      <Calculator lang={lang} />
    </div>;
};
export default CalculatorView;