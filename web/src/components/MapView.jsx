import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Map, Marker, NavigationControl, ScaleControl, AttributionControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslation } from 'react-i18next';

/**
 * Shared MapLibre map component.
 *
 * A reusable map that accepts style, center, markers, selection and callbacks
 * without containing any business logic. All parent components should handle
 * their own data and pass it down via props.
 *
 * @param {Object} props
 * @param {string} props.style - MapLibre style URL
 * @param {[number, number]} props.center - Initial map center [lat, lng]
 * @param {number} props.zoom - Initial zoom level
 * @param {Array<{id: string|number, latitude: number, longitude: number, selected?: boolean}>} props.markers - Markers to display
 * @param {Function} [props.onMarkerClick] - Callback when a marker is clicked: (marker) => void
 * @param {Function} [props.onMapClick] - Callback when the map is clicked: ({lat, lng}) => void
 * @param {Function} [props.onMoveEnd] - Callback when map movement ends: ({center, zoom}) => void
 * @param {boolean} [props.showNavigation=true] - Show navigation controls
 * @param {boolean} [props.showScale=true] - Show scale control
 * @param {boolean} [props.showAttribution=true] - Show attribution
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.height='300px'] - Map height
 * @param {boolean} [props.interactive=true] - Whether the map is interactive
 * @param {Function} [props.onLoad] - Callback when map loads: (map) => void
 */
const MapView = ({
  style = 'https://demotiles.maplibre.org/style.json',
  center = [36.8065, 10.1815],
  zoom = 11,
  markers = [],
  onMarkerClick,
  onMapClick,
  onMoveEnd,
  showNavigation = true,
  showScale = true,
  showAttribution = true,
  className = '',
  height = '300px',
  interactive = true,
  onLoad,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Convert center from [lat, lng] to MapLibre's {lng, lat} format
  const mapCenter = useMemo(() => ({
    lng: center[1],
    lat: center[0],
  }), [center]);

  const handleMapClick = useCallback((event) => {
    if (!interactive || !onMapClick) return;
    const { lngLat } = event;
    onMapClick({ lat: lngLat.lat, lng: lngLat.lng });
  }, [interactive, onMapClick]);

  const handleMarkerClick = useCallback((marker) => {
    if (!interactive || !onMarkerClick) return;
    onMarkerClick(marker);
  }, [interactive, onMarkerClick]);

  const handleMoveEnd = useCallback(() => {
    if (!interactive || !onMoveEnd || !mapRef.current) return;
    const map = mapRef.current.getMap();
    const { lng, lat } = map.getCenter();
    onMoveEnd({ center: [lat, lng], zoom: map.getZoom() });
  }, [interactive, onMoveEnd]);

  const handleLoad = useCallback(() => {
    setMapLoaded(true);
    if (onLoad && mapRef.current) {
      onLoad(mapRef.current.getMap());
    }
  }, [onLoad]);

  // Update map view when center prop changes
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      const map = mapRef.current.getMap();
      map.setCenter({ lng: center[1], lat: center[0] });
    }
  }, [center, mapLoaded]);

  // Update map view when zoom prop changes
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      const map = mapRef.current.getMap();
      map.setZoom(zoom);
    }
  }, [zoom, mapLoaded]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: mapCenter.lng,
          latitude: mapCenter.lat,
          zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={style}
        onClick={handleMapClick}
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
        interactiveLayerIds={[]}
        attributionControl={showAttribution}
      >
        {showNavigation && <NavigationControl position="top-right" />}
        {showScale && <ScaleControl position="bottom-left" />}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.latitude}
            longitude={marker.longitude}
            onClick={() => handleMarkerClick(marker)}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-110 ${
                marker.selected
                  ? 'border-brand bg-brand text-white'
                  : 'border-white bg-brand-deep text-white'
              }`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </Marker>
        ))}
      </Map>

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-mist/50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default MapView;
