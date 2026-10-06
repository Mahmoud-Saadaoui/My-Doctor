import React, { useState, useEffect, useDeferredValue, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../lib/axios";
import { DOCTORS_URL } from "../lib/urls";
import Loader from "../components/Loader";
import DoctorCard from "../components/DoctorCard";
import MapView from "../components/MapView";
import { Search, Stethoscope, Users, MapPin, List, Map as MapIcon, Navigation, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

// Cluster markers that are close together
const clusterMarkers = (markers, zoom) => {
  if (markers.length <= 1) return markers;

  // Simple clustering: group markers within a certain distance
  const clusters = [];
  const clustered = new Set();

  // Adjust cluster radius based on zoom level
  const clusterRadius = Math.max(0.01, 0.1 - zoom * 0.005);

  for (let i = 0; i < markers.length; i++) {
    if (clustered.has(i)) continue;

    const cluster = [markers[i]];
    clustered.add(i);

    for (let j = i + 1; j < markers.length; j++) {
      if (clustered.has(j)) continue;

      const dx = markers[i].latitude - markers[j].latitude;
      const dy = markers[i].longitude - markers[j].longitude;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < clusterRadius) {
        cluster.push(markers[j]);
        clustered.add(j);
      }
    }

    if (cluster.length === 1) {
      clusters.push(cluster[0]);
    } else {
      // Create a cluster marker
      const avgLat = cluster.reduce((sum, m) => sum + m.latitude, 0) / cluster.length;
      const avgLng = cluster.reduce((sum, m) => sum + m.longitude, 0) / cluster.length;
      clusters.push({
        id: `cluster-${i}`,
        latitude: avgLat,
        longitude: avgLng,
        count: cluster.length,
        isCluster: true,
      });
    }
  }

  return clusters;
};

const Doctors = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchValue, setSearchValue] = useState(() => searchParams.get("q") || "");
  const [locationValue, setLocationValue] = useState(() => searchParams.get("location") || "");
  const [resultMeta, setResultMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [mapCenter, setMapCenter] = useState([36.8065, 10.1815]);
  const [mapZoom, setMapZoom] = useState(11);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [searchAreaLoading, setSearchAreaLoading] = useState(false);
  const deferredSearch = useDeferredValue(searchValue);
  const deferredLocation = useDeferredValue(locationValue);

  const fetchDoctors = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (deferredSearch.trim()) params.q = deferredSearch.trim();
      if (deferredLocation.trim()) params.location = deferredLocation.trim();
      if (searchParams.get("lat") && searchParams.get("lng")) {
        params.lat = searchParams.get("lat");
        params.lng = searchParams.get("lng");
        params.radiusKm = searchParams.get("radiusKm") || 10;
        params.sort = "distance";
      }
      if (searchParams.get("page")) {
        params.page = searchParams.get("page");
      }
      const response = await axios.get(DOCTORS_URL, { params, signal });
      setDoctors(response.data.data);
      setResultMeta(response.data.meta);

      if (response.data.data.length > 0 && response.data.data[0].profile?.latitude) {
        setMapCenter([
          response.data.data[0].profile.latitude,
          response.data.data[0].profile.longitude,
        ]);
      }
    } catch (requestError) {
      if (requestError.code !== "ERR_CANCELED") {
        setError(requestError.response?.data?.message || t("doctors.loadError"));
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [deferredSearch, deferredLocation, searchParams, t]);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch
    fetchDoctors(controller.signal);
    return () => controller.abort();
  }, [fetchDoctors]);

  const handleDoctorPress = useCallback((doctorId) => {
    navigate(`/doctor/${doctorId}`);
  }, [navigate]);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
  }, []);

  const handleLocationChange = useCallback((e) => {
    setLocationValue(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  const handleClearLocation = useCallback(() => {
    setLocationValue("");
  }, []);

  const handlePageChange = useCallback((newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  }, [searchParams]);

  const handleMarkerClick = useCallback((marker) => {
    if (marker.isCluster) {
      // Zoom in on cluster
      setMapCenter([marker.latitude, marker.longitude]);
      setMapZoom(prev => Math.min(prev + 2, 18));
      return;
    }
    const doctor = doctors.find(d => d.id === marker.id);
    if (doctor) {
      navigate(`/doctor/${doctor.id}`);
    }
  }, [doctors, navigate]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t("location.geolocationUnsupported"));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(14);

        // Update search params with new location
        const params = new URLSearchParams(searchParams);
        params.set("lat", latitude);
        params.set("lng", longitude);
        params.set("radiusKm", 10);
        setSearchParams(params);

        setLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === 1) {
          setError(t("location.geolocationDenied"));
        } else if (error.code === 2) {
          setError(t("location.geolocationError"));
        } else if (error.code === 3) {
          setError(t("location.geolocationTimeout"));
        } else {
          setError(t("location.geolocationError"));
        }
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [searchParams, setSearchParams, t]);

  const handleGeocodeSearch = useCallback(async () => {
    if (!locationValue.trim()) return;

    setGeocoding(true);
    setError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationValue)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        setMapCenter([latitude, longitude]);
        setMapZoom(12);

        const params = new URLSearchParams(searchParams);
        params.set("lat", latitude);
        params.set("lng", longitude);
        params.set("radiusKm", 10);
        setSearchParams(params);
      } else {
        setError(t("geocoding.noResults"));
      }
    } catch (err) {
      setError(t("geocoding.error"));
    } finally {
      setGeocoding(false);
    }
  }, [locationValue, searchParams, setSearchParams, t]);

  const handleSearchInArea = useCallback(() => {
    if (!mapCenter) return;

    setSearchAreaLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set("lat", mapCenter[0]);
    params.set("lng", mapCenter[1]);
    params.set("radiusKm", 10);
    params.set("sort", "distance");
    setSearchParams(params);

    // Trigger refetch
    setTimeout(() => setSearchAreaLoading(false), 500);
  }, [mapCenter, searchParams, setSearchParams]);

  const handleMapMoveEnd = useCallback(({ center, zoom }) => {
    setMapCenter(center);
    setMapZoom(zoom);
  }, []);

  const rawMarkers = doctors
    .filter(d => d.profile?.latitude && d.profile?.longitude)
    .map(d => ({
      id: d.id,
      latitude: d.profile.latitude,
      longitude: d.profile.longitude,
      selected: false,
    }));

  const markers = useMemo(() => clusterMarkers(rawMarkers, mapZoom), [rawMarkers, mapZoom]);

  return (
    <div className="min-h-screen bg-cream pt-16">
      <Loader loading={loading} title={t("common.loading")} />

      {/* Page Header */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-brand-deep shadow-lg">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-brand-deep sm:text-4xl">{t("doctors.title")}</h1>
          <p className="mt-2 text-brand-deep/80">{t("doctors.subtitle")}</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t("doctors.searchPlaceholder")}
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full rounded-2xl border-2 border-mist bg-white py-4 pe-14 ps-14 text-start text-brand-deep placeholder-brand/60 shadow-lg outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <Search className="absolute end-5 top-1/2 h-6 w-6 -translate-y-1/2 text-brand/60" />
            {searchValue && (
              <button
                onClick={handleClearSearch}
                className="absolute start-5 top-1/2 -translate-y-1/2 rounded-full bg-mist p-1 text-brand/70 hover:bg-cream transition-colors"
                aria-label={t("doctors.clearSearch")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Location Search with Geocoding */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("doctors.locationPlaceholder")}
                value={locationValue}
                onChange={handleLocationChange}
                onKeyDown={(e) => e.key === "Enter" && handleGeocodeSearch()}
                className="w-full rounded-2xl border-2 border-mist bg-white py-3 pe-14 ps-14 text-start text-brand-deep placeholder-brand/60 shadow-lg outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <MapPin className="absolute end-5 top-1/2 h-5 w-5 -translate-y-1/2 text-brand/60" />
              {locationValue && (
                <button
                  onClick={handleClearLocation}
                  className="absolute start-5 top-1/2 -translate-y-1/2 rounded-full bg-mist p-1 text-brand/70 hover:bg-cream transition-colors"
                  aria-label={t("doctors.clearLocation")}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleGeocodeSearch}
              disabled={geocoding || !locationValue.trim()}
              className="flex items-center gap-2 rounded-2xl bg-brand px-4 py-3 font-semibold text-white hover:bg-brand-deep disabled:opacity-50 transition-colors"
            >
              {geocoding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">{t("geocoding.search")}</span>
            </button>
          </div>
        </div>

        {/* View Mode Toggle + Locate Me */}
        <div className="flex justify-between items-center mb-6">
          <div className="inline-flex rounded-xl border-2 border-mist bg-white p-1 shadow-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                viewMode === "list"
                  ? "bg-brand text-white"
                  : "text-brand-deep hover:bg-cream"
              }`}
            >
              <List className="h-4 w-4" />
              {t("doctors.listView")}
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                viewMode === "map"
                  ? "bg-brand text-white"
                  : "text-brand-deep hover:bg-cream"
              }`}
            >
              <MapIcon className="h-4 w-4" />
              {t("doctors.mapView")}
            </button>
          </div>

          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="flex items-center gap-2 rounded-xl border-2 border-mist bg-white px-4 py-2 text-sm font-semibold text-brand-deep hover:bg-cream disabled:opacity-50 transition-colors"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {t("map.locate")}
          </button>
        </div>

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6 text-center">
            {searchValue ? (
              <p className="text-sm font-medium text-brand/70">
                {t("doctors.searchResults", { count: resultMeta.total, query: searchValue })}
              </p>
            ) : resultMeta.total > 0 && (
              <p className="text-sm font-medium text-brand/70">
                {t("doctors.allDoctors", { count: resultMeta.total })}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
            <p className="font-semibold text-brand-deep">{error}</p>
            <button onClick={() => fetchDoctors()} className="mt-4 rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-deep">
              {t("common.retry")}
            </button>
          </div>
        )}

        {/* Map View */}
        {viewMode === "map" && !loading && !error && (
          <div className="mb-8">
            <div className="relative">
              <div className="h-96 overflow-hidden rounded-2xl border-2 border-mist shadow-lg">
                <MapView
                  center={mapCenter}
                  zoom={mapZoom}
                  height="100%"
                  markers={markers}
                  onMarkerClick={handleMarkerClick}
                  onMoveEnd={handleMapMoveEnd}
                />
              </div>

              {/* Search in Area Button */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <button
                  onClick={handleSearchInArea}
                  disabled={searchAreaLoading}
                  className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-white shadow-lg hover:bg-brand-deep disabled:opacity-50 transition-colors"
                >
                  {searchAreaLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {t("map.searchArea")}
                </button>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-brand/60">
              {t("map.attribution")}
            </p>
            <p className="mt-1 text-center text-xs text-brand/50">
              {t("map.distanceDisclaimer")}
            </p>
          </div>
        )}

        {/* Doctors Grid */}
        {viewMode === "list" && !loading && !error && doctors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onPress={handleDoctorPress} />
            ))}
          </div>
        ) : (
          viewMode === "list" && !loading && !error && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-xl">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-mist">
                <Stethoscope className="h-12 w-12 text-brand" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-brand-deep">
                {searchValue ? t("doctors.noResults") : t("doctors.noDoctors")}
              </h3>
              <p className="mt-2 text-brand/70">
                {searchValue ? t("doctors.tryDifferentSearch") : t("doctors.registerAsDoctor")}
              </p>
            </div>
          )
        )}

        {/* Pagination */}
        {resultMeta.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => handlePageChange(resultMeta.page - 1)}
              disabled={resultMeta.page <= 1}
              className="rounded-xl border-2 border-mist bg-white px-6 py-2 font-semibold text-brand-deep transition-colors hover:bg-cream disabled:opacity-50"
            >
              {t("doctors.previousPage")}
            </button>
            <span className="flex items-center text-sm font-medium text-brand/70">
              {t("doctors.pageOf", { page: resultMeta.page, totalPages: resultMeta.totalPages })}
            </span>
            <button
              onClick={() => handlePageChange(resultMeta.page + 1)}
              disabled={resultMeta.page >= resultMeta.totalPages}
              className="rounded-xl border-2 border-mist bg-white px-6 py-2 font-semibold text-brand-deep transition-colors hover:bg-cream disabled:opacity-50"
            >
              {t("doctors.nextPage")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
