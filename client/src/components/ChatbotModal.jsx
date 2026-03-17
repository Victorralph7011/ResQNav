import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DEMO_RESPONSES = [
  "I've detected a potential incident based on your description. Let me verify this against our spatial database... ✓ Location confirmed near NH-48, Sector 21. What type of emergency are you reporting?",
  "Understood. I've cross-referenced this with live traffic feeds and satellite imagery. Incident verified with 98.7% confidence. Emergency services have been notified, and commuter rerouting is now active in a 2km radius.",
];

export default function ChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Welcome to ResQNav AI. I'm your emergency verification assistant. Describe an incident or safety concern, and I'll verify it in real-time." },
  ]);
  const [input, setInput] = useState('');
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [demoEnded, setDemoEnded] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessages([
        { role: 'ai', text: "Welcome to ResQNav AI. I'm your emergency verification assistant. Describe an incident or safety concern, and I'll verify it in real-time." },
      ]);
      setInput('');
      setUserMsgCount(0);
      setIsTyping(false);
      setDemoEnded(false);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isTyping || demoEnded) return;

    const newCount = userMsgCount + 1;

    if (newCount > 2) {
      setDemoEnded(true);
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', text: input.trim() }]);
    setInput('');
    setUserMsgCount(newCount);
    setIsTyping(true);

    // Simulate AI "typing" delay
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', text: DEMO_RESPONSES[newCount - 1] }]);
      setIsTyping(false);
      if (newCount >= 2) {
        setTimeout(() => setDemoEnded(true), 1500);
      }
    }, 1500 + Math.random() * 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg bg-[#0C0C0C] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-white">ResQNav AI</h3>
                  <p className="text-[11px] text-zinc-600">Demo mode — {2 - userMsgCount} messages remaining</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/[0.04] flex items-center justify-center transition-colors cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="h-[380px] overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-white text-black rounded-br-md'
                      : 'bg-white/[0.04] border border-white/[0.06] text-zinc-300 rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              {/* Demo ended */}
              {demoEnded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto max-w-xs text-center py-4"
                >
                  <div className="backdrop-blur-md bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4">
                    <p className="text-[13px] text-zinc-400 mb-3">Demo limit reached. Log in to continue emergency reporting.</p>
                    <Link
                      to="/auth/commuter"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-white text-black text-[13px] font-semibold rounded-full hover:bg-zinc-200 transition-colors"
                    >
                      Sign up free
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={demoEnded || isTyping}
                  placeholder={demoEnded ? 'Demo ended' : 'Describe an incident...'}
                  className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[13px] text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/[0.15] transition-colors disabled:opacity-40"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || demoEnded || isTyping}
                  className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
