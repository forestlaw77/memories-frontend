/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useRef } from "react";

interface Marker {
  lat: number;
  lng: number;
  id: string;
  opacity?: number;
}
interface CustomMarkerOptions extends L.MarkerOptions {
  resourceId: string;
}

interface CustomMarker extends L.Marker {
  options: CustomMarkerOptions;
}

interface UseMarkersAndClusteringProps {
  mapRef: React.RefObject<L.Map | null>;
  markers: Marker[];
  hoveredId?: string;
  setGeoResourceIds?: (ids: string[]) => void;
  defaultIcon: L.DivIcon;
  pulseIcon: L.DivIcon;
}

export const useMarkersAndClustering = ({
  mapRef,
  markers,
  hoveredId,
  setGeoResourceIds,
  defaultIcon,
  pulseIcon,
}: UseMarkersAndClusteringProps) => {
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      // マップインスタンスがない場合は、既存のクラスターグループをクリーンアップして終了
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
        clusterGroupRef.current = null;
      }
      return;
    }

    // 既存のclusterGroupが存在し、かつマップ上にない場合は除去
    if (clusterGroupRef.current && map.hasLayer(clusterGroupRef.current)) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current.clearLayers();
    }

    const newClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 20, // クラスタリング範囲を 20 ピクセルにする
      disableClusteringAtZoom: 17, // ズームレベル１７以上でクラスタリング解除
      iconCreateFunction: (cluster) => {
        const childMarkers = cluster.getAllChildMarkers() as CustomMarker[];
        const includesHovered = childMarkers.some(
          (marker) => marker.options.resourceId === hoveredId
        );
        const count = cluster.getChildCount();
        const sizeClass =
          count < 10 ? "small" : count < 100 ? "medium" : "large";
        const highlightClass = includesHovered ? "highlight" : "";

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster-${sizeClass} ${highlightClass}`.trim(),
          iconSize: [40, 40],
        });
      },
    });

    map.addLayer(newClusterGroup);
    clusterGroupRef.current = newClusterGroup;

    const handleClusterMouseOver = (e: L.LeafletEvent) => {
      const clusterLayer = e.layer as L.MarkerCluster;
      if (
        clusterLayer &&
        typeof clusterLayer.getAllChildMarkers === "function"
      ) {
        const hoveredResourceIds = (
          clusterLayer.getAllChildMarkers() as CustomMarker[]
        ).map((marker) => marker.options.resourceId);
        setGeoResourceIds?.(hoveredResourceIds);
      } else {
        console.warn(
          "Unexpected object in clustermouseover event or method not found:",
          clusterLayer
        );
      }
    };

    const handleClusterMouseOut = () => {
      setGeoResourceIds?.([]);
    };

    newClusterGroup.on("clustermouseover", handleClusterMouseOver);
    newClusterGroup.on("clustermouseout", handleClusterMouseOut);

    // マーカーの追加ロジック
    markers.forEach(({ lat, lng, id, opacity }) => {
      const marker = L.marker([lat, lng], {
        icon: id === hoveredId ? pulseIcon : defaultIcon,
        resourceId: id,
        opacity: opacity ?? 1,
      } as CustomMarkerOptions);
      marker.on("click", () => {
        setGeoResourceIds?.([id]);
      });
      newClusterGroup.addLayer(marker);
    });

    // クリーンアップ処理
    return () => {
      newClusterGroup.off("clustermouseover", handleClusterMouseOver);
      newClusterGroup.off("clustermouseout", handleClusterMouseOut);

      if (mapRef.current?.hasLayer(newClusterGroup)) {
        mapRef.current.removeLayer(newClusterGroup);
      }
      newClusterGroup.clearLayers();
      clusterGroupRef.current = null;
    };
  }, [markers, hoveredId, setGeoResourceIds, defaultIcon, pulseIcon]);

  return { clusterGroupRef };
};
