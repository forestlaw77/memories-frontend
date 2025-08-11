// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { BoundingBox } from "@/types/maps";
import L from "leaflet";
import { useEffect, useRef } from "react";

interface UseMapInitializationProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  initialCenter: [number, number];
  initialZoom: number;
  onBoundingBoxChange?: (bbox: BoundingBox) => void;
  onMoveEnd?: (center: L.LatLng, zoom: number) => void;
}

interface TileConfig {
  name: string;
  url: string;
  minZoom: number;
  maxZoom: number;
  attribution: string;
}

const tileConfigs: TileConfig[] = [
  {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    minZoom: 1,
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  },
  {
    name: "GSI Seamless Photo",
    url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
    minZoom: 2,
    maxZoom: 18,
    attribution: `<a href='https://www.gsi.go.jp/top.html' target='_blank'>地理院タイル</a>`,
  },
  {
    name: "GSI Standard",
    url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    minZoom: 5,
    maxZoom: 18,
    attribution: `<a href='https://www.gsi.go.jp/top.html' target='_blank'>地理院タイル</a>`,
  },
  {
    name: "GSI Pale",
    url: "http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
    minZoom: 5,
    maxZoom: 18,
    attribution: `<a href='https://www.gsi.go.jp/top.html' target='_blank'>地理院タイル</a>`,
  },
];

const WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];

export const useMapInitialization = ({
  containerRef,
  initialCenter,
  initialZoom,
  onBoundingBoxChange,
  onMoveEnd,
}: UseMapInitializationProps) => {
  const mapRef = useRef<L.Map | null>(null);

  /**
   * Effect hook for initializing the Leaflet map.
   * This effect runs only once when the component mounts.
   * It sets up the map with initial center and zoom, and adds tile layers.
   */
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const defaultLayerName = tileConfigs[0].name; // Default layer to be added initially

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 1,
      maxZoom: 19,
      maxBounds: WORLD_BOUNDS, // Sets the maximum bounds of the map to prevent panning beyond these coordinates.
      maxBoundsViscosity: 1.0, // Controls how bouncy the map is when dragging near the boundaries.
      worldCopyJump: true, // Prevents jumping to a new world copy when panning horizontally beyond 180/-180 longitude.
    });

    const baseLayers: Record<string, L.TileLayer> = {};
    tileConfigs.forEach((config) => {
      const layer = L.tileLayer(config.url, {
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,
        attribution: config.attribution,
      });

      layer.on("add", () => {
        const currentZoom = map.getZoom();
        map.setMinZoom(config.minZoom);
        map.setMaxZoom(config.maxZoom);

        if (currentZoom < config.minZoom) {
          map.setZoom(config.minZoom);
        } else if (currentZoom > config.maxZoom) {
          map.setZoom(config.maxZoom);
        }
      });

      baseLayers[config.name] = layer;
    });
    L.control.layers(baseLayers).addTo(map);
    baseLayers[defaultLayerName].addTo(map);

    /**
     * Event handler for the 'moveend' event of the map.
     * This event fires when the map's movement or zoom animation ends.
     * It calculates the current bounding box and calls `onBoundingBoxChange` if provided.
     */
    const handleMoveEnd = () => {
      if (!onBoundingBoxChange) return;
      const bounds = map.getBounds();
      onBoundingBoxChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
      if (onMoveEnd) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        onMoveEnd(center, zoom);
      }
    };
    map.on("moveend", handleMoveEnd);
    mapRef.current = map;

    /**
     * Cleanup function returned by the effect.
     * This function is executed when the component unmounts from the DOM,
     * or before the effect re-runs (though in this case, it's designed to run only once).
     */
    return () => {
      map.off("moveend", handleMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef, onBoundingBoxChange, onMoveEnd]);

  return { mapRef };
};
