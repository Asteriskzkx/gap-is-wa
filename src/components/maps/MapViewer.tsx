import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon as LeafletPolygon,
  Polyline as LeafletPolyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type GeoJSONGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "Polygon"; coordinates: [number, number][][] };

interface MapViewerProps {
  location: GeoJSONGeometry | null | undefined;
  height?: string;
  width?: string;
}

// Fix default marker icon URLs (Leaflet + Next.js)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapViewer: React.FC<MapViewerProps> = ({
  location,
  height = "300px",
  width = "100%",
}) => {
  // default center (Bangkok)
  const defaultCenter: [number, number] = [13.736717, 100.523186];

  // derive center from GeoJSON Point if available
  let center: [number, number] = defaultCenter;

  if (location?.type === "Point" && Array.isArray(location.coordinates)) {
    // GeoJSON coordinates are [lng, lat]
    const [lng, lat] = location.coordinates;
    if (typeof lat === "number" && typeof lng === "number") {
      center = [lat, lng];
    }
  }

  // Helper to convert [lng, lat] pairs to [lat, lng]
  const toLatLng = (coord: [number, number]) =>
    [coord[1], coord[0]] as [number, number];

  // Component to auto-fit map bounds when showing polygon/linestring
  const AutoFitBounds: React.FC<{ coords: [number, number][] }> = ({
    coords,
  }) => {
    const map = useMap();
    React.useEffect(() => {
      if (!coords || coords.length === 0) return;
      const latlngs = coords.map((c) => toLatLng(c));
      map.fitBounds(latlngs as any, { padding: [20, 20] });
    }, [map, coords]);
    return null;
  };

  return (
    <div
      style={{ height, width, minWidth: 0 }}
      className="rounded-md overflow-hidden"
    >
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: `calc(100% - 48px)`, width: "100%" }}
        dragging={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        touchZoom={true}
        boxZoom={false}
        attributionControl={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {location?.type === "Point" && (
          <Marker position={center} draggable={false}>
            <Popup>
              พิกัด: {center[0].toFixed(6)}, {center[1].toFixed(6)}
            </Popup>
          </Marker>
        )}

        {location?.type === "Polygon" &&
          Array.isArray(location.coordinates) && (
            <>
              {/* use first ring */}
              {(() => {
                const ring = location.coordinates[0] || [];
                const latlngs = ring.map((c) => toLatLng(c));
                return (
                  <>
                    <LeafletPolygon
                      positions={latlngs as any}
                      pathOptions={{ color: "blue", fillOpacity: 0.2 }}
                    />
                    <AutoFitBounds coords={ring} />
                  </>
                );
              })()}
            </>
          )}

        {location?.type === "LineString" &&
          Array.isArray(location.coordinates) && (
            <>
              {(() => {
                const coords = location.coordinates;
                const latlngs = coords.map((c) => toLatLng(c));
                return (
                  <>
                    <LeafletPolyline
                      positions={latlngs as any}
                      pathOptions={{ color: "red" }}
                    />
                    <AutoFitBounds coords={coords} />
                  </>
                );
              })()}
            </>
          )}
      </MapContainer>

      <div className="h-12 p-2 bg-white border-t flex gap-2 items-center">
        <span className="text-sm text-gray-600">เปิดใน:</span>
        {(() => {
          const [lat, lng] = center;
          const googleUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          const appleWebUrl = `https://maps.apple.com/?ll=${lat},${lng}`; // works on iOS — will open Apple Maps from Safari
          const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}`; // Android intent-style URI (may be handled by device)
          return (
            <>
              <a
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in Google Maps"
              >
                Google Maps
              </a>
              <a
                className="px-3 py-1 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-900"
                href={appleWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in Apple Maps"
              >
                Apple Maps
              </a>
              {/* Optional geo: link for Android apps — keep but hidden for web users (visually hidden but focusable) */}
              <a className="sr-only" href={geoUrl} aria-label="Open geo link">
                Open geo
              </a>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default MapViewer;
