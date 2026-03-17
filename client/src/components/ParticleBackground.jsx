import { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ═══════════════════════════════════════════════════
   SINGLE PARTICLE — each gets its own parallax transform
   ═══════════════════════════════════════════════════ */
function Particle({ data, scrollYProgress }) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -500 * data.speed]);

  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        left: `${data.left}%`,
        top: `${data.top}%`,
        width: data.width,
        height: data.height,
        opacity: data.opacity,
        rotate: `${data.rotation}deg`,
        y,
        boxShadow: '0 0 8px rgba(255,255,255,0.1)',
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   PARTICLE BACKGROUND — scattered parallax dashes
   ═══════════════════════════════════════════════════ */
export default function ParticleBackground() {
  const { scrollYProgress } = useScroll();

  /* Generate 60 random particle configs (stable across re-renders) */
  const particles = useMemo(() => {
    const seed = [];
    for (let i = 0; i < 60; i++) {
      seed.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: 10 + Math.random() * 30,       // 10–40px
        height: 2 + Math.random() * 2,         // 2–4px
        opacity: 0.05 + Math.random() * 0.15,  // 0.05–0.20
        rotation: -20 + Math.random() * 40,     // -20° to +20°
        speed: 0.5 + Math.random() * 2,         // 0.5–2.5 parallax multiplier
      });
    }
    return seed;
  }, []);

  return (
    <>
      {particles.map((p) => (
        <Particle key={p.id} data={p} scrollYProgress={scrollYProgress} />
      ))}
    </>
  );
}
