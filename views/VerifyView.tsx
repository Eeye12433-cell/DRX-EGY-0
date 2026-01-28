
import React, { useState } from 'react';
import { VerificationCode } from '../types';

interface VerifyViewProps {
  lang: 'ar' | 'en';
  codes: Record<string, VerificationCode>;
  setCodes: React.Dispatch<React.SetStateAction<Record<string, VerificationCode>>>;
}

const VerifyView: React.FC<VerifyViewProps> = ({ lang, codes, setCodes }) => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'used' | 'invalid'>('idle');

  const handleVerify = () => {
    let cleanCode = input.trim().toUpperCase();
    
    // Auto-formatting help
    if (!cleanCode.startsWith('DRX-EGY-')) {
        const digits = cleanCode.match(/\d+/);
        if (digits) {
            cleanCode = `DRX-EGY-${digits[0].padStart(3, '0')}`;
        }
    }

    const codeObj = codes[cleanCode];

    if (!codeObj) {
      setStatus('invalid');
    } else if (codeObj.used) {
      setStatus('used');
    } else {
      const updated = { ...codes };
      updated[cleanCode] = { ...codeObj, used: true, usedAt: new Date().toISOString() };
      setCodes(updated);
      setStatus('success');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <h2 className="text-5xl font-oswald uppercase mb-6">{lang === 'ar' ? 'التحقق من' : 'Verify'} <span className="text-drxred">{lang === 'ar' ? 'الأصالة' : 'Authenticity'}</span></h2>
      <div className="bg-bg-card border border-white/10 p-10 rounded-xl">
        <div className="text-6xl mb-8">🛡️</div>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          {lang === 'ar' 
            ? 'أدخل الرمز الفريد الموجود أسفل ملصق DRX الخاص بك للتأكد من أن المنتج أصلي ومعتمد.' 
            : 'Enter the unique code found on your DRX label to ensure your product is authentic and certified.'}
        </p>

        <div className="max-w-sm mx-auto space-y-4">
          <input 
            type="text" 
            placeholder="DRX-EGY-XXX" 
            className="w-full bg-bg-primary border border-white/10 p-4 text-center text-xl font-mono tracking-widest outline-none focus:border-drxred"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button 
            onClick={handleVerify}
            className="btn-drx w-full bg-drxred py-4 font-bold uppercase tracking-widest"
          >
            {lang === 'ar' ? 'تحقق الآن' : 'Verify Now'}
          </button>
        </div>

        {status === 'success' && (
          <div className="mt-10 p-6 bg-green-500/10 border border-green-500 text-green-500 rounded animate-bounce">
            <h4 className="text-xl font-oswald mb-1">✓ AUTHENTIC PRODUCT</h4>
            <p className="text-xs">Verified DRX Pharmaceutical Grade Quality</p>
          </div>
        )}

        {status === 'used' && (
          <div className="mt-10 p-6 bg-red-500/10 border border-red-500 text-red-500 rounded">
            <h4 className="text-xl font-oswald mb-1">⚠️ CODE ALREADY USED</h4>
            <p className="text-xs">This code was previously verified. Product authenticity at risk.</p>
          </div>
        )}

        {status === 'invalid' && (
          <div className="mt-10 p-6 bg-zinc-500/10 border border-zinc-500 text-zinc-500 rounded">
            <h4 className="text-xl font-oswald mb-1">✕ INVALID CODE</h4>
            <p className="text-xs">Please check the code and try again. Codes follow DRX-EGY-XXX format.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyView;
