import { useState } from 'react';
import { Map, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INITIAL_VIEW = {
  longitude: 77.209,
  latitude: 28.6139,
  zoom: 13,
};

const MOCK_INCIDENTS = [
  { id: 1, lng: 77.2310, lat: 28.6280, type: 'Accident', location: 'Connaught Place', severity: 'Critical', time: '2 min ago' },
  { id: 2, lng: 77.1855, lat: 28.5535, type: 'Road Closure', location: 'Saket District', severity: 'Moderate', time: '8 min ago' },
  { id: 3, lng: 77.2507, lat: 28.5700, type: 'Fire', location: 'Lajpat Nagar', severity: 'Critical', time: '15 min ago' },
];

export default function Emergency() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const calculatePriorityRoute = () => {
    if (!origin || !destination) return;
    // Mock route info
    setRouteInfo({
      distance: '5.2 km',
      duration: '9 min',
    });
  };

  const sidebarTabs = [
    { id: 'map', label: 'Priority Map' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'chatbot', label: 'AI Chatbot' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-14 flex">
      {/* ── Sidebar (fully preserved) ── */}
      <aside className="w-[320px] min-w-[320px] border-r border-white/[0.06] flex flex-col bg-[#0A0A0A] z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-white" />
            <h2 className="text-[15px] font-semibold text-white tracking-tight">Emergency Command</h2>
          </div>
          <p className="text-[12px] text-zinc-600">Priority access enabled</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {sidebarTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-[12px] font-semibold tracking-tight cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b border-white'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'map' && (
            <div className="px-5 py-5 space-y-3">
              <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em]">Priority Routing</p>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-1.5">From</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Station / Hospital"
                  className="w-full px-3 py-2 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[13px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-1.5">To (Incident Site)</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Incident location"
                  className="w-full px-3 py-2 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[13px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-colors"
                />
              </div>
              <button
                onClick={calculatePriorityRoute}
                className="w-full py-2 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Calculate Priority Route
              </button>

              {routeInfo && (
                <div className="mt-4 space-y-2 pt-3 border-t border-white/[0.06]">
                  <div className="flex justify-between">
                    <span className="text-[13px] text-zinc-500">Distance</span>
                    <span className="text-[13px] text-white font-medium">{routeInfo.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-zinc-500">Priority ETA</span>
                    <span className="text-[13px] text-white font-medium">{routeInfo.duration}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="px-5 py-5">
              <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-4">Active Incidents</p>
              {MOCK_INCIDENTS.map(incident => (
                <div key={incident.id} className="py-3 border-b border-white/[0.04]">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[13px] font-medium text-white">{incident.type}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      incident.severity === 'Critical'
                        ? 'text-white bg-white/[0.1]'
                        : 'text-zinc-400 bg-white/[0.04]'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-500">{incident.location}</p>
                  <p className="text-[11px] text-zinc-600 mt-1">{incident.time}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'chatbot' && (
            <div className="px-5 py-5 flex flex-col items-center justify-center h-full">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600 mb-3">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <h3 className="text-[15px] font-semibold text-white mb-1 tracking-tight">AI Chatbot</h3>
              <p className="text-[13px] text-zinc-500 text-center mb-5 max-w-[220px]">Report incidents with images and GPS for instant verification.</p>
              <a
                href="/chat"
                className="text-[13px] font-semibold bg-white text-black px-5 py-2 rounded-full hover:bg-zinc-200 transition-colors"
              >
                Open Chatbot →
              </a>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[12px] text-zinc-500">Priority Mode Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="text-[12px] text-zinc-600">{user?.email}</span>
          </div>
        </div>
      </aside>

      {/* ── Map Area ── */}
      <main className="flex-1 relative">
        {/* Map with dark-mode CSS inversion filter */}
        <div
          className="absolute inset-0 w-full h-full z-0"
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
          >
            {/* Incident markers */}
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
                  title={`${inc.type} — ${inc.location}`}
                />
              </Marker>
            ))}
          </Map>
        </div>

        {/* Emergency HUD — top-left */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A]/80 backdrop-blur-sm border border-white/[0.08] rounded-lg pointer-events-none">
          <span className="text-[10px] font-bold text-white tracking-wider">PRIORITY</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[11px] text-zinc-500">Emergency Response Active</span>
        </div>

        {/* Dark / Light toggle — bottom-right */}
        <button
          onClick={() => setIsDarkMode((d) => !d)}
          className="absolute bottom-6 right-6 z-20 flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-lg"
          title={isDarkMode ? 'Switch to Light Map' : 'Switch to Dark Map'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-300" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-300" />
          )}
        </button>
      </main>
    </div>
  );
}
