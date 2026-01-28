
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
  onCartClick: () => void;
  onAdminClick: () => void;
  cartCount: number;
  lang: 'ar' | 'en';
  setLang: (l: 'ar' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onMenuClick, onCartClick, onAdminClick, cartCount, lang, setLang, theme, setTheme 
}) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-[100] glass-nav transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuClick}
              className="p-2 hover:text-drxred transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="text-2xl md:text-3xl font-black font-oswald uppercase tracking-tighter"
            >
              DRX<span className="text-drxred">EGYPT</span>
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => navigate('/track')}
              className="px-3 py-1 font-mono text-[10px] border border-white/5 hover:border-drxred transition-all uppercase tracking-widest hidden md:block"
            >
              [ Track Order ]
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 hover:border-drxred transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1 font-mono text-xs font-bold border border-white/10 hover:border-drxred transition-colors rounded uppercase"
            >
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>
            <button 
              onClick={onAdminClick}
              className="p-2 hover:text-drxred transition-colors"
              title="Admin Panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button 
              onClick={onCartClick}
              className="relative p-2 hover:scale-110 transition-transform"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-drxred text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
