import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

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

const STACK = [
  {
    name: 'React',
    desc: 'Component-based UI architecture with hooks-driven state management.',
    category: 'Frontend',
    color: 'from-cyan-400/20 to-cyan-400/0',
  },
  {
    name: 'Vite',
    desc: 'Lightning-fast HMR dev server and optimized production bundler.',
    category: 'Build Tool',
    color: 'from-purple-400/20 to-purple-400/0',
  },
  {
    name: 'Tailwind CSS',
    desc: 'Utility-first CSS framework for rapid, consistent UI development.',
    category: 'Styling',
    color: 'from-sky-400/20 to-sky-400/0',
  },
  {
    name: 'MapLibre GL',
    desc: 'Open-source map rendering engine with WebGL-powered dark-mode maps.',
    category: 'Maps',
    color: 'from-emerald-400/20 to-emerald-400/0',
  },
  {
    name: 'Google Gemini',
    desc: 'Multi-modal AI for incident image verification with 99.2% accuracy.',
    category: 'AI / ML',
    color: 'from-blue-400/20 to-blue-400/0',
  },
  {
    name: 'Firebase',
    desc: 'Authentication, Firestore real-time database, and cloud hosting.',
    category: 'Backend',
    color: 'from-amber-400/20 to-amber-400/0',
  },
  {
    name: 'OSRM',
    desc: 'Open Source Routing Machine for real-time shortest-path calculations.',
    category: 'Routing',
    color: 'from-rose-400/20 to-rose-400/0',
  },
  {
    name: 'Nominatim',
    desc: 'OpenStreetMap geocoding — converts text addresses to GPS coordinates.',
    category: 'Geocoding',
    color: 'from-orange-400/20 to-orange-400/0',
  },
  {
    name: 'Framer Motion',
    desc: 'Production-ready animation library for buttery-smooth UI transitions.',
    category: 'Animation',
    color: 'from-pink-400/20 to-pink-400/0',
  },
];

export default function TechStack() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-14">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-white/[0.06] bg-white/[0.02] text-[12px] font-semibold text-zinc-600 tracking-wider uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          Under the Hood
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10vw] sm:text-[7vw] font-black text-white tracking-[-0.06em] leading-[0.85]"
        >
          Powered by
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10vw] sm:text-[7vw] font-black text-white/20 tracking-[-0.06em] leading-[0.85]"
        >
          the edge.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-[15px] sm:text-[17px] text-zinc-600 max-w-lg mx-auto mt-6"
        >
          A modern, open-source-first stack built for speed, scalability, and zero vendor lock-in.
        </motion.p>
      </section>

      {/* ── Tech Grid ── */}
      <section className="max-w-6xl mx-auto px-8 pb-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STACK.map((tech, i) => (
            <FadeUp key={tech.name} delay={i * 0.06}>
              <div className="relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 overflow-hidden group hover:border-white/[0.25] transition-all duration-500 cursor-default h-full">
                {/* Top glow accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                {/* Hover gradient */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${tech.color}`} />

                <div className="relative z-10">
                  <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] block mb-3">{tech.category}</span>
                  <h3 className="text-[22px] font-bold text-white tracking-tight mb-2 group-hover:text-white transition-colors">{tech.name}</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">{tech.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Philosophy bar */}
        <FadeUp delay={0.4}>
          <div className="mt-16 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <p className="text-[14px] text-zinc-500 leading-relaxed max-w-2xl mx-auto">
              <span className="text-white font-semibold">Zero paid APIs.</span> Every mapping, routing, and geocoding service in ResQNav is free and open-source. No vendor lock-in, no surprise bills. Just fast, reliable infrastructure.
            </p>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
