
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import gsap from 'gsap';

interface PerformanceCoachProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

const PerformanceCoach: React.FC<PerformanceCoachProps> = ({ isOpen, onClose, lang }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo('.coach-panel', { x: '100%' }, { x: '0%', duration: 0.6, ease: 'power4.out' });
    }
  }, [isOpen]);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startSession = async () => {
    try {
      setIsActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputContext.createMediaStreamSource(stream);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-4), `Coach: ${text}`]);
            }
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              setIsSpeaking(true);
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are the DRX Performance Coach. You are an expert in sports nutrition and supplements. Be concise, technical, and motivating. Help users optimize their performance using DRX products.',
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsActive(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
    setIsSpeaking(false);
    setTranscription([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="coach-panel w-full max-w-md bg-bg-card border-l border-white/10 h-full relative z-10 flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-2xl font-black font-oswald uppercase tracking-tight">DRX <span className="text-drxred">Performance Coach</span></h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Neural Interaction Active</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white font-mono text-xs uppercase">[ Close ]</button>
        </div>

        <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-12">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full border-4 border-drxred/20 flex items-center justify-center relative ${isActive ? 'animate-pulse' : ''}`}>
               <div className={`w-24 h-24 rounded-full bg-drxred/10 flex items-center justify-center transition-all duration-500 ${isSpeaking ? 'scale-110 bg-drxred/30' : 'scale-100'}`}>
                  <div className={`w-12 h-12 rounded-full bg-drxred flex items-center justify-center shadow-[0_0_30px_#e11d48]`}>
                    <span className="text-2xl">🤖</span>
                  </div>
               </div>
               {isSpeaking && (
                 <div className="absolute -inset-4 border border-drxred/40 rounded-full animate-ping"></div>
               )}
            </div>
            {isActive && (
              <div className="mt-8 flex gap-1 justify-center h-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-1 bg-drxred rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s`, height: isSpeaking ? '100%' : '20%' }}></div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full space-y-4">
            {transcription.length === 0 ? (
              <p className="text-center text-zinc-600 font-mono text-[10px] uppercase tracking-mega">Initialize uplink to speak with coach</p>
            ) : (
              <div className="space-y-2">
                {transcription.map((t, i) => (
                  <p key={i} className="text-[11px] font-mono text-zinc-400 uppercase leading-relaxed tracking-tight border-l border-drxred/30 pl-3">
                    {t}
                  </p>
                ))}
              </div>
            )}
          </div>

          {!isActive ? (
            <button 
              onClick={startSession}
              className="w-full bg-drxred text-white py-6 font-black uppercase tracking-[0.4em] text-xs hover:bg-white hover:text-black transition-all shadow-2xl"
            >
              Initialize Interaction
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="w-full border border-drxred text-drxred py-6 font-black uppercase tracking-[0.4em] text-xs hover:bg-drxred hover:text-white transition-all"
            >
              Terminate Uplink
            </button>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-black/40 text-[9px] font-mono text-zinc-700 uppercase leading-relaxed tracking-[0.2em]">
          Uplink utilizes Gemini 2.5 Performance Logic. Biological data is processed locally within the DRX Matrix.
        </div>
      </div>
    </div>
  );
};

export default PerformanceCoach;
