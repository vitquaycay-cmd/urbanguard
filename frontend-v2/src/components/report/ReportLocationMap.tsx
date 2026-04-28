import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const ZOOM = 14;

type Props = {
  latitude: number;
  longitude: number;
  onPositionChange: (lat: number, lng: number) => void;
};

function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FixResize() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = window.setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function ReportLocationMap({
  latitude,
  longitude,
  onPositionChange,
}: Props) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "report-location-marker",
        html: '<div style="width:14px;height:14px;background:#dc2626;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    [],
  );

  const handleDragEnd = useCallback(
    (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const p = marker.getLatLng();
      onPositionChange(p.lat, p.lng);
    },
    [onPositionChange],
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-red-500" aria-hidden>
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Vị trí sự cố</h3>
          <p className="mt-0.5 text-xs text-gray-400">
            Nhấp bản đồ hoặc kéo ghim để chọn vị trí ({latitude.toFixed(5)},{" "}
            {longitude.toFixed(5)})
          </p>
        </div>
      </div>

      <div className="mt-3 h-40 overflow-hidden rounded-xl bg-gray-100">
        <MapContainer
          center={[latitude, longitude]}
          zoom={ZOOM}
          className="h-full w-full"
          scrollWheelZoom
        >
          <FixResize />
          <Recenter lat={latitude} lng={longitude} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPositionChange={onPositionChange} />
          <Marker
            position={[latitude, longitude]}
            icon={icon}
            draggable
            eventHandlers={{ dragend: handleDragEnd }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
