import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { useAuth } from '../context/AuthContext';

const libraries = ['places'];

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a5a5a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#444' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e1e1e' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#555' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#1a2a1a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#333' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#222' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#242424' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1f1f1f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#333' }] },
];

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 19.076, lng: 72.8777 }; // Mumbai

export default function Navigation() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const calculateRoute = async () => {
    if (!origin || !destination) return;
    if (!window.google) return;

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
          start: leg.start_address,
          end: leg.end_address,
        });
      }
    } catch (err) {
      console.error('Route error:', err);
      setMapError(true);
    }
  };

  const clearRoute = () => {
    setDirections(null);
    setRouteInfo(null);
    setOrigin('');
    setDestination('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-14 flex">
      {/* Sidebar */}
      <aside className="w-[320px] min-w-[320px] border-r border-white/[0.06] flex flex-col bg-[#0A0A0A]">
        {/* Sidebar Header */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-[15px] font-semibold text-white tracking-tight">Navigation</h2>
          <p className="text-[12px] text-zinc-600 mt-0.5">Enter your route below</p>
        </div>

        {/* Route Input */}
        <div className="px-5 py-5 space-y-3 border-b border-white/[0.06]">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-1.5">Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Starting point"
              className="w-full px-3 py-2 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[13px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-1.5">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where to?"
              className="w-full px-3 py-2 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[13px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={calculateRoute}
              className="flex-1 py-2 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Get Route
            </button>
            {directions && (
              <button
                onClick={clearRoute}
                className="px-3 py-2 border border-white/[0.08] text-zinc-400 text-[13px] rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Route Info */}
        {routeInfo && (
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-3">Route Details</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[13px] text-zinc-500">Distance</span>
                <span className="text-[13px] text-white font-medium">{routeInfo.distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-zinc-500">ETA</span>
                <span className="text-[13px] text-white font-medium">{routeInfo.duration}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="px-5 py-4 mt-auto border-t border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[12px] text-zinc-500">Live Traffic Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="text-[12px] text-zinc-600">Signed in as {user?.email}</span>
          </div>
        </div>
      </aside>

      {/* Map Area */}
      <main className="flex-1 relative">
        {loadError || mapError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111111]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600 mb-3 relative z-10">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <p className="text-[14px] text-zinc-500 relative z-10 mb-1 font-medium">Google Maps</p>
            <p className="text-[13px] text-zinc-600 relative z-10 max-w-xs text-center">Add your Google Maps API key to <code className="text-zinc-500">.env</code> to enable the live dark-mode map.</p>
          </div>
        ) : !isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111111]">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={12}
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
                    strokeWeight: 4,
                    strokeOpacity: 0.8,
                  },
                  suppressMarkers: false,
                }}
              />
            )}
          </GoogleMap>
        )}

        {/* Map HUD */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A]/80 backdrop-blur-sm border border-white/[0.08] rounded-lg pointer-events-none">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider">LIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          <span className="text-[11px] text-zinc-600">Commuter Navigation</span>
        </div>
      </main>
    </div>
  );
}
