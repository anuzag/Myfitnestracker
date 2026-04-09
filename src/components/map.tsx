"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, Marker, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  center: [number, number];
  path: [number, number][];
}

function ChangeView({ center, shouldFollow }: { center: [number, number], shouldFollow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (shouldFollow) {
      map.setView(center);
    }
  }, [center, map, shouldFollow]);
  return null;
}

export default function Map({ center, path }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [shouldFollow, setShouldFollow] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-zinc-900 animate-pulse" />;

  return (
    <div className="relative h-full w-full group">
        <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full rounded-2xl overflow-hidden glass"
        >
        <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark:invert dark:opacity-80"
        />
        <ZoomControl position="bottomright" />
        <ChangeView center={center} shouldFollow={shouldFollow} />
        <Polyline positions={path} color="#22c55e" weight={5} opacity={0.6} lineCap="round" />
        <Marker position={center} icon={icon} />
        </MapContainer>

        <button 
            onClick={() => setShouldFollow(!shouldFollow)}
            className={`absolute top-4 right-4 z-[1000] p-3 rounded-full shadow-xl transition-all ${
                shouldFollow ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-400"
            }`}
            title={shouldFollow ? "Following Position" : "Free Camera"}
        >
            <Navigation className={`h-5 w-5 ${shouldFollow ? "animate-pulse" : ""}`} />
        </button>
    </div>
  );
}
