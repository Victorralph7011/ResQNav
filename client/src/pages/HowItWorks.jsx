import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

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

const STEPS = [
  {
    num: '01',
    title: 'Crowdsourced Report',
    desc: 'A commuter witnesses a multi-vehicle collision on NH-48. They open ResQNav and snap a photo with their phone, automatically tagging their GPS coordinates.',
    detail: 'Image + GPS + timestamp captured',
    icon: '📸',
  },
  {
    num: '02',
    title: 'Gemini AI Verification',
    desc: 'The report is instantly sent to Google Gemini Vision, which analyzes the image for vehicle damage, smoke, road blockage, and cross-references with nearby traffic sensor data.',
    detail: '98.7% confidence — Verified in 2.4s',
    icon: '🤖',
  },
  {
    num: '03',
    title: 'Green Corridor Activation',
    desc: 'ResQNav calculates the fastest path from the nearest hospital to the incident. Traffic signals along this corridor are overridden to priority green. Ambulance dispatched.',
    detail: 'Corridor cleared in 8 seconds',
    icon: '🟢',
  },
  {
    num: '04',
    title: 'Commuter Rerouting',
    desc: 'Every commuter within a 5km radius receives a live route update. Their navigation instantly shifts to alternative roads, preventing secondary gridlock and keeping the corridor clear.',
    detail: '3,400+ routes recalculated',
    icon: '🔄',
  },
];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-14 relative" ref={containerRef}>
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
          The Process
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="text-[10vw] sm:text-[7vw] font-black text-white tracking-[-0.06em] leading-[0.85]"
        >
          From report to rescue
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className="text-[10vw] sm:text-[7vw] font-black text-white/20 tracking-[-0.06em] leading-[0.85]"
        >
          in 3 seconds.
        </motion.h1>
      </section>

      {/* ── Cinematic Timeline ── */}
      <section className="relative max-w-4xl mx-auto px-8 pb-32">
        {/* Vertical progress line */}
        <div className="absolute left-[39px] sm:left-1/2 top-0 bottom-0 w-px bg-white/[0.06]">
          <motion.div className="w-full bg-gradient-to-b from-white/40 to-white/10" style={{ height: lineHeight }} />
        </div>

        <div className="space-y-24">
          {STEPS.map((step, i) => (
            <FadeUp key={step.num} delay={i * 0.2 + 0.2}>
              <div className={`relative flex items-start gap-8 ${i % 2 === 1 ? 'sm:flex-row-reverse sm:text-right' : ''}`}>
                {/* Timeline dot */}
                <div className="absolute left-[32px] sm:left-1/2 sm:-translate-x-1/2 w-[16px] h-[16px] rounded-full bg-[#0A0A0A] border-2 border-white/30 z-10 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white/60" />
                </div>

                {/* Content card */}
                <div className={`ml-16 sm:ml-0 sm:w-[calc(50%-40px)] ${i % 2 === 1 ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
                  <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{step.icon}</span>
                      <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-[0.2em]">Step {step.num}</span>
                    </div>
                    <h3 className="text-[20px] font-bold text-white tracking-tight mb-3">{step.title}</h3>
                    <p className="text-[14px] text-zinc-500 leading-relaxed mb-4">{step.desc}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-semibold text-zinc-500">{step.detail}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
