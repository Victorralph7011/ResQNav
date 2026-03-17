import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════
   MAP DEMO — /map-demo
   Full-screen dark-mode map + glassmorphic auth overlay
   ═══════════════════════════════════════════════════ */
export default function MapDemo() {
  const [time, setTime] = useState('00:00');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#0A0A0A] overflow-hidden select-none">
      {/* ── Dark Map Canvas ── */}
      <div className="absolute inset-0">
        {/* Grid road network */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          {/* Minor grid */}
          {[80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="1920" y2={y} stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
          ))}
          {[120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1440, 1560, 1680, 1800].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="1080" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
          ))}

          {/* Major arteries */}
          <line x1="0" y1="540" x2="1920" y2="540" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="960" y1="0" x2="960" y2="1080" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="0" y1="360" x2="1920" y2="360" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          <line x1="480" y1="0" x2="480" y2="1080" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          <line x1="1440" y1="0" x2="1440" y2="1080" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />

          {/* Diagonal expressway */}
          <line x1="200" y1="900" x2="1700" y2="180" stroke="rgba(255,255,255,0.035)" strokeWidth="1.5" />

          {/* Priority route — dashed animated line */}
          <defs>
            <filter id="demoGlow">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path
            d="M200,780 C300,780 380,700 420,600 C460,500 500,380 600,320 C700,260 850,220 1000,240 C1150,260 1300,340 1400,380 C1500,420 1600,350 1720,300"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="30" fill="none" strokeLinecap="round" filter="url(#demoGlow)"
          />
          <path
            d="M200,780 C300,780 380,700 420,600 C460,500 500,380 600,320 C700,260 850,220 1000,240 C1150,260 1300,340 1400,380 C1500,420 1600,350 1720,300"
            stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"
            strokeDasharray="10 5"
            className="animate-pulse" style={{ animationDuration: '3s' }}
          />

          {/* Route endpoints */}
          <circle cx="200" cy="780" r="6" fill="white" opacity="0.7" />
          <circle cx="200" cy="780" r="12" fill="none" stroke="white" strokeWidth="1" opacity="0.15" />
          <circle cx="1720" cy="300" r="6" fill="white" opacity="0.7" />
          <circle cx="1720" cy="300" r="12" fill="none" stroke="white" strokeWidth="1" opacity="0.15" />

          {/* Congestion blocks */}
          <rect x="550" y="300" width="60" height="40" rx="6" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <rect x="900" y="500" width="70" height="35" rx="6" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <rect x="1300" y="250" width="50" height="50" rx="6" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        </svg>

        {/* Scattered traffic dots */}
        {Array.from({ length: 50 }).map((_, i) => {
          const x = 5 + ((i * 37) % 90);
          const y = 5 + ((i * 53) % 90);
          const size = 2 + (i % 3);
          const delay = (i * 0.07) % 2;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${x}%`, top: `${y}%`,
                width: size, height: size,
                opacity: 0.08 + (i % 5) * 0.03,
                animationDelay: `${delay}s`,
                animationDuration: `${2 + (i % 3) * 0.5}s`,
              }}
            />
          );
        })}
      </div>

      {/* ── HUD: Top-left info ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute top-20 left-6 z-10 flex items-center gap-3"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.12em]">Corridor Active</span>
        </div>
        <div className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
          <span className="text-[11px] font-semibold text-zinc-500 tracking-wide">{time}</span>
        </div>
      </motion.div>

      {/* ── HUD: Bottom-left stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute bottom-6 left-6 z-10 flex items-center gap-2"
      >
        {[
          { label: 'ETA', value: '4:12' },
          { label: 'Distance', value: '3.8 km' },
          { label: 'Delay', value: '−2 min' },
        ].map((s) => (
          <div key={s.label} className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <span className="text-[9px] text-zinc-600 uppercase tracking-wider mr-1.5">{s.label}</span>
            <span className="text-[11px] font-semibold text-white/70">{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* ── Glassmorphic Auth Overlay ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-20 flex items-center justify-center"
      >
        <div className="backdrop-blur-md bg-black/50 border border-white/[0.1] rounded-2xl px-10 py-10 max-w-md w-full mx-6 text-center shadow-2xl">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />

          {/* Lock icon */}
          <div className="w-12 h-12 mx-auto mb-5 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>

          <h2 className="text-[20px] font-bold text-white tracking-tight mb-2">Preview Mode Active</h2>
          <p className="text-[14px] text-zinc-500 leading-relaxed mb-8">
            Live routing is disabled. Sign in to access real-time priority corridors, incident tracking, and dynamic rerouting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth/commuter"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-black text-[14px] font-semibold rounded-full hover:bg-zinc-200 transition-all duration-300"
            >
              Log In
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/auth/commuter"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 border border-white/[0.1] text-white/80 text-[14px] font-medium rounded-full hover:bg-white/[0.06] hover:border-white/[0.2] transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Back button ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-20 right-6 z-30"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] text-zinc-500 font-medium hover:bg-white/[0.08] hover:text-white transition-all backdrop-blur-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </motion.div>
    </div>
  );
}
