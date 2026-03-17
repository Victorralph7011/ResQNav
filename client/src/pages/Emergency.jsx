import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { useAuth } from '../context/AuthContext';

const libraries = ['places'];

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a5a5a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e1e1e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#333' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1f1f1f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
];

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 19.076, lng: 72.8777 };

export default function Emergency() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const calculatePriorityRoute = async () => {
    if (!origin || !destination || !window.google) return;
    const directionsService = new window.google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      });
      setDirections(results);
      if (results.routes[0]) {
        const leg = results.routes[0].legs[0];
        setRouteInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
        });
      }
    } catch (err) {
      console.error('Priority route error:', err);
    }
  };

  const sidebarTabs = [
    { id: 'map', label: 'Priority Map' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'chatbot', label: 'AI Chatbot' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-14 flex">
      {/* Sidebar */}
      <aside className="w-[320px] min-w-[320px] border-r border-white/[0.06] flex flex-col bg-[#0A0A0A]">
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
              {[
                { id: 1, type: 'Accident', location: 'NH-48 near Bandra', severity: 'Critical', time: '2 min ago' },
                { id: 2, type: 'Road Closure', location: 'Western Express Highway', severity: 'Moderate', time: '8 min ago' },
                { id: 3, type: 'Fire', location: 'Andheri East, MIDC', severity: 'Critical', time: '15 min ago' },
              ].map(incident => (
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
                href="#"
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

      {/* Map Area */}
      <main className="flex-1 relative">
        {loadError || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111111]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600 mb-3 relative z-10">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <p className="text-[14px] text-zinc-500 relative z-10 mb-1 font-medium">Priority Map</p>
            <p className="text-[13px] text-zinc-600 relative z-10 max-w-xs text-center">Add your Google Maps API key to <code className="text-zinc-500">.env</code> to enable the live dark-mode priority map.</p>
          </div>
        ) : !isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111111]">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              styles: darkMapStyle,
              disableDefaultUI: true,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              backgroundColor: '#0A0A0A',
            }}
          >
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: '#ffffff',
                    strokeWeight: 5,
                    strokeOpacity: 0.9,
                  },
                }}
              />
            )}
          </GoogleMap>
        )}

        {/* Emergency HUD */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A]/80 backdrop-blur-sm border border-white/[0.08] rounded-lg pointer-events-none">
          <span className="text-[10px] font-bold text-white tracking-wider">PRIORITY</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[11px] text-zinc-500">Emergency Response Active</span>
        </div>
      </main>
    </div>
  );
}
