"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import type { TspCity } from "@/lib/tspApi";

/* ── Fix broken default icon in Next.js / webpack ── */
function FixLeafletIcons() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);
  return null;
}

/* ── Numbered city icon ── */
function createCityIcon(num: number, isActive: boolean) {
  return L.divIcon({
    html: `<div style="
      background: ${isActive ? "#f97316" : "#dc2626"};
      color: #fdf8f8;
      border: 2px solid ${isActive ? "#fed7aa" : "#fdf8f8"};
      border-radius: 50%;
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.45);
      cursor: pointer;
      transition: background 0.15s;
    ">${num}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

/* ── Arrow icon at edge midpoint ── */
function getBearing(from: TspCity, to: TspCity): number {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat  * Math.PI) / 180;
  const dl   = ((to.lng - from.lng) * Math.PI) / 180;
  const y    = Math.sin(dl) * Math.cos(lat2);
  const x    = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dl);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function createArrowIcon(bearing: number) {
  /* ▶ points East (right) by default → rotate by (bearing - 90) to align with heading */
  const rotate = bearing - 90;
  return L.divIcon({
    html: `<div style="
      font-size: 14px;
      color: #dc2626;
      transform: rotate(${rotate}deg);
      transform-origin: center center;
      line-height: 1;
      pointer-events: none;
      filter: drop-shadow(0 0 3px rgba(220,38,38,0.55));
    ">▶</div>`,
    className: "",
    iconSize:   [18, 18],
    iconAnchor: [9, 9],
  });
}

/* ── Map click handler ── */
function MapClickHandler({
  onMapClick,
  disabled,
}: {
  onMapClick: (lat: number, lng: number) => void;
  disabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* ── Exports ── */
export interface AnimatedEdge {
  from: TspCity;
  to: TspCity;
}

interface TspLeafletMapProps {
  cities: TspCity[];
  animatedEdges: AnimatedEdge[];
  activeCityIds: Set<string>;
  onMapClick: (lat: number, lng: number) => void;
  onCityDelete: (cityId: string) => void;
  disabled: boolean;
}

export default function TspLeafletMap({
  cities,
  animatedEdges,
  activeCityIds,
  onMapClick,
  onCityDelete,
  disabled,
}: TspLeafletMapProps) {
  return (
    <MapContainer
      center={[-2.5, 118.0]}
      zoom={5}
      style={{ height: "100%", width: "100%", background: "#e8e8e8" }}
      zoomControl
    >
      <FixLeafletIcons />
      <MapClickHandler onMapClick={onMapClick} disabled={disabled} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ── City markers ── */}
      {cities.map((city, idx) => (
        <Marker
          key={city.id}
          position={[city.lat, city.lng]}
          icon={createCityIcon(idx + 1, activeCityIds.has(city.id))}
          eventHandlers={{
            click(e) {
              /* stop map click from firing → prevents adding a new city */
              L.DomEvent.stopPropagation(e);
              if (!disabled) onCityDelete(city.id);
            },
            contextmenu() {
              if (!disabled) onCityDelete(city.id);
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -18]}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{city.name}</span>
              <br />
              <span style={{ fontSize: 10, opacity: 0.65 }}>Klik untuk hapus</span>
            </div>
          </Tooltip>
        </Marker>
      ))}

      {/* ── Route polylines + midpoint arrows ── */}
      {animatedEdges.map((edge, i) => {
        const midLat = (edge.from.lat + edge.to.lat) / 2;
        const midLng = (edge.from.lng + edge.to.lng) / 2;
        const bearing = getBearing(edge.from, edge.to);

        return (
          <span key={i}>
            <Polyline
              positions={[
                [edge.from.lat, edge.from.lng],
                [edge.to.lat,   edge.to.lng],
              ]}
              pathOptions={{ color: "#dc2626", weight: 3, opacity: 0.85 }}
            />
            <Marker
              position={[midLat, midLng]}
              icon={createArrowIcon(bearing)}
              interactive={false}
            />
          </span>
        );
      })}
    </MapContainer>
  );
}
