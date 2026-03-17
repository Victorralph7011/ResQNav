import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════
   CHATBOT DEMO — /chatbot-demo
   Futuristic chat UI shell + glassmorphic auth overlay
   ═══════════════════════════════════════════════════ */

const DEMO_MESSAGES = [
  { role: 'ai', text: "Welcome to ResQNav AI. I'm your emergency verification assistant. Describe an incident and I'll verify it in real-time." },
  { role: 'user', text: 'Multi-vehicle collision on NH-48 near Sector 21.' },
  { role: 'ai', text: '✓ Verified with 98.7% confidence. Cross-referenced with live traffic feeds and satellite imagery. Emergency services notified. Commuter rerouting active in a 2km radius.' },
  { role: 'user', text: 'Are there any alternate routes available?' },
  { role: 'ai', text: 'Analyzing 3 alternate corridors… Priority route via Ring Road activated. ETA reduced from 22 min to 8 min. Displaying on your map now.' },
];

export default function ChatbotDemo() {
  return (
    <div className="relative w-full h-screen bg-[#0A0A0A] overflow-hidden flex items-center justify-center">
      {/* ── Chat UI Shell ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg mx-6 bg-[#0C0C0C] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">ResQNav AI</div>
              <div className="text-[10px] text-emerald-400/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 inline-block" />
                Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-medium">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Demo</span>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[380px] overflow-y-auto px-5 py-4 space-y-3">
          {DEMO_MESSAGES.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-white/90 text-black rounded-br-md'
                    : 'bg-white/[0.04] border border-white/[0.06] text-zinc-400 rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-start"
          >
            <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        </div>

        {/* Input bar (disabled) */}
        <div className="px-5 py-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center px-4">
              <span className="text-[12px] text-zinc-700">Describe an incident...</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center opacity-30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Glassmorphic Auth Overlay ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-20 flex items-center justify-center"
      >
        <div className="backdrop-blur-md bg-black/50 border border-white/[0.1] rounded-2xl px-10 py-10 max-w-md w-full mx-6 text-center shadow-2xl">
          {/* Top glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />

          {/* Shield icon */}
          <div className="w-12 h-12 mx-auto mb-5 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <h2 className="text-[20px] font-bold text-white tracking-tight mb-2">
            Emergency AI Verification requires authentication.
          </h2>
          <p className="text-[14px] text-zinc-500 leading-relaxed mb-8">
            Sign in to report incidents, verify emergencies in real-time, and trigger priority corridor activations.
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
