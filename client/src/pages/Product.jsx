import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';

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

export default function Product() {
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
      <section className="relative flex flex-col items-center justify-center min-h-[70vh] text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
        <motion.span
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-white/[0.06] bg-white/[0.02] text-[12px] font-semibold text-zinc-600 tracking-wider uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          Platform Overview
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="text-[12vw] sm:text-[8vw] font-black text-white tracking-[-0.06em] leading-[0.85]"
        >
          ResQNav
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className="text-[15px] sm:text-[18px] text-zinc-500 max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          An AI-powered smart-city platform that saves lives by clearing emergency corridors in real-time while dynamically rerouting civilian traffic away from incidents.
        </motion.p>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-2 gap-16">
          <FadeUp>
            <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-[0.2em] block mb-5">The Problem</span>
            <h2 className="text-[6vw] sm:text-[3vw] font-bold text-white tracking-[-0.04em] leading-[1] mb-6">
              12.4 billion hours<br/> lost annually.
            </h2>
            <p className="text-[15px] text-zinc-500 leading-relaxed">
              Every year, billions of hours are wasted in traffic congestion. During emergencies, stuck ambulances cost lives. Current systems react too slowly, rely on outdated infrastructure, and leave commuters stranded.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-[0.2em] block mb-5">Our Solution</span>
            <h2 className="text-[6vw] sm:text-[3vw] font-bold text-white tracking-[-0.04em] leading-[1] mb-6">
              Clear the path.<br/> In 8 seconds.
            </h2>
            <p className="text-[15px] text-zinc-500 leading-relaxed">
              ResQNav uses crowdsourced incident reports verified by Gemini AI, then instantly activates priority corridors for emergency vehicles while rerouting all civilian traffic. The entire process takes under 8 seconds from report to rescue.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Architecture Overview ── */}
      <section className="border-y border-white/[0.04] py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-[0.2em] block mb-5">Platform Architecture</span>
            <h2 className="text-[6vw] sm:text-[3.5vw] font-bold text-white tracking-[-0.04em] leading-[1] mb-12">
              Three engines.<br/> One mission.
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Incident Engine', desc: 'Crowdsourced reports verified by Gemini Vision AI with 99.2% accuracy. Image, GPS, and voice data analyzed in under 3 seconds.', icon: '⚡' },
              { title: 'Routing Engine', desc: 'OSRM-powered pathfinding calculates optimal corridors for emergency vehicles and alternative routes for commuters simultaneously.', icon: '🗺️' },
              { title: 'Signal Engine', desc: 'Dynamic traffic signal overrides create green corridors along the emergency path. Commuter signals adjust in real-time.', icon: '🚦' },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.2 + 0.2}>
                <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 h-full relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <span className="text-3xl mb-6 block">{item.icon}</span>
                  <h3 className="text-[18px] font-bold text-white mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-[14px] text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 text-center px-8">
        <FadeUp>
          <h2 className="text-[8vw] sm:text-[5vw] font-black text-white tracking-[-0.05em] leading-[0.9] mb-6">
            See it in action.
          </h2>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/features" className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-[15px] font-bold rounded-full hover:bg-zinc-200 transition-all">
              Explore Features
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/how-it-works" className="text-[15px] font-medium text-zinc-600 hover:text-white transition-colors">
              How it Works →
            </Link>
          </div>
        </FadeUp>
      </section>
      </div>
    </div>
  );
}
