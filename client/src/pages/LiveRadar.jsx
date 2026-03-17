import { useState } from 'react';
import { Map, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion } from 'framer-motion';

const INITIAL_VIEW = {
  longitude: 77.209,
  latitude: 28.6139,
  zoom: 11,
};

const INCIDENTS = [
  {
    id: 1,
    lng: 77.2310,
    lat: 28.6280,
    title: 'Multi-Vehicle Collision',
    location: 'NH-48, Connaught Place',
    severity: 'Critical',
    time: '12s ago',
    verified: true,
    services: ['Ambulance', 'Police'],
  },
  {
    id: 2,
    lng: 77.1855,
    lat: 28.5535,
    title: 'Road Closure — Construction',
    location: 'Saket District Centre',
    severity: 'Moderate',
    time: '3m ago',
    verified: true,
    services: ['Traffic Police'],
  },
  {
    id: 3,
    lng: 77.2750,
    lat: 28.6350,
    title: 'Signal Malfunction',
    location: 'ITO Junction',
    severity: 'Low',
    time: '8m ago',
    verified: true,
    services: ['Maintenance'],
  },
  {
    id: 4,
    lng: 77.1500,
    lat: 28.5900,
    title: 'Pothole Hazard Reported',
    location: 'Dhaula Kuan Flyover',
    severity: 'Moderate',
    time: '14m ago',
    verified: false,
    services: [],
  },
];

const severityColor = {
  Critical: 'text-red-400',
  Moderate: 'text-amber-400',
  Low: 'text-zinc-400',
};

export default function LiveRadar() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="h-screen bg-[#0A0A0A] pt-14 relative overflow-hidden">
      {/* ── Full-screen dark map ── */}
      <div
        className="absolute inset-0 top-14 z-0"
        style={{
          filter: 'invert(100%) hue-rotate(180deg) contrast(90%)',
        }}
      >
        <Map
          initialViewState={INITIAL_VIEW}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
        >
          {/* Glowing red incident markers */}
          {INCIDENTS.map((inc) => (
            <Marker
              key={inc.id}
              longitude={inc.lng}
              latitude={inc.lat}
              anchor="center"
            >
              <button
                onClick={() => setSelected(inc)}
                className="relative cursor-pointer group"
                title={inc.title}
              >
                {/* Outer pulse ring */}
                <span
                  className="absolute inset-0 w-6 h-6 -m-1 rounded-full animate-ping"
                  style={{
                    backgroundColor:
                      inc.severity === 'Critical'
                        ? 'rgba(239,68,68,0.3)'
                        : inc.severity === 'Moderate'
                        ? 'rgba(251,191,36,0.25)'
                        : 'rgba(161,161,170,0.2)',
                  }}
                />
                {/* Core dot */}
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor:
                      inc.severity === 'Critical'
                        ? '#ef4444'
                        : inc.severity === 'Moderate'
                        ? '#f59e0b'
                        : '#a1a1aa',
                    boxShadow:
                      inc.severity === 'Critical'
                        ? '0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.4)'
                        : inc.severity === 'Moderate'
                        ? '0 0 16px rgba(245,158,11,0.6)'
                        : '0 0 10px rgba(161,161,170,0.3)',
                    filter: 'invert(100%) hue-rotate(180deg) contrast(111%)',
                  }}
                />
              </button>
            </Marker>
          ))}
        </Map>
      </div>

      {/* ── HUD: top-left badge ── */}
      <div className="absolute top-[72px] left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A]/80 backdrop-blur-sm border border-white/[0.08] rounded-lg">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
          Live Incident Radar
        </span>
        <span className="text-[10px] text-zinc-600 ml-1">
          {INCIDENTS.length} active
        </span>
      </div>

      {/* ── Floating sidebar: Verified Incident Feed ── */}
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[110px] left-4 bottom-4 w-[340px] z-20 flex flex-col"
      >
        <div className="backdrop-blur-xl bg-[#0A0A0A]/85 border border-white/[0.08] rounded-2xl flex flex-col h-full overflow-hidden">
          {/* Sidebar header */}
          <div className="px-5 py-4 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50"
              >
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
                <circle cx="12" cy="12" r="2" />
                <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
                <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
              </svg>
              <h2 className="text-[13px] font-semibold text-white tracking-tight">
                Verified Incident Feed
              </h2>
            </div>
            <p className="text-[11px] text-zinc-600">
              AI-verified reports from the ResQNav network
            </p>
          </div>

          {/* Incident list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10">
            {INCIDENTS.map((inc, i) => (
              <motion.button
                key={inc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => setSelected(selected?.id === inc.id ? null : inc)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                  selected?.id === inc.id
                    ? 'bg-white/[0.06] border-white/[0.15]'
                    : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="text-[13px] font-semibold text-white/90 leading-tight pr-2">
                    {inc.title}
                  </h3>
                  <span className="text-[10px] text-zinc-600 whitespace-nowrap shrink-0">
                    {inc.time}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 mb-2">{inc.location}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${severityColor[inc.severity]}`}
                  >
                    {inc.severity}
                  </span>
                  {inc.verified && (
                    <span className="text-[10px] font-medium text-emerald-400/70 bg-emerald-400/[0.08] border border-emerald-400/[0.1] px-2 py-0.5 rounded-full">
                      ✓ Gemini Verified
                    </span>
                  )}
                </div>
                {/* Expanded detail */}
                {selected?.id === inc.id && inc.services.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center gap-2 flex-wrap"
                  >
                    {inc.services.map((s) => (
                      <span
                        key={s}
                        className="text-[9px] font-semibold text-zinc-500 bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Footer status */}
          <div className="px-5 py-3 border-t border-white/[0.06] shrink-0 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-zinc-600">
              Priority Green Corridors: <strong className="text-white/60">2 active</strong>
            </span>
          </div>
        </div>
      </motion.aside>

      {/* ── Legend: bottom-right ── */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-4 px-4 py-2.5 bg-[#0A0A0A]/80 backdrop-blur-sm border border-white/[0.08] rounded-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }} />
          <span className="text-[10px] text-zinc-500">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" style={{ boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
          <span className="text-[10px] text-zinc-500">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
          <span className="text-[10px] text-zinc-500">Low</span>
        </div>
      </div>
    </div>
  );
}
