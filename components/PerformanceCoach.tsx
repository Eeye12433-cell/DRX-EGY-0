
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { supabase } from "@/integrations/supabase/client";

interface PerformanceCoachProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PerformanceCoach: React.FC<PerformanceCoachProps> = ({ isOpen, onClose, lang }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo('.coach-panel', { x: '100%' }, { x: '0%', duration: 0.6, ease: 'power4.out' });
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('performance-coach', {
        body: { 
          messages: [...messages, userMessage],
          lang 
        }
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response || 'I apologize, but I could not process your request.' 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Coach error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: lang === 'ar' 
          ? 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
          : 'Connection error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="coach-panel w-full max-w-md bg-bg-card border-l border-white/10 h-full relative z-10 flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-2xl font-black font-oswald uppercase tracking-tight">DRX <span className="text-drxred">Performance Coach</span></h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Powered by Lovable AI</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white font-mono text-xs uppercase">[ Close ]</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center py-16 space-y-6">
              <div className="w-20 h-20 bg-drxred/10 border-2 border-drxred/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🏋️</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-mono text-zinc-400 uppercase tracking-wider">
                  {lang === 'ar' ? 'مرحباً! أنا مدربك الشخصي' : 'Welcome! I\'m your Performance Coach'}
                </p>
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                  {lang === 'ar' ? 'اسألني عن التغذية والمكملات والتمارين' : 'Ask me about nutrition, supplements & training'}
                </p>
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 ${
                msg.role === 'user' 
                  ? 'bg-drxred text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl' 
                  : 'bg-zinc-900 border border-white/10 text-zinc-300 rounded-tl-xl rounded-tr-xl rounded-br-xl'
              }`}>
                <p className="text-sm font-inter leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl">
                <div className="flex gap-1.5">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-2 h-2 bg-drxred rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-6 border-t border-white/5 bg-black/40">
          <div className="flex gap-3">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question...'}
              className="flex-1 bg-black border border-white/10 px-5 py-4 font-inter text-sm outline-none focus:border-drxred transition-all"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-drxred text-white px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-white/5 bg-black/60 text-[9px] font-mono text-zinc-700 uppercase leading-relaxed tracking-[0.15em]">
          Powered by Lovable AI • Sports nutrition & supplement guidance
        </div>
      </div>
    </div>
  );
};

export default PerformanceCoach;
