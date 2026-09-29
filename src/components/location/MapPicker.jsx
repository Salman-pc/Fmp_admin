import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Loader2, ExternalLink, Navigation } from 'lucide-react';

const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MAP_LAYERS = {
  GOOGLE_ROADMAP: {
    name: 'Google Maps',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  },
  GOOGLE_SATELLITE: {
    name: 'Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite'
  },
  GOOGLE_HYBRID: {
    name: 'Google Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  },
  OSM: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap'
  }
};

function MapViewUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 16, { animate: true, duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export const MapPicker = ({ latitude, longitude, radius = 100, onSelectLocation, onSelectPlaceName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLayerKey, setSelectedLayerKey] = useState('GOOGLE_ROADMAP');

  const defaultLat = latitude || 10.0261;
  const defaultLng = longitude || 76.3082;
  const currentTile = MAP_LAYERS[selectedLayerKey];

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setShowDropdown(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error('Location search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    onSelectLocation(lat, lon);

    if (onSelectPlaceName && result.display_name) {
      const shortName = result.display_name.split(',')[0];
      onSelectPlaceName(shortName);
    }

    setShowDropdown(false);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        onSelectLocation(lat, lon);
        setIsLocating(false);
      },
      (err) => {
        alert(`Unable to get your location: ${err.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const googleMapsUrl = latitude && longitude
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps`;

  return (
    <div className="space-y-2">
      {/* Search Bar & Actions */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search location name (e.g. Melmuri Bus Stop, Malappuram)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute right-3 top-3" />
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition disabled:opacity-50"
            >
              Search
            </button>
          </form>

          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 border-b border-slate-800/50 text-slate-200 flex items-start space-x-2 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-semibold text-xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>Use My Current Location</span>
        </button>
      </div>

      {/* Layer Switcher */}
      <div className="flex items-center justify-end space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
        {Object.keys(MAP_LAYERS).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedLayerKey(key)}
            className={`px-2 py-0.5 rounded-lg transition ${
              selectedLayerKey === key
                ? 'bg-amber-500 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {MAP_LAYERS[key].name}
          </button>
        ))}
      </div>

      {/* Map View */}
      <div className="w-full h-72 rounded-xl overflow-hidden border border-slate-700 relative">
        <MapContainer center={[defaultLat, defaultLng]} zoom={15} scrollWheelZoom={true}>
          <TileLayer attribution={currentTile.attribution} url={currentTile.url} />
          <MapViewUpdater center={[latitude || defaultLat, longitude || defaultLng]} />
          <MapClickHandler onSelectLocation={onSelectLocation} />

          {latitude && longitude && (
            <>
              <Marker position={[latitude, longitude]} icon={pickerIcon} />
              <Circle
                center={[latitude, longitude]}
                radius={radius}
                pathOptions={{
                  color: '#f59e0b',
                  fillColor: '#f59e0b',
                  fillOpacity: 0.25,
                  weight: 2
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span>💡 Click map or search location.</span>
          {latitude && longitude && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline flex items-center space-x-1 font-semibold"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {latitude && longitude && (
          <span className="text-amber-400 font-mono font-medium">
            [{latitude.toFixed(4)}, {longitude.toFixed(4)}]
          </span>
        )}
      </div>
    </div>
  );
};
