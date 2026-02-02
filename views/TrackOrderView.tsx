import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { OrderStatus } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface TrackedOrder {
  trackingNumber: string;
  status: string;
  shippingMethod: string;
  customerName: string;
  total: number;
  createdAt: string;
  items: Array<{
    product_name: string;
    quantity: number;
    product_price: number;
  }>;
}

interface TrackOrderViewProps {
  lang: 'ar' | 'en';
  orders?: never; // Remove the orders prop - no longer used
}

const TrackOrderView: React.FC<TrackOrderViewProps> = ({ lang }) => {
  const [query, setQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<TrackedOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const trackOrder = async (trackingNumber: string) => {
    if (!trackingNumber.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('track-order', {
        body: { trackingNumber: trackingNumber.trim().toUpperCase() }
      });

      if (fnError) throw fnError;

      if (data?.order) {
        setFoundOrder(data.order);
      } else {
        setFoundOrder(null);
        if (data?.error) {
          setError(data.error);
        }
      }
    } catch (err: any) {
      console.error('Track order error:', err);
      setError('Failed to track order. Please try again.');
      setFoundOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setQuery(id);
      trackOrder(id);
    }
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    trackOrder(query);
  };

  const statusSteps = [
    { status: OrderStatus.Pending, label: lang === 'ar' ? 'قيد الانتظار' : 'Order Received', icon: '📥', desc: 'Awaiting system confirmation' },
    { status: OrderStatus.Confirmed, label: lang === 'ar' ? 'تم التأكيد' : 'Matrix Confirmed', icon: '📋', desc: 'Biological assets verified' },
    { status: OrderStatus.Shipped, label: lang === 'ar' ? 'تم الشحن' : 'In Transit', icon: '🚚', desc: 'Neural link dispatched' },
    { status: OrderStatus.Delivered, label: lang === 'ar' ? 'تم التوصيل' : 'Delivered', icon: '📦', desc: 'Mission accomplished' },
  ];

  const currentStepIdx = foundOrder ? statusSteps.findIndex(s => s.status === foundOrder.status) : -1;

  return (
    <div className="max-w-5xl mx-auto py-20 px-4">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-block px-3 py-1 bg-drxred/10 border border-drxred/20 rounded-full mb-4">
           <span className="text-[10px] font-mono text-drxred uppercase tracking-[0.3em] font-bold">Logistics Uplink</span>
        </div>
        <h2 className="text-6xl lg:text-8xl font-black font-oswald uppercase tracking-tighter leading-none">
          Order <span className="text-drxred">Telemetry</span>
        </h2>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] max-w-lg mx-auto">
          Synchronizing with Nature's Rule Egypt Distribution Matrix
        </p>
      </div>

      <div className="bg-bg-card border border-white/10 p-2 sm:p-4 shadow-2xl mb-12 relative overflow-hidden group">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            placeholder="ENTER TRACKING IDENTIFIER (DRX-TRK-XXX)" 
            className="flex-1 bg-black border border-white/5 p-6 font-mono text-lg outline-none focus:border-drxred uppercase tracking-widest transition-all" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="bg-drxred text-white px-12 py-6 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Initialize'}
          </button>
        </form>
      </div>

      {hasSearched && isLoading && (
        <div className="text-center py-32 bg-bg-card border border-white/10 animate-in fade-in duration-500">
          <div className="text-7xl mb-6 animate-pulse">🔍</div>
          <h3 className="text-4xl font-black font-oswald uppercase text-white mb-2">Searching...</h3>
          <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.4em]">Querying distribution matrix</p>
        </div>
      )}

      {hasSearched && !isLoading && foundOrder && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
          <div className="bg-bg-card border border-white/10 p-8 sm:p-12 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20 relative z-10">
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Protocol Identifier</p>
                <h3 className="text-4xl sm:text-5xl font-oswald text-white font-bold tracking-tight">{foundOrder.trackingNumber}</h3>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Live Status</p>
                <span className="px-6 py-3 bg-drxred text-white font-black text-xs uppercase tracking-[0.3em] border border-white/10 flex items-center gap-3">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  {foundOrder.status}
                </span>
              </div>
            </div>

            <div className="relative pt-12 pb-16 px-4">
              <div className="absolute top-[32px] left-0 w-full h-0.5 bg-zinc-900 hidden md:block"></div>
              <div className="absolute top-[32px] left-0 h-0.5 bg-drxred hidden md:block transition-all duration-1000" style={{ width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%` }}></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                {statusSteps.map((step, idx) => {
                  const isPast = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div key={step.status} className="flex flex-row md:flex-col items-start md:items-center gap-6 md:text-center group">
                      <div className={`w-16 h-16 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${isPast ? 'border-drxred bg-black' : 'border-zinc-800 bg-zinc-950'} ${isCurrent ? 'ring-4 ring-drxred/20' : ''}`}>
                        <span className={`text-2xl ${isPast ? 'opacity-100' : 'opacity-20'}`}>{isPast && !isCurrent ? '✓' : step.icon}</span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <p className={`text-[11px] font-mono uppercase tracking-[0.2em] ${isPast ? 'text-white' : 'text-zinc-700'}`}>{step.label}</p>
                        <p className="text-[9px] font-mono text-zinc-500 uppercase">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-bg-card border border-white/5 p-8 sm:p-12">
              <h4 className="text-sm font-bold uppercase mb-8 text-drxred font-oswald tracking-widest">Logistics Manifest</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-zinc-400 font-mono text-[11px] uppercase">
                <div>
                  <label className="text-zinc-600 block mb-2">Authenticated Consignee</label>
                  <p className="text-white text-lg">{foundOrder.customerName}</p>
                </div>
                <div>
                  <label className="text-zinc-600 block mb-2">Delivery Method</label>
                  <p className="text-white">{foundOrder.shippingMethod}</p>
                </div>
              </div>
            </div>

            <div className="bg-bg-card border border-white/5 p-8 sm:p-12">
              <h4 className="text-sm font-bold uppercase mb-8 text-drxred font-oswald tracking-widest">Inventory</h4>
              <div className="space-y-4 font-mono text-[10px] uppercase">
                {foundOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-zinc-400">
                    <span>{item.quantity}x {item.product_name}</span>
                    <span>{(item.product_price * item.quantity).toLocaleString()} LE</span>
                  </div>
                ))}
                <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-end">
                   <span className="text-zinc-600">Gross Value</span>
                   <span className="text-3xl font-oswald text-white font-bold">{foundOrder.total.toLocaleString()} LE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasSearched && !isLoading && !foundOrder && (
        <div className="text-center py-32 bg-bg-card border border-white/10 animate-in fade-in duration-500">
          <div className="text-7xl mb-6 opacity-40">🛸</div>
          <h3 className="text-4xl font-black font-oswald uppercase text-white mb-2">Record Non-Existent</h3>
          <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.4em]">
            {error || 'Tracking uplink failure'}
          </p>
          <button onClick={() => setHasSearched(false)} className="mt-8 px-10 py-4 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-drxred hover:border-drxred transition-all">
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackOrderView;
