
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { getNearbyLogisticsHubs } from '../services/geminiService';

interface TrackOrderViewProps {
  lang: 'ar' | 'en';
  orders: Order[];
}

const TrackOrderView: React.FC<TrackOrderViewProps> = ({ lang, orders }) => {
  const [query, setQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [nearbyHubs, setNearbyHubs] = useState<{text: string, grounding: any[]} | null>(null);
  const [loadingHubs, setLoadingHubs] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setQuery(id);
      const order = orders.find(o => o.trackingNumber === id || o.id === id);
      if (order) {
        setFoundOrder(order);
        setHasSearched(true);
      }
    }
  }, [location.search, orders]);

  useEffect(() => {
    if (foundOrder && hasSearched) {
      // Trigger Maps Grounding to find nearby distribution centers
      fetchNearbyHubs();
    }
  }, [foundOrder, hasSearched]);

  const fetchNearbyHubs = async () => {
    setLoadingHubs(true);
    try {
      // Attempt to get user location for more accurate grounding
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const hubs = await getNearbyLogisticsHubs(pos.coords.latitude, pos.coords.longitude);
          setNearbyHubs(hubs);
          setLoadingHubs(false);
        },
        async () => {
          // Default to Cairo coordinates if geo fails
          const hubs = await getNearbyLogisticsHubs(30.0444, 31.2357);
          setNearbyHubs(hubs);
          setLoadingHubs(false);
        }
      );
    } catch (err) {
      console.error(err);
      setLoadingHubs(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find(o => o.trackingNumber === query.trim().toUpperCase() || o.id === query.trim());
    setFoundOrder(order || null);
    setHasSearched(true);
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
          <input type="text" placeholder="ENTER TRACKING IDENTIFIER (DRX-TRK-XXX)" className="flex-1 bg-black border border-white/5 p-6 font-mono text-lg outline-none focus:border-drxred uppercase tracking-widest transition-all" value={query} onChange={e => setQuery(e.target.value)} />
          <button type="submit" className="bg-drxred text-white px-12 py-6 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl">Initialize</button>
        </form>
      </div>

      {hasSearched && foundOrder && (
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
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-bg-card border border-white/5 p-8 sm:p-12">
                <h4 className="text-sm font-bold uppercase mb-8 text-drxred font-oswald tracking-widest">Logistics Manifest</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-zinc-400 font-mono text-[11px] uppercase">
                  <div>
                    <label className="text-zinc-600 block mb-2">Authenticated Consignee</label>
                    <p className="text-white text-lg">{foundOrder.shippingInfo.fullName}</p>
                  </div>
                  <div>
                    <label className="text-zinc-600 block mb-2">Destination Node</label>
                    <p className="text-white">{foundOrder.shippingInfo.address || "Local Pickup Link Active"}</p>
                  </div>
                </div>
              </div>

              {/* MAPS GROUNDING SECTION */}
              <div className="bg-[#0a0a0a] border border-blue-500/20 p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4"><span className="text-[8px] font-mono text-blue-500 uppercase tracking-widest">Google Maps Grounding Active</span></div>
                <h4 className="text-sm font-bold uppercase mb-8 text-blue-500 font-oswald tracking-widest flex items-center gap-3">
                   <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center"><span className="text-[8px]">📍</span></div>
                   Nearby Distribution Nodes (Egypt Sector)
                </h4>
                
                {loadingHubs ? (
                  <div className="py-10 text-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : nearbyHubs ? (
                  <div className="space-y-6">
                    <p className="text-xs font-mono text-zinc-400 leading-relaxed uppercase">{nearbyHubs.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      {nearbyHubs.grounding.map((chunk: any, i: number) => (
                        chunk.maps && (
                          <a key={i} href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="bg-black border border-white/10 p-4 hover:border-blue-500 transition-all flex flex-col gap-1 group">
                             <span className="text-[10px] font-bold text-white uppercase group-hover:text-blue-500">{chunk.maps.title}</span>
                             <span className="text-[8px] text-zinc-600 uppercase tracking-tighter">Verified Logistics Node • Open in Maps</span>
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] font-mono text-zinc-700 uppercase italic">Uplink to Google Maps unsuccessful.</p>
                )}
              </div>
            </div>

            <div className="bg-bg-card border border-white/5 p-8 sm:p-12">
              <h4 className="text-sm font-bold uppercase mb-8 text-drxred font-oswald tracking-widest">Inventory</h4>
              <div className="space-y-4 font-mono text-[10px] uppercase">
                {foundOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-zinc-400"><span>{item.quantity}x {item.product.name_en}</span><span>{(item.product.price * item.quantity).toLocaleString()} LE</span></div>
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

      {hasSearched && !foundOrder && (
        <div className="text-center py-32 bg-bg-card border border-white/10 animate-in fade-in duration-500">
          <div className="text-7xl mb-6 opacity-40">🛸</div>
          <h3 className="text-4xl font-black font-oswald uppercase text-white mb-2">Record Non-Existent</h3>
          <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.4em]">Tracking uplink failure</p>
          <button onClick={() => setHasSearched(false)} className="mt-8 px-10 py-4 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-drxred hover:border-drxred transition-all">Retry Connection</button>
        </div>
      )}
    </div>
  );
};

export default TrackOrderView;
