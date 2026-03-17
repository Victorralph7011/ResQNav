import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Map, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import ChatbotModal from '../components/ChatbotModal';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/ParticleBackground';

/* ═══════════════════════════════════════════════════
   ANIMATED BACKGROUND — subtle moving grid + noise
   ═══════════════════════════════════════════════════ */
function AnimatedGrid() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Mouse glow */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full transition-all duration-1000 ease-out"
        style={{
          left: mouse.x - 400,
          top: mouse.y - 400,
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A0A0A_100%)]" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LETTER-BY-LETTER STAGGER REVEAL
   ═══════════════════════════════════════════════════ */
function StaggerLetters({ text, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  const letters = text.split('');

  return (
    <div ref={ref} className={`flex overflow-hidden ${className}`}>
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: '120%', opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: delay + i * 0.04,
          }}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FADE-UP REVEAL
   ═══════════════════════════════════════════════════ */
function FadeUp({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });

  return (
    <motion.div
      ref={ref}
      initial={{ y: 50, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   3-ACT MAP SEQUENCE (naturally flowing layout)
   ═══════════════════════════════════════════════════ */
function StickyMapSequence() {
  return (
    <div className="relative z-10 flex flex-col">
      {/* Shared dark map canvas background */}
      <div className="absolute inset-0 bg-[#080808]">
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          {/* Horizontal roads */}
          {[120, 240, 360, 480, 600, 720, 840, 960].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="1920" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}
          {/* Vertical roads */}
          {[160, 320, 480, 640, 800, 960, 1120, 1280, 1440, 1600, 1760].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="1080" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}
          {/* Main arteries */}
          <line x1="0" y1="540" x2="1920" y2="540" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="960" y1="0" x2="960" y2="1080" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <line x1="0" y1="360" x2="1920" y2="360" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          <line x1="480" y1="0" x2="480" y2="1080" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          <line x1="1440" y1="0" x2="1440" y2="1080" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          {/* Diagonal expressway */}
          <line x1="200" y1="900" x2="1700" y2="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* ─── ACT 1: The Gridlock ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full flex flex-col items-center justify-center py-40 my-12 overflow-hidden"
      >
        {/* Traffic dots */}
        <div className="absolute inset-0">
          {Array.from({ length: 60 }).map((_, i) => {
            const x = 15 + ((i * 37) % 70);
            const y = 10 + ((i * 53) % 80);
            const size = 2 + (i % 3);
            const delay = (i * 0.07) % 2;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: size,
                  height: size,
                  opacity: 0.15 + (i % 5) * 0.06,
                  animationDelay: `${delay}s`,
                  animationDuration: `${1.5 + (i % 3) * 0.5}s`,
                }}
              />
            );
          })}
          {/* Congestion clusters */}
          {[
            { x: '42%', y: '45%', s: 160 },
            { x: '55%', y: '50%', s: 120 },
            { x: '48%', y: '38%', s: 100 },
            { x: '38%', y: '55%', s: 90 },
            { x: '60%', y: '42%', s: 80 },
          ].map((c, i) => (
            <div
              key={`cluster-${i}`}
              className="absolute rounded-full animate-pulse"
              style={{
                left: c.x, top: c.y,
                width: c.s, height: c.s,
                transform: 'translate(-50%,-50%)',
                background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Act 1 text */}
        <div className="relative z-10 text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-[8vw] sm:text-[6vw] font-bold text-white tracking-[-0.05em] leading-[0.9]"
          >
            Cities are choking.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="text-zinc-600 text-[14px] sm:text-[16px] mt-4 tracking-wide"
          >
            12.4 billion hours lost to traffic annually
          </motion.p>
        </div>
      </motion.section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   INFINITE MARQUEE
   ═══════════════════════════════════════════════════ */
function Marquee() {
  const text = 'PRIORITY ROUTING \u00A0•\u00A0 AI VERIFIED \u00A0•\u00A0 ZERO GRIDLOCK \u00A0•\u00A0 ';
        const repeated = text.repeat(4);

        return (
        <section className="py-12 overflow-hidden border-y border-white/[0.04]">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="text-[8vw] sm:text-[6vw] font-bold tracking-[-0.04em] marquee-stroke shrink-0 pr-4">
              {repeated}
            </span>
            <span className="text-[8vw] sm:text-[6vw] font-bold tracking-[-0.04em] marquee-stroke shrink-0 pr-4" aria-hidden>
              {repeated}
            </span>
          </div>
        </section>
        );
}

        /* ═══════════════════════════════════════════════════
           CHATBOT FEATURE SECTION
           ═══════════════════════════════════════════════════ */
        function ChatbotFeature() {
  const ref = useRef(null);
        const {scrollYProgress} = useScroll({target: ref, offset: ['start end', 'end start'] });
        const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
        const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

        return (
        <div ref={ref} className="relative py-16 flex items-center overflow-hidden">
          <motion.div className="absolute right-0 top-0 w-[50%] h-full" style={{ y: imgY }}>
            <div className="w-full h-full bg-[#0E0E0E] border border-white/[0.06] rounded-xl overflow-hidden relative">
              {/* Chat UI Mockup */}
              <div className="absolute inset-0 flex flex-col">
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-white/80">ResQNav AI</div>
                    <div className="text-[10px] text-emerald-400/70 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 inline-block" /> Online</div>
                  </div>
                </div>
                {/* Chat messages */}
                <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
                  <div className="flex justify-start"><div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed">Welcome. Describe an incident and I'll verify it in real-time.</div></div>
                  <div className="flex justify-end"><div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-white/90 text-[11px] text-black leading-relaxed">Multi-vehicle collision on NH-48</div></div>
                  <div className="flex justify-start"><div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed">✓ Verified with 98.7% confidence. Emergency services notified. Rerouting active.</div></div>
                  {/* Typing indicator */}
                  <div className="flex justify-start">
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
                {/* Chat input */}
                <div className="px-4 py-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06]" />
                    <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </motion.div>
          <motion.div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-16 pr-[55%]" style={{ y: textY }}>
            <FadeUp>
              <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-4 block">Incident Reporting</span>
              <h3 className="text-[5vw] sm:text-[3.5vw] font-bold text-white tracking-[-0.04em] leading-[1] mb-6">Standalone AI Chatbot</h3>
              <p className="text-[15px] sm:text-[17px] text-zinc-500 leading-relaxed max-w-md mb-8">Gemini-powered verification engine. Report incidents with geotagged images, live GPS, and voice — verified in under 3 seconds against our spatial database.</p>
              <Link to="/chat" className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white/[0.06] border border-white/[0.1] text-white/90 text-[13px] font-semibold rounded-full hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-300 backdrop-blur-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                Try Chatbot Demo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              </Link>
            </FadeUp>
          </motion.div>
        </div>
        );
}

        /* ═══════════════════════════════════════════════════
           MAP FEATURE SECTION
           ═══════════════════════════════════════════════════ */
        function MapFeature() {
  const ref = useRef(null);
        const {scrollYProgress} = useScroll({target: ref, offset: ['start end', 'end start'] });
        const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
        const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

        return (
        <div ref={ref} className="relative py-16 flex items-center overflow-hidden">
          <motion.div className="absolute left-0 top-0 w-[50%] h-full" style={{ y: imgY }}>
            <div className="w-full h-full bg-[#0B0B0B] border border-white/[0.06] rounded-xl overflow-hidden relative">
              {/* Abstract map */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
                {/* Grid roads */}
                {[80, 160, 240, 320, 400].map(y => <line key={`mh${y}`} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                {[100, 200, 300, 400, 500].map(x => <line key={`mv${x}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                {/* Main arterials */}
                <line x1="0" y1="250" x2="600" y2="250" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                <line x1="300" y1="0" x2="300" y2="500" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                {/* Congestion blocks */}
                <rect x="180" y="200" width="40" height="30" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <rect x="350" y="280" width="50" height="25" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <rect x="420" y="150" width="35" height="40" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                {/* Glowing priority route */}
                <defs>
                  <filter id="mapRouteGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <path d="M60,420 C120,400 160,340 200,280 C240,220 280,180 340,170 C400,160 440,200 480,220 C520,240 550,200 570,160" stroke="rgba(255,255,255,0.1)" strokeWidth="20" fill="none" strokeLinecap="round" filter="url(#mapRouteGlow)" className="animate-pulse" style={{ animationDuration: '3s' }} />
                <path d="M60,420 C120,400 160,340 200,280 C240,220 280,180 340,170 C400,160 440,200 480,220 C520,240 550,200 570,160" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="8 4" />
                {/* Route endpoints */}
                <circle cx="60" cy="420" r="5" fill="white" opacity="0.8" /><circle cx="60" cy="420" r="9" fill="none" stroke="white" strokeWidth="1" opacity="0.2" />
                <circle cx="570" cy="160" r="5" fill="white" opacity="0.8" /><circle cx="570" cy="160" r="9" fill="none" stroke="white" strokeWidth="1" opacity="0.2" />
              </svg>
              {/* HUD overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <div className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /><span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Corridor Active</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                  <span className="text-[10px] font-semibold text-zinc-500">ETA 4:12</span>
                </div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </motion.div>
          <motion.div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-16 pl-[55%]" style={{ y: textY }}>
            <FadeUp>
              <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-4 block">Emergency Response</span>
              <h3 className="text-[5vw] sm:text-[3.5vw] font-bold text-white tracking-[-0.04em] leading-[1] mb-6">Live Priority Maps</h3>
              <p className="text-[15px] sm:text-[17px] text-zinc-500 leading-relaxed max-w-md mb-8">Dark-mode Google Maps with real-time green corridor overrides. Emergency vehicles get priority routing while commuters are dynamically rerouted around incidents.</p>
              <Link to="/map-demo" className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white/[0.06] border border-white/[0.1] text-white/90 text-[13px] font-semibold rounded-full hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-300 backdrop-blur-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Try Map Demo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              </Link>
            </FadeUp>
          </motion.div>
        </div>
        );
}

        /* ═══════════════════════════════════════════════════
           ENVIRONMENT DATA FEATURE SECTION
           ═══════════════════════════════════════════════════ */
        function EnvironmentFeature() {
  const ref = useRef(null);
        const {scrollYProgress} = useScroll({target: ref, offset: ['start end', 'end start'] });
        const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
        const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

        return (
        <div ref={ref} className="relative py-16 flex items-center overflow-hidden">
          <motion.div className="absolute right-0 top-0 w-[50%] h-full flex items-center justify-center p-8" style={{ y: imgY }}>
            <div className="w-full max-w-md space-y-4">
              {/* Weather & Air Quality Card */}
              <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 16.25" /><path d="M16 16l-4 4-4-4" /></svg>
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">Weather & Air Quality</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-3 text-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 mx-auto mb-1.5"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" /></svg>
                    <div className="text-[18px] font-bold text-white/80">34°C</div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">Temperature</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-3 text-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 mx-auto mb-1.5"><path d="M17.7 7.7a7.5 7.5 0 10-11.4 0" /><path d="M9.5 21h5" /><path d="M12 17v4" /></svg>
                    <div className="text-[18px] font-bold text-white/80">142</div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">AQI Index</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-3 text-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 mx-auto mb-1.5"><path d="M17.7 7.7a2.5 2.5 0 111.8 4.3H2" /><path d="M9.6 4.6A2 2 0 1111 8H2" /><path d="M12.6 19.4A2 2 0 1014 16H2" /></svg>
                    <div className="text-[18px] font-bold text-white/80">12km/h</div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">Wind Speed</div>
                  </div>
                </div>
              </div>
              {/* Traffic Signal Status Card */}
              <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" /></svg>
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">Traffic Signal Status</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: 'NH-48 Junction A', status: 'Override Active', active: true },
                    { name: 'Sector 21 Signal', status: 'Priority Green', active: true },
                    { name: 'Ring Road Crossing', status: 'Normal Cycle', active: false },
                  ].map((signal) => (
                    <div key={signal.name} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-3.5 py-2.5">
                      <div>
                        <div className="text-[12px] text-white/70 font-medium">{signal.name}</div>
                        <div className="text-[10px] text-zinc-600">{signal.status}</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${signal.active ? 'bg-white animate-pulse' : 'bg-zinc-700'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-16 pr-[55%]" style={{ y: textY }}>
            <FadeUp>
              <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-4 block">Smart City Intelligence</span>
              <h3 className="text-[5vw] sm:text-[3.5vw] font-bold text-white tracking-[-0.04em] leading-[1] mb-6">Dynamic Environment Data</h3>
              <p className="text-[15px] sm:text-[17px] text-zinc-500 leading-relaxed max-w-md">Fuses live weather feeds, traffic signal APIs, air quality data, and crowd density to calculate the safest, fastest route — recalculated every 8 seconds.</p>
            </FadeUp>
          </motion.div>
        </div>
        );
}

        /* ═══════════════════════════════════════════════════
           HOME PAGE
           ═══════════════════════════════════════════════════ */
        export default function Home() {
  const heroRef = useRef(null);
        const [chatbotOpen, setChatbotOpen] = useState(false);
        const {user, userRole} = useAuth();
        const navigate = useNavigate();
        const {scrollYProgress: heroScroll } = useScroll({
          target: heroRef,
        offset: ['start start', 'end start'],
  });

        const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
        const heroScale = useTransform(heroScroll, [0, 0.6], [1, 0.92]);

        return (
        <div className="overflow-x-hidden bg-[#0A0A0A] relative">
          {/* ═══════════ FIXED CITY-GRID BACKGROUND ═══════════ */}
          <div
            className="fixed inset-0 w-full h-screen z-0 pointer-events-none"
            style={{
              backgroundImage: "url('/images/city-grid.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.2
            }}
          />

          {/* ═══════════ BACKGROUND TEXTURE ═══════════ */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")', mixBlendMode: 'overlay' }} />
            <div className="absolute inset-0 animate-drift" style={{ background: 'radial-gradient(ellipse 800px 600px at 30% 40%, rgba(255,255,255,0.03), transparent 70%)' }} />
            <div className="absolute inset-0 animate-drift-reverse" style={{ background: 'radial-gradient(ellipse 600px 800px at 70% 60%, rgba(255,255,255,0.02), transparent 70%)' }} />
          </div>

          {/* ═══════════ PARALLAX PARTICLE FIELD ═══════════ */}
          <div className="fixed inset-0 w-full h-screen z-[1] pointer-events-none overflow-hidden">
            <ParticleBackground />
          </div>

          {/* ═══════════ HERO ═══════════ */}
          <section ref={heroRef} className="relative z-20 bg-[#0A0A0A] h-screen flex flex-col items-center justify-center">
            <AnimatedGrid />

            <motion.div
              style={{ opacity: heroOpacity, scale: heroScale }}
              className="relative z-10 text-center px-4"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-white/[0.06] bg-white/[0.02]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                <span className="text-[12px] font-semibold text-zinc-600 tracking-wider uppercase">Powered by ResQNav</span>
              </motion.div>

              {/* Massive hero text */}
              <div className="mb-6">
                <StaggerLetters
                  text="NAVIGATE."
                  className="justify-center text-[14vw] sm:text-[12vw] font-black text-white tracking-[-0.06em] leading-[0.85]"
                  delay={0.3}
                />
                <StaggerLetters
                  text="SURVIVE."
                  className="justify-center text-[14vw] sm:text-[12vw] font-black text-white/20 tracking-[-0.06em] leading-[0.85]"
                  delay={0.6}
                />
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-[15px] sm:text-[17px] text-zinc-600 max-w-lg mx-auto leading-relaxed tracking-[-0.01em]"
              >
                AI-driven dynamic routing for smart cities. Prioritizing emergency responders. Rerouting commuters. Saving lives.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-center gap-4 mt-12"
              >
                <button
                  onClick={() => navigate(user ? '/navigation' : '/auth/commuter')}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black text-[14px] font-semibold rounded-full hover:bg-zinc-200 transition-all duration-300 cursor-pointer"
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                </button>
                <button
                  onClick={() => navigate(user ? '/chat' : '/auth/responder')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/[0.08] text-white/70 text-[14px] font-medium rounded-full hover:bg-white/[0.04] hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Emergency Portal
                </button>
              </motion.div>
            </motion.div>

            {/* Scroll cue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] text-zinc-700 font-semibold tracking-[0.2em] uppercase">Scroll</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-px h-8 bg-gradient-to-b from-zinc-700 to-transparent"
              />
            </motion.div>
          </section>

          {/* ═══════════ STICKY MAP SEQUENCE ═══════════ */}
          <StickyMapSequence />

          {/* ═══════════ LIVE RADAR MAP BENTO BOX ═══════════ */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-6xl mx-auto h-[500px] md:h-[600px] rounded-[2rem] overflow-hidden border border-white/10 backdrop-blur-md bg-white/5 mt-8 mb-16 shadow-2xl"
          >
            {/* MapLibre — dark mode via CSS invert trick */}
            <div
              className="w-full h-full absolute inset-0"
              style={{ filter: 'invert(100%) hue-rotate(180deg) contrast(90%)' }}
            >
              <Map
                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                initialViewState={{
                  longitude: 77.209,
                  latitude: 28.6139,
                  zoom: 12,
                }}
                scrollZoom={false}
                dragPan={false}
                dragRotate={false}
                doubleClickZoom={false}
                touchZoomRotate={false}
                style={{ width: '100%', height: '100%' }}
              >
                {/* Pulsing incident marker — styles are inverted back by parent filter */}
                <Marker longitude={77.209} latitude={28.6139} anchor="center">
                  <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(239,68,68,1)]" />
                </Marker>
              </Map>
            </div>

            {/* ── Floating UI overlays (above the inverted map) ── */}

            {/* Status Badge — Top Left */}
            <div className="absolute top-6 left-6 z-20 backdrop-blur-md bg-black/50 border border-white/10 text-white text-xs px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold tracking-wide">LIVE &bull; Gridlock Detected</span>
            </div>

            {/* Action Overlay — Bottom Right */}
            <div className="absolute bottom-6 right-6 z-20 backdrop-blur-md bg-white/10 border border-white/10 p-4 rounded-2xl text-white">
              <div className="flex items-center gap-2 mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                <span className="text-sm font-semibold">Priority routing engaged.</span>
              </div>
              <span className="text-[10px] text-zinc-400">Emergency corridor • NH-48 sector</span>
            </div>

            {/* ResQNav label — Top Right */}
            <div className="absolute top-6 right-6 z-20 backdrop-blur-md bg-black/40 border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full">
              ResQNav Radar
            </div>
          </motion.div>

          {/* ═══════════ LUSION-STYLE IMAGE SHOWCASE ═══════════ */}
          <section className="relative z-10 w-full max-w-[95rem] mx-auto px-6 md:px-12 pt-8 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              {[
                {
                  src: '/images/incident-verification.jpg',
                  title: 'Incident Verification',
                  category: 'AI • GEMINI VISION',
                },
                {
                  src: '/images/dynamic-rerouting.jpg',
                  title: 'Dynamic Rerouting',
                  category: 'WEB • OSRM ENGINE',
                  offset: true,
                },
                {
                  src: '/images/signal-override.jpg',
                  title: 'Signal Override System',
                  category: 'IOT • SMART INFRASTRUCTURE',
                },
                {
                  src: '/images/city-network.jpg',
                  title: 'Real-Time City Network',
                  category: 'DATA • AI MODEL',
                  offset: true,
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 150, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
                  className={card.offset ? 'md:mt-32' : ''}
                >
                  <div className="rounded-[2rem] overflow-hidden cursor-pointer">
                    <img
                      src={card.src}
                      alt={card.title}
                      className="w-full h-[60vh] object-cover transition-transform duration-[1500ms] hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-5 px-1">
                    <span className="text-zinc-400 text-sm tracking-widest font-semibold uppercase mb-1 block">{card.category}</span>
                    <h3 className="text-white font-bold text-xl md:text-2xl">{card.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ═══════════ MARQUEE ═══════════ */}
          <Marquee />

          {/* ═══════════ CINEMATIC FEATURES ═══════════ */}
          <section className="relative z-10 py-16">
            <div className="max-w-7xl mx-auto px-8 mb-12">
              <FadeUp>
                <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-[0.2em] block mb-5">Core Technology</span>
              </FadeUp>
              <FadeUp delay={0.1}>
                <h2 className="text-[6vw] sm:text-[4vw] font-bold text-white tracking-[-0.04em] leading-[1]">
                  Built different.
                </h2>
              </FadeUp>
            </div>

            <ChatbotFeature />
            <MapFeature />
            <EnvironmentFeature />
          </section>

          {/* ═══════════ STATS ROW ═══════════ */}
          <section className="relative z-10 border-y border-white/[0.04] py-16">
            <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { num: '8s', label: 'Avg. corridor clearance' },
                { num: '99.2%', label: 'Incident verification rate' },
                { num: '3.4M', label: 'Routes optimized daily' },
                { num: '<12s', label: 'Emergency dispatch time' },
              ].map((stat, i) => (
                <FadeUp key={stat.label} delay={i * 0.1}>
                  <div className="text-center">
                    <span className="text-[5vw] sm:text-[3vw] font-bold text-white tracking-[-0.04em]">{stat.num}</span>
                    <p className="text-[12px] text-zinc-600 mt-2 tracking-wide">{stat.label}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </section>

          {/* ═══════════ MASSIVE CTA ═══════════ */}
          <section className="relative z-10 py-16 px-8 text-center">
            <FadeUp>
              <h2 className="text-[10vw] sm:text-[7vw] font-black text-white tracking-[-0.05em] leading-[0.9] mb-4">
                Ready?
              </h2>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="text-[15px] sm:text-[17px] text-zinc-600 max-w-md mx-auto mb-12">
                Join the cities that never stop moving.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate(user ? '/navigation' : '/auth/commuter')}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-[15px] font-bold rounded-full hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  {user ? 'Go to Dashboard' : 'Enter Navigation'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                </button>
                <button
                  onClick={() => navigate(user ? '/chat' : '/auth/responder')}
                  className="text-[15px] font-medium text-zinc-600 hover:text-white transition-colors cursor-pointer"
                >
                  Responder Portal →
                </button>
              </div>
            </FadeUp>
          </section>

          {/* Chatbot Demo Modal */}
          <ChatbotModal isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
        </div>
        );
}
