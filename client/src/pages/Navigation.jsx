import { useState, useRef, useCallback } from 'react';
import { Map, Marker, Source, Layer } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Sun, Moon, Navigation as NavIcon, MapPin, Loader2, AlertTriangle, Ambulance, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

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

// ── Fetch alternate route via waypoint ──
async function fetchAlternateRoute(startLng, startLat, endLng, endLat, waypointLng, waypointLat) {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${waypointLng},${waypointLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes.length) return null;
  const route = data.routes[0];
  return {
    geometry: route.geometry,
    distance: route.distance,
    duration: route.duration,
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

// ── Euclidean distance helper (for coordinate comparison) ──
const getDistance = (coord1, coord2) => {
  const dx = coord1[0] - coord2[0];
  const dy = coord1[1] - coord2[1];
  return Math.sqrt(dx * dx + dy * dy);
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

  // ── Simulation state ──
  const [simulationState, setSimulationState] = useState('idle');
  // 'idle' | 'uploading' | 'verified' | 'rerouted'
  const [incidentLocation, setIncidentLocation] = useState(null);
  const [primaryRouteGeoJSON, setPrimaryRouteGeoJSON] = useState(null);
  const [alternateRouteGeoJSON, setAlternateRouteGeoJSON] = useState(null);
  const [alternateRouteInfo, setAlternateRouteInfo] = useState(null);
  const simulationTimers = useRef([]);

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
    setSimulationState('idle');
    setIncidentLocation(null);
    setPrimaryRouteGeoJSON(null);
    setAlternateRouteGeoJSON(null);
    setAlternateRouteInfo(null);

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
      const primaryGeoJSON = {
        type: 'Feature',
        geometry: route.geometry,
        properties: {},
      };

      setRouteGeoJSON(primaryGeoJSON);
      setPrimaryRouteGeoJSON(primaryGeoJSON);

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

      // 6. Pre-fetch alternate route (silent, for demo)
      const midIdx = Math.floor(route.geometry.coordinates.length / 2);
      const midCoord = route.geometry.coordinates[midIdx];
      // Offset perpendicular to create a detour waypoint
      const offsetLat = midCoord[1] + 0.015;
      const offsetLng = midCoord[0] + 0.01;

      fetchAlternateRoute(
        startGeo.lng, startGeo.lat,
        endGeo.lng, endGeo.lat,
        offsetLng, offsetLat
      ).then((altRoute) => {
        if (altRoute) {
          setAlternateRouteGeoJSON({
            type: 'Feature',
            geometry: altRoute.geometry,
            properties: {},
          });
          setAlternateRouteInfo({
            distance: formatDistance(altRoute.distance),
            duration: formatDuration(altRoute.duration),
          });
        }
      }).catch(() => { /* silently ignore */ });

    } catch (err) {
      console.error('Routing error:', err);
      setError(err.message || 'Failed to calculate route.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearRoute = () => {
    // Clear any running simulation timers
    simulationTimers.current.forEach(clearTimeout);
    simulationTimers.current = [];

    setRouteInfo(null);
    setRouteGeoJSON(null);
    setStartCoord(null);
    setEndCoord(null);
    setOrigin('');
    setDestination('');
    setError('');
    setSimulationState('idle');
    setIncidentLocation(null);
    setPrimaryRouteGeoJSON(null);
    setAlternateRouteGeoJSON(null);
    setAlternateRouteInfo(null);
  };

  // ── Run AI Demo Sequence (Forced Waypoint Detour — simulates A* avoidance) ──
  const runDemoSequence = () => {
    if (!routeGeoJSON || !startCoord || !endCoord) return;

    // Clear any previous simulation timers
    simulationTimers.current.forEach(clearTimeout);
    simulationTimers.current = [];

    // Reset to primary route if previously rerouted
    if (primaryRouteGeoJSON) {
      setRouteGeoJSON(primaryRouteGeoJSON);
    }
    setIncidentLocation(null);

    // Step 1: uploading
    setSimulationState('uploading');

    // Step 2: after 2.5s, find crash site, compute detour, fetch new route
    const t1 = setTimeout(async () => {
      const primaryCoords = primaryRouteGeoJSON?.geometry?.coordinates || routeGeoJSON.geometry.coordinates;

      // 2a. Place crash at the midpoint of the primary route
      const midIdx = Math.floor(primaryCoords.length / 2);
      const crashCoord = primaryCoords[midIdx];
      setIncidentLocation({ lng: crashCoord[0], lat: crashCoord[1] });

      // 2b. Calculate a detour waypoint offset from the crash (~1.5 km shift)
      const detourLon = crashCoord[0] + 0.015;
      const detourLat = crashCoord[1] - 0.015;

      // 2c. Fetch a forced-waypoint route: Origin → Detour Node → Destination
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoord.lng},${startCoord.lat};${detourLon},${detourLat};${endCoord.lng},${endCoord.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code === 'Ok' && data.routes.length > 0) {
          const detourRoute = data.routes[0];
          setAlternateRouteGeoJSON({
            type: 'Feature',
            geometry: detourRoute.geometry,
            properties: {},
          });
          setAlternateRouteInfo({
            distance: formatDistance(detourRoute.distance),
            duration: formatDuration(detourRoute.duration),
          });
        }
      } catch (err) {
        console.error('Detour route fetch failed:', err);
      }

      // 2d. Show the crash marker and reroute CTA
      setSimulationState('verified');
    }, 2500);

    simulationTimers.current.push(t1);
  };

  // ── Handle Reroute ──
  const handleReroute = () => {
    setSimulationState('rerouted');

    if (alternateRouteGeoJSON) {
      setRouteGeoJSON(alternateRouteGeoJSON);

      // Update route info to reflect alternate
      if (alternateRouteInfo) {
        setRouteInfo((prev) => ({
          ...prev,
          distance: alternateRouteInfo.distance,
          duration: alternateRouteInfo.duration,
        }));
      }

      // Fit bounds to new route
      if (mapRef.current) {
        const coords = alternateRouteGeoJSON.geometry.coordinates;
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
    }
  };

  // ── Dynamic route layer styles ──
  const isRerouted = simulationState === 'rerouted';
  const activeLineColor = isRerouted ? '#10B981' : '#3B82F6';

  const routeLineLayer = {
    id: 'route-line',
    type: 'line',
    paint: {
      'line-color': activeLineColor,
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
      'line-color': activeLineColor,
      'line-width': 14,
      'line-opacity': 0.15,
      'line-blur': 8,
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
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

        {/* ── AI Demo Button ── */}
        {routeGeoJSON && simulationState === 'idle' && (
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <button
              onClick={runDemoSequence}
              className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-white font-medium text-sm border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-md cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-500/80" />
              ⚠️ Accident Ahead
            </button>
            <p className="text-xs text-zinc-500 mt-2 text-center">Simulate incident & calculate detour</p>
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

            {/* ── Incident Marker (pulsing red) ── */}
            {incidentLocation && (simulationState === 'verified' || simulationState === 'rerouted') && (
              <Marker longitude={incidentLocation.lng} latitude={incidentLocation.lat} anchor="center">
                <div style={{ filter: markerCounterFilter }} className="relative flex items-center justify-center">
                  {/* Outer pulse ring */}
                  <div className="absolute w-12 h-12 rounded-full bg-red-500/30 animate-ping" />
                  <div className="absolute w-8 h-8 rounded-full bg-red-500/40 animate-pulse" />
                  {/* Inner dot */}
                  <div
                    className="relative w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border-2 border-white"
                    style={{ boxShadow: '0 0 20px rgba(239,68,68,0.9)' }}
                  >
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                </div>
              </Marker>
            )}
          </Map>
        </div>

        {/* HUD — top-left */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A]/80 backdrop-blur-sm border border-white/[0.08] rounded-lg pointer-events-none">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider">LIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          <span className="text-[11px] text-zinc-600">Commuter Navigation</span>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* ══  SIMULATION OVERLAYS (z-20, above the map)  ══ */}
        {/* ══════════════════════════════════════════════════ */}

        <AnimatePresence mode="wait">
          {/* ── UPLOADING TOAST ── */}
          {simulationState === 'uploading' && (
            <motion.div
              key="toast-uploading"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="flex items-center gap-3 px-6 py-3.5 rounded-xl border border-white/[0.12] bg-white/[0.08] backdrop-blur-md shadow-2xl">
                <div className="relative flex items-center justify-center w-8 h-8">
                  <div className="absolute w-8 h-8 rounded-full border-2 border-blue-400/60 border-t-transparent animate-spin" />
                  <span className="text-base">📷</span>
                </div>
                <div>
                  <p className="text-[13px] text-white font-medium">Commuter uploaded image</p>
                  <p className="text-[11px] text-blue-300/80">Gemini AI verifying crash report...</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── VERIFIED TOAST ── */}
          {simulationState === 'verified' && (
            <motion.div
              key="toast-verified"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="flex items-center gap-3 px-6 py-3.5 rounded-xl border border-red-500/30 bg-red-950/60 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                  <span className="text-lg">🚨</span>
                </div>
                <div>
                  <p className="text-[13px] text-red-100 font-semibold">CRASH VERIFIED</p>
                  <p className="text-[11px] text-red-300/80">Ambulance dispatched and on the way</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── REROUTED TOAST ── */}
          {simulationState === 'rerouted' && (
            <motion.div
              key="toast-rerouted"
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="flex items-center gap-3 px-6 py-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/60 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[13px] text-emerald-100 font-semibold">Successfully rerouted</p>
                  <p className="text-[11px] text-emerald-300/80">Green corridor active · Safe detour engaged</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── REROUTE CTA BUTTON (bottom center) ── */}
        <AnimatePresence>
          {simulationState === 'verified' && (
            <motion.div
              key="reroute-cta"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
            >
              <button
                onClick={handleReroute}
                className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-red-500/50 bg-red-950/50 backdrop-blur-xl shadow-2xl cursor-pointer transition-all duration-300 hover:border-red-400/70 hover:bg-red-950/70 hover:scale-[1.02]"
                style={{ boxShadow: '0 0 40px rgba(239,68,68,0.3), 0 0 80px rgba(239,68,68,0.1)' }}
              >
                {/* Glow pulse behind button */}
                <div className="absolute inset-0 rounded-2xl bg-red-500/10 animate-pulse" />
                <AlertTriangle className="relative w-5 h-5 text-red-400 animate-bounce" />
                <div className="relative text-left">
                  <p className="text-[14px] text-white font-bold">Route Blocked Ahead</p>
                  <p className="text-[11px] text-red-300/70">Click to reroute via safe corridor</p>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
