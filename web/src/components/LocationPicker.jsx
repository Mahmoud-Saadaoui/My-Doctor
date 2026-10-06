import React, { useState, useCallback } from 'react';
import { Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";
import MapView from "./MapView";

// Reverse geocoding function using Nominatim (OpenStreetMap)
const getAddressFromCoords = async (lat, lng, language) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language}`,
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

const LocationPicker = ({ latitude, longitude, onLocationChange, onAddressChange }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([
    latitude || 36.8065,
    longitude || 10.1815,
  ]);

  const handleMapClick = useCallback(async ({ lat, lng }) => {
    setIsLoading(true);
    setMapCenter([lat, lng]);
    onLocationChange(lat, lng);

    // Get address from coordinates using reverse geocoding
    const address = await getAddressFromCoords(lat, lng, i18n.language);
    if (address && onAddressChange) {
      onAddressChange(address);
    }
    setIsLoading(false);
  }, [i18n.language, onLocationChange, onAddressChange]);

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setMapCenter([lat, lng]);
        onLocationChange(lat, lng);

        const address = await getAddressFromCoords(lat, lng, i18n.language);
        if (address && onAddressChange) {
          onAddressChange(address);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [i18n.language, onLocationChange, onAddressChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-brand-deep">
          <Navigation className="h-5 w-5 text-brand" />
          {t("location.selectOnMap")}
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-cream px-4 py-2 text-sm font-semibold text-brand hover:bg-mist disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              {t("location.locating")}
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              {t("location.currentLocation")}
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-brand/70">
        {t("location.hint")}
      </p>

      <div className="relative z-10 h-64 overflow-hidden rounded-2xl border-2 border-mist shadow-lg">
        <MapView
          center={mapCenter}
          zoom={15}
          height="100%"
          onMapClick={handleMapClick}
          markers={
            latitude && longitude
              ? [{ id: "selected", latitude, longitude, selected: true }]
              : []
          }
        />
      </div>

      {latitude && longitude && (
        <div className="flex items-center gap-2 rounded-lg bg-mist p-3 text-sm text-brand-deep">
          <Navigation className="h-4 w-4" />
          <span>
            {t("location.selected", {
              latitude: latitude.toFixed(4),
              longitude: longitude.toFixed(4),
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
