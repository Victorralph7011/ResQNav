import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function FadeUp({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Mock live mini-chart ── */
function MiniChart() {
  const [pts, setPts] = useState(() => Array.from({ length: 20 }, () => 30 + Math.random() * 40));
  useEffect(() => {
    const id = setInterval(() => {
      setPts((p) => [...p.slice(1), 30 + Math.random() * 40]);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const range = max - min || 1;
  const w = 280, h = 80;
  const d = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="opacity-80">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(74,222,128,0.3)" />
          <stop offset="100%" stopColor="rgba(74,222,128,0)" />
        </linearGradient>
        <filter id="chartGlow"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d={d + ` L${w},${h} L0,${h} Z`} fill="url(#chartGrad)" />
      <path d={d} fill="none" stroke="#4ade80" strokeWidth="2" filter="url(#chartGlow)" />
    </svg>
  );
}

/* ── Scrolling news feed ── */
function NewsFeed() {
  const items = [
    { time: '2s ago', text: 'NH-48 cleared by ResQNav in 4m 12s' },
    { time: '18s ago', text: 'Priority corridor activated: Sector 21 → AIIMS' },
    { time: '45s ago', text: '3 commuter routes recalculated around Ring Road' },
    { time: '1m ago', text: 'Fire engine dispatched to Connaught Place' },
    { time: '2m ago', text: 'AQI spike detected near Anand Vihar — rerouting' },
  ];
  return (
    <div className="space-y-2.5 max-h-[200px] overflow-hidden">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 + i * 0.15 }}
          className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3.5 py-2.5"
        >
          <span className="text-[10px] text-zinc-600 whitespace-nowrap font-medium mt-0.5">{item.time}</span>
          <span className="text-[12px] text-zinc-400 leading-relaxed">{item.text}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function Features() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-14 relative">
      {/* ── Background Texture Layer ── */}
      <div 
        className="fixed inset-0 w-full h-screen z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/city-grid.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.25
        }}
      />
      
      {/* ── Content Layer ── */}
      <div className="relative z-10 w-full">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
        <motion.span
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-white/[0.06] bg-white/[0.02] text-[12px] font-semibold text-zinc-600 tracking-wider uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          Core Features
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="text-[10vw] sm:text-[7vw] font-black text-white tracking-[-0.06em] leading-[0.85]"
        >
          Everything connected.
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className="text-[10vw] sm:text-[7vw] font-black text-white/20 tracking-[-0.06em] leading-[0.85]"
        >
          Always live.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
          className="text-[15px] sm:text-[17px] text-zinc-600 max-w-lg mx-auto mt-6"
        >
          A real-time data hub connecting traffic, weather, AI, and emergency systems into one unified dashboard.
        </motion.p>
      </section>

      {/* ── Bento Grid ── */}
      <section className="max-w-6xl mx-auto px-8 pb-28">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Widget 1: Live Gridlock Analytics */}
          <FadeUp className="lg:col-span-2" delay={0.2}>
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">Live Gridlock Analytics</span>
              </div>
              <MiniChart />
              <div className="flex items-center gap-6 mt-4 text-[12px] text-zinc-600">
                <span>Peak: <strong className="text-white/70">8.2k vehicles/hr</strong></span>
                <span>Avg delay: <strong className="text-white/70">14 min</strong></span>
                <span className="ml-auto text-emerald-400/70 font-semibold">↓ 23% vs yesterday</span>
              </div>
            </div>
          </FadeUp>

          {/* Widget 2: Weather & AQI */}
          <FadeUp delay={0.4}>
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500 h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="flex items-center gap-2 mb-5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 16.25"/></svg>
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">Environment</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-3 flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">Temperature</span>
                  <span className="text-[16px] font-bold text-white/80">34°C</span>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-3 flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">AQI Index</span>
                  <span className="text-[16px] font-bold text-amber-400/80">142</span>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-3 flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">Wind</span>
                  <span className="text-[16px] font-bold text-white/80">12km/h</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-400/60 mt-3 font-medium">⚠ AQI: 142 — Route visibility low</p>
            </div>
          </FadeUp>

          {/* Widget 3: City Alert Feed */}
          <FadeUp delay={0.6} className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="flex items-center gap-2 mb-5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">City Alert News Feed</span>
              </div>
              <NewsFeed />
            </div>
          </FadeUp>

          {/* Widget 4: AI Verification */}
          <FadeUp delay={0.8}>
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500 h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">AI Verification</span>
              </div>
              <div className="text-center py-4">
                <div className="text-[48px] font-black text-white tracking-[-0.04em]">99.2%</div>
                <div className="text-[12px] text-zinc-600 mt-1">Incident verification accuracy</div>
              </div>
              <div className="space-y-2 mt-4">
                {['Multi-modal input', 'Gemini Vision analysis', 'GPS cross-referencing'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-zinc-500">
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Widget 5: Signal Override */}
          <FadeUp delay={1.0} className="lg:col-span-3">
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">Traffic Signal Override Status</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { name: 'NH-48 Junction A', status: 'Override Active', active: true },
                  { name: 'Sector 21 Signal', status: 'Priority Green', active: true },
                  { name: 'Ring Road Crossing', status: 'Normal Cycle', active: false },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
                    <div>
                      <div className="text-[13px] text-white/70 font-medium">{s.name}</div>
                      <div className="text-[10px] text-zinc-600">{s.status}</div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${s.active ? 'bg-white animate-pulse' : 'bg-zinc-700'}`} />
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
      </div>
    </div>
  );
}
