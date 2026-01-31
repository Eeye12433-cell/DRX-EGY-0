
import React, { useState } from 'react';
import { UserProfile, AINutritionResult } from '../types';
import { ACTIVITY_LEVELS, GOALS } from '../constants';
import { getNutritionAdvice } from '../services/aiService';
import gsap from 'gsap';

interface CalculatorProps {
  lang: 'ar' | 'en';
}

const Calculator: React.FC<CalculatorProps> = ({ lang }) => {
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    gender: 'male',
    weight: 75,
    height: 180,
    activity: 'moderate',
    goal: 'bulking'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AINutritionResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (profile.age < 14 || profile.age > 80) newErrors.age = lang === 'ar' ? 'العمر غير صالح' : 'Invalid Age';
    if (profile.weight < 30) newErrors.weight = lang === 'ar' ? 'الوزن قليل جداً' : 'Weight too low';
    if (profile.height < 100) newErrors.height = lang === 'ar' ? 'الطول غير صالح' : 'Invalid Height';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await getNutritionAdvice(profile, lang);
      setResult(data);
      setTimeout(() => {
        gsap.fromTo('.result-anim', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' });
      }, 100);
    } catch (err) {
      alert("AI SYSTEM FAILURE: Connection to Neural Hub lost.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-12">
      <div className="bg-[#111] border border-white/5 p-10 lg:p-16 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
           <span className="text-[10px] font-mono text-drxred uppercase tracking-[0.4em] animate-pulse">Neural Link v4.2.0 Active</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
           <div className="space-y-10">
              <h2 className="text-5xl lg:text-6xl font-black font-oswald uppercase text-white leading-none tracking-tighter">
                {lang === 'ar' ? 'تحليل الأداء' : 'Biological'} <span className="text-drxred">{lang === 'ar' ? 'الجيني' : 'Optimization'}</span>
              </h2>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest leading-relaxed">
                {lang === 'ar' 
                  ? 'أدخل بياناتك الحيوية للمزامنة مع مصفوفة DRX والحصول على بروتوكولات غذائية بمستوى صيدلاني.'
                  : 'Enter your current biometrics to synchronize with the DRX Matrix and receive pharmaceutical-grade nutritional protocols.'}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest font-bold">{lang === 'ar' ? 'العمر' : 'Biometric Age'}</label>
                    <input type="number" className="w-full bg-black border border-white/10 p-5 font-mono text-lg outline-none focus:border-drxred transition-all" value={profile.age} onChange={e => setProfile({...profile, age: +e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest font-bold">{lang === 'ar' ? 'النوع' : 'Genetic Gender'}</label>
                    <select className="w-full bg-black border border-white/10 p-5 font-mono text-sm outline-none focus:border-drxred h-[66px] appearance-none" value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value as any})}>
                      <option value="male">{lang === 'ar' ? 'ذكر' : 'Male [XY]'}</option>
                      <option value="female">{lang === 'ar' ? 'أنثى' : 'Female [XX]'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest font-bold">{lang === 'ar' ? 'الوزن (كجم)' : 'Mass [KG]'}</label>
                    <input type="number" className="w-full bg-black border border-white/10 p-5 font-mono text-lg outline-none focus:border-drxred" value={profile.weight} onChange={e => setProfile({...profile, weight: +e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest font-bold">{lang === 'ar' ? 'الطول (سم)' : 'Height [CM]'}</label>
                    <input type="number" className="w-full bg-black border border-white/10 p-5 font-mono text-lg outline-none focus:border-drxred" value={profile.height} onChange={e => setProfile({...profile, height: +e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest font-bold">{lang === 'ar' ? 'مستوى النشاط' : 'Kinetic Activity Factor'}</label>
                  <select className="w-full bg-black border border-white/10 p-5 font-mono text-sm outline-none focus:border-drxred appearance-none" value={profile.activity} onChange={e => setProfile({...profile, activity: e.target.value})}>
                    {ACTIVITY_LEVELS.map(a => (
                      <option key={a.id} value={a.id}>{lang === 'ar' ? a.label_ar : a.label_en}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest font-bold">{lang === 'ar' ? 'الهدف الرئيسي' : 'Primary Performance Target'}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {GOALS.map(g => (
                      <button 
                        key={g.id}
                        type="button"
                        onClick={() => setProfile({...profile, goal: g.id})}
                        className={`p-5 border font-mono text-[11px] uppercase transition-all text-center flex items-center justify-center gap-2 font-bold ${profile.goal === g.id ? 'bg-drxred border-drxred text-white' : 'bg-black border-white/10 text-zinc-600 hover:border-white/30'}`}
                      >
                        <span className="text-xl">{g.emoji}</span> {lang === 'ar' ? g.label_ar : g.label_en}
                      </button>
                    ))}
                  </div>
                </div>

                <button disabled={loading} className="w-full bg-white text-black py-7 font-black uppercase tracking-[0.4em] text-sm hover:bg-drxred hover:text-white transition-all disabled:opacity-50 mt-10">
                  {loading ? (lang === 'ar' ? 'جاري التحليل العلمي...' : 'Synthesizing Data...') : (lang === 'ar' ? 'بدء التحليل' : 'Execute Analysis')}
                </button>
              </form>
           </div>

           <div className="relative flex items-center justify-center min-h-[400px]">
              <div className="absolute inset-0 border-2 border-drxred/5 opacity-50 flex items-center justify-center">
                 <div className="w-[80%] h-[80%] border border-drxred/10 animate-spin-slow rounded-full"></div>
                 <div className="absolute w-[60%] h-[60%] border border-white/5 animate-reverse-slow rounded-full"></div>
              </div>
              
              {!result && !loading && (
                <div className="text-center relative z-10 space-y-6">
                   <div className="w-24 h-24 bg-drxred/10 border border-drxred/30 rounded-full mx-auto flex items-center justify-center animate-pulse">
                      <span className="text-4xl">🧬</span>
                   </div>
                   <p className="text-xs font-mono text-zinc-700 uppercase tracking-[0.5em]">Awaiting Input Sequence</p>
                </div>
              )}

              {loading && (
                <div className="text-center relative z-10 space-y-8">
                   <div className="w-20 h-20 border-2 border-drxred border-t-transparent rounded-full animate-spin mx-auto"></div>
                   <div className="space-y-2">
                     <p className="text-sm font-mono text-white uppercase tracking-widest animate-pulse">Processing Biological Data</p>
                     <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">Querying Lovable AI Engine...</p>
                   </div>
                </div>
              )}

              {result && (
                <div className="w-full space-y-8 relative z-10 result-anim">
                   <div className="bg-black/80 backdrop-blur-md border border-drxred/40 p-12 shadow-[0_0_50px_rgba(225,29,72,0.1)]">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase block mb-4 font-bold tracking-mega">Total Daily Energy Expenditure</span>
                      <div className="text-8xl font-oswald font-bold text-drxred leading-none">{result.tdee} <span className="text-2xl text-white font-mono uppercase opacity-40">Kcal/Day</span></div>
                      
                      <div className="grid grid-cols-3 gap-8 mt-14 border-t border-white/5 pt-12">
                         <div className="text-center group">
                            <div className="text-3xl font-oswald text-white group-hover:text-drxred transition-colors font-bold">{result.macros.protein}g</div>
                            <div className="text-[10px] font-mono text-zinc-600 uppercase mt-2 tracking-widest font-bold">Proteins</div>
                            <div className="h-1.5 bg-white/5 mt-4"><div className="h-full bg-drxred" style={{width: '85%'}}></div></div>
                         </div>
                         <div className="text-center group">
                            <div className="text-3xl font-oswald text-white group-hover:text-drxred transition-colors font-bold">{result.macros.carbs}g</div>
                            <div className="text-[10px] font-mono text-zinc-600 uppercase mt-2 tracking-widest font-bold">Carbohydrates</div>
                            <div className="h-1.5 bg-white/5 mt-4"><div className="h-full bg-blue-500" style={{width: '60%'}}></div></div>
                         </div>
                         <div className="text-center group">
                            <div className="text-3xl font-oswald text-white group-hover:text-drxred transition-colors font-bold">{result.macros.fats}g</div>
                            <div className="text-[10px] font-mono text-zinc-600 uppercase mt-2 tracking-widest font-bold">Lipids</div>
                            <div className="h-1.5 bg-white/5 mt-4"><div className="h-full bg-yellow-500" style={{width: '40%'}}></div></div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 result-anim">
           <div className="bg-[#0a0a0a] border border-white/5 p-12 space-y-8">
              <h3 className="text-2xl font-oswald uppercase text-white flex items-center gap-4 font-bold">
                 <div className="w-2 h-8 bg-drxred"></div> {lang === 'ar' ? 'خطة المكملات المقترحة' : 'Supplements Protocol'}
              </h3>
              <div className="space-y-5">
                 {result.recommendations.map((rec, i) => (
                   <div key={i} className="flex gap-5 items-start bg-black/40 p-6 border-l-4 border-drxred/40 hover:border-drxred transition-all">
                      <span className="text-drxred font-black font-mono text-sm">0{i+1}</span>
                      <p className="text-xs font-mono uppercase text-zinc-400 tracking-wide leading-relaxed">{rec}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#0a0a0a] border border-white/5 p-12 space-y-8">
              <h3 className="text-2xl font-oswald uppercase text-white flex items-center gap-4 font-bold">
                 <div className="w-2 h-8 bg-blue-500"></div> {lang === 'ar' ? 'استراتيجية الترطيب' : 'Hydration Matrix'}
              </h3>
              <div className="bg-black/40 p-8 border-l-4 border-blue-500/40">
                 <p className="text-xs font-mono uppercase text-zinc-400 leading-loose tracking-wider font-medium">
                    {result.hydration}
                 </p>
              </div>
              <div className="pt-6">
                 <h4 className="text-[11px] font-mono text-zinc-600 uppercase mb-5 tracking-[0.3em] font-bold">Scientific Rationale</h4>
                 <p className="text-sm text-zinc-500 italic leading-relaxed">
                    {result.explanation}
                 </p>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes reverse-slow { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-reverse-slow { animation: reverse-slow 15s linear infinite; }
      `}</style>
    </div>
  );
};

export default Calculator;
