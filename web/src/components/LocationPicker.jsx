import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation } from "lucide-react";

// Fix for default marker icon in Leaflet - do this once
if (typeof window !== "undefined" && !L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Reverse geocoding function - moved outside component to avoid recreation
const getAddressFromCoords = async (lat, lng) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    const data = await response.json();
    return data.display_name || "";
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Error getting address:", error);
    }
    return "";
  }
};

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Memoized map click handler
const MemoizedMapClickHandler = React.memo(MapClickHandler);

// Component to update map view when location changes
const MapViewUpdater = ({ latitude, longitude }) => {
  const map = useMap();
  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude, map]);
  return null;
};

const LocationPicker = ({ latitude, longitude, onLocationChange, onAddressChange }) => {
  const [position, setPosition] = useState([latitude || 36.8065, longitude || 10.1815]); // Default: Tunis
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleLocationSelect = useCallback(async (lat, lng) => {
    setIsLoading(true);
    setPosition([lat, lng]);
    onLocationChange(lat, lng);

    // Get address from coordinates using reverse geocoding
    const address = await getAddressFromCoords(lat, lng);
    if (address && onAddressChange) {
      onAddressChange(address);
    }
    setIsLoading(false);
  }, [onLocationChange, onAddressChange]);

  const handleGetCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await handleLocationSelect(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    }
  }, [handleLocationSelect]);

  // Memoize initial center
  const initialCenter = useMemo(
    () => [latitude || 36.8065, longitude || 10.1815],
    [latitude, longitude]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Navigation className="h-5 w-5 text-blue-600" />
          حدد موقعك على الخريطة
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              جاري التحديد...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              موقعي الحالي
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        انقر على الخريطة لتحديد موقعك أو استخدم زر "موقعي الحالي"
      </p>

      <div className="relative z-10 h-64 overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapViewUpdater latitude={position[0]} longitude={position[1]} />
          <MemoizedMapClickHandler onLocationSelect={handleLocationSelect} />
          <Marker position={position} />
        </MapContainer>
      </div>

      {latitude && longitude && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <Navigation className="h-4 w-4" />
          <span>الموقع المحدد: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
