import { useState, useRef, useCallback } from 'react';
import { Map, Marker, Source, Layer } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Sun, Moon, Navigation as NavIcon, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INITIAL_VIEW = {
  longitude: 77.209,
  latitude: 28.6139,
  zoom: 12,
};

// Mock incident locations around New Delhi
const MOCK_INCIDENTS = [
  { id: 1, lng: 77.2310, lat: 28.6280, label: 'Accident — Connaught Place' },
  { id: 2, lng: 77.1855, lat: 28.5535, label: 'Road Closure — Saket' },
];

// ── Nominatim Geocoding ──
async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ResQNav/1.0' },
  });
  const data = await res.json();
  if (!data.length) throw new Error(`Could not find location: "${address}"`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
}

// ── OSRM Routing ──
async function fetchRoute(startLng, startLat, endLng, endLat) {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes.length) throw new Error('No route found');
  const route = data.routes[0];
  return {
    geometry: route.geometry,
    distance: route.distance, // meters
    duration: route.duration, // seconds
  };
}

// ── Format helpers ──
function formatDistance(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
function formatDuration(s) {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h > 0 ? `${h} hr ${m} min` : `${m} min`;
}

// ── Route line style ──
const routeLineLayer = {
  id: 'route-line',
  type: 'line',
  paint: {
    'line-color': '#3B82F6',
    'line-width': 5,
    'line-opacity': 0.9,
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round',
  },
};

const routeGlowLayer = {
  id: 'route-glow',
  type: 'line',
  paint: {
    'line-color': '#3B82F6',
    'line-width': 14,
    'line-opacity': 0.15,
    'line-blur': 8,
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round',
  },
};

export default function Navigation() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [startCoord, setStartCoord] = useState(null);
  const [endCoord, setEndCoord] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);

  const onMapLoad = useCallback((evt) => {
    mapRef.current = evt.target;
  }, []);

  // ── Calculate route via Nominatim + OSRM ──
  const handleGetRoute = async () => {
    if (!origin.trim() || !destination.trim()) return;
    setIsLoading(true);
    setError('');
    setRouteInfo(null);
    setRouteGeoJSON(null);
    setStartCoord(null);
    setEndCoord(null);

    try {
      // 1. Geocode both addresses
      const [startGeo, endGeo] = await Promise.all([
        geocode(origin),
        geocode(destination),
      ]);

      setStartCoord(startGeo);
      setEndCoord(endGeo);

      // 2. Fetch driving route
      const route = await fetchRoute(startGeo.lng, startGeo.lat, endGeo.lng, endGeo.lat);

      // 3. Build GeoJSON for the route line
      setRouteGeoJSON({
        type: 'Feature',
        geometry: route.geometry,
        properties: {},
      });

      // 4. Update route info panel
      setRouteInfo({
        distance: formatDistance(route.distance),
        duration: formatDuration(route.duration),
        start: startGeo.display,
        end: endGeo.display,
      });

      // 5. Fit the map to the route bounds
      if (mapRef.current) {
        const coords = route.geometry.coordinates;
        const lngs = coords.map((c) => c[0]);
        const lats = coords.map((c) => c[1]);
        mapRef.current.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 80, duration: 1200 }
        );
      }
    } catch (err) {
      console.error('Routing error:', err);
      setError(err.message || 'Failed to calculate route.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteInfo(null);
    setRouteGeoJSON(null);
    setStartCoord(null);
    setEndCoord(null);
    setOrigin('');
    setDestination('');
    setError('');
  };

  // Un-invert style for markers inside the inverted map wrapper
  const markerCounterFilter = isDarkMode
    ? 'invert(100%) hue-rotate(180deg) contrast(111%)'
    : 'none';

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-14 flex">
      {/* ── Left Sidebar ── */}
      <aside className="w-[320px] min-w-[320px] border-r border-white/[0.06] flex flex-col bg-[#0A0A0A] z-10">
        {/* Header */}
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
              onKeyDown={(e) => e.key === 'Enter' && handleGetRoute()}
              placeholder="e.g. Connaught Place, Delhi"
              className="w-full px-3 py-2 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[13px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-1.5">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGetRoute()}
              placeholder="e.g. India Gate, Delhi"
              className="w-full px-3 py-2 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[13px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGetRoute}
              disabled={isLoading || !origin.trim() || !destination.trim()}
              className="flex-1 py-2 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Calculating…
                </>
              ) : (
                'Get Route'
              )}
            </button>
            {(routeInfo || error) && (
              <button
                onClick={clearRoute}
                className="px-3 py-2 border border-white/[0.08] text-zinc-400 text-[13px] rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-[12px] text-red-400 bg-red-400/[0.06] border border-red-400/[0.1] rounded-lg px-3 py-2">
              {error}
            </p>
          )}
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
            {routeInfo.start && (
              <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
                <p className="text-[11px] text-zinc-600 leading-relaxed truncate" title={routeInfo.start}>
                  <span className="text-zinc-500 font-medium">From:</span> {routeInfo.start}
                </p>
                <p className="text-[11px] text-zinc-600 leading-relaxed truncate" title={routeInfo.end}>
                  <span className="text-zinc-500 font-medium">To:</span> {routeInfo.end}
                </p>
              </div>
            )}
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
            onLoad={onMapLoad}
          >
            {/* ── Route line (glow + solid) ── */}
            {routeGeoJSON && (
              <Source id="route" type="geojson" data={routeGeoJSON}>
                <Layer {...routeGlowLayer} />
                <Layer {...routeLineLayer} />
              </Source>
            )}

            {/* ── Start marker (green) ── */}
            {startCoord && (
              <Marker longitude={startCoord.lng} latitude={startCoord.lat} anchor="bottom">
                <div style={{ filter: markerCounterFilter }} className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
                       style={{ boxShadow: '0 0 16px rgba(16,185,129,0.6)' }}>
                    <NavIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-0.5 h-2 bg-emerald-500/60" />
                </div>
              </Marker>
            )}

            {/* ── End marker (blue) ── */}
            {endCoord && (
              <Marker longitude={endCoord.lng} latitude={endCoord.lat} anchor="bottom">
                <div style={{ filter: markerCounterFilter }} className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
                       style={{ boxShadow: '0 0 16px rgba(59,130,246,0.6)' }}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-0.5 h-2 bg-blue-500/60" />
                </div>
              </Marker>
            )}

            {/* ── Mock incident markers ── */}
            {MOCK_INCIDENTS.map((inc) => (
              <Marker key={inc.id} longitude={inc.lng} latitude={inc.lat} anchor="center">
                <div
                  className="w-4 h-4 bg-red-500 rounded-full"
                  style={{
                    boxShadow: '0 0 15px rgba(239,68,68,0.8)',
                    filter: markerCounterFilter,
                  }}
                  title={inc.label}
                />
              </Marker>
            ))}
          </Map>
        </div>

        {/* HUD — top-left */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A]/80 backdrop-blur-sm border border-white/[0.08] rounded-lg pointer-events-none">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider">LIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          <span className="text-[11px] text-zinc-600">Commuter Navigation</span>
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
