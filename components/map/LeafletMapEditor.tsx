/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { LatLngExpression } from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

function DynamicCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng]);
    }
  }, [lat, lng, map]);

  return null;
}

function LocationMarker({
  position,
  onUpdate,
}: {
  position?: [number, number] | null;
  onUpdate: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onUpdate(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export function LeafletMapEditor({
  lat,
  lng,
  onUpdate,
}: {
  lat: number;
  lng: number;
  onUpdate: (lat: number, lng: number) => void;
}) {
  console.log("LeafletMapEditor lat:", lat, "lng:", lng);
  const hasInitial = !isNaN(lat) && !isNaN(lng);
  const center: LatLngExpression = hasInitial
    ? [lat, lng]
    : [35.6812, 139.7671]; // Fallback: Tokyo
  console.log("LeafletMapEditor center:", center);

  return (
    <MapContainer
      center={center}
      zoom={4}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />
      {hasInitial && <Marker position={[lat, lng]} />}
      <DynamicCenter lat={lat} lng={lng} />
      <LocationMarker
        position={hasInitial ? [lat, lng] : null}
        onUpdate={onUpdate}
      />
    </MapContainer>
  );
}
