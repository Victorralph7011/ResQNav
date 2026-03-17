import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INITIAL_VIEW = {
  longitude: 77.209,
  latitude: 28.6139,
  zoom: 12,
};

const MOCK_INCIDENTS = [
  { id: 1, lng: 77.2310, lat: 28.6280 },
  { id: 2, lng: 77.1855, lat: 28.5535 },
  { id: 3, lng: 77.2507, lat: 28.5700 },
];

/* ═══════════════════════════════════════════════════
   MAP DEMO — /map-demo
   Real OpenFreeMap dark-mode background + glassmorphic auth overlay
   ═══════════════════════════════════════════════════ */
export default function MapDemo() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState('00:00');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Auto-redirect logged-in users to their real dashboard
  useEffect(() => {
    if (!loading && user) {
      const target = userRole === 'responder' ? '/emergency' : '/navigation';
      navigate(target, { replace: true });
    }
  }, [user, userRole, loading, navigate]);

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
      {/* ── Real Map Background ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          filter: isDarkMode
            ? 'invert(100%) hue-rotate(180deg) contrast(90%)'
            : 'none',
          transition: 'filter 0.5s ease',
        }}
      >
        <Map
          initialViewState={INITIAL_VIEW}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          interactive={false}
        >
          {MOCK_INCIDENTS.map((inc) => (
            <Marker key={inc.id} longitude={inc.lng} latitude={inc.lat} anchor="center">
              <div
                className="w-4 h-4 bg-red-500 rounded-full"
                style={{
                  boxShadow: '0 0 15px rgba(239,68,68,0.8)',
                  filter: isDarkMode
                    ? 'invert(100%) hue-rotate(180deg) contrast(111%)'
                    : 'none',
                }}
              />
            </Marker>
          ))}
        </Map>
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

      {/* ── Glassmorphic Auth Overlay (only for unauthenticated users) ── */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-20 flex items-center justify-center"
        >
          <div className="backdrop-blur-md bg-black/50 border border-white/[0.1] rounded-2xl px-10 py-10 max-w-md w-full mx-6 text-center shadow-2xl relative">
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
      )}

      {/* ── Dark/Light toggle — top-right ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-20 right-20 z-30"
      >
        <button
          onClick={() => setIsDarkMode((d) => !d)}
          className="flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-lg"
          title={isDarkMode ? 'Switch to Light Map' : 'Switch to Dark Map'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-300" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-300" />
          )}
        </button>
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
