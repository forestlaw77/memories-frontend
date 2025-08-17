/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

/*
 Leaflet はマップ初期化時に containerRef.current の実際の offsetWidth と offsetHeight を参照します。
 これらの値が期待通りでない場合、マップの表示がおかしくなります。
 Leaflet はワールドラッピングにより無限にパンできるのですが、マーカーを使っていると、マーカーのついている
 世界とマーカーのついていない世界が見えてしまって、バグのように感じてしまいます。
 そこで、単一の世界だけ表示するため、マップが経度180度／-180度を超えてパンされないようにしています。
 しかし、地図のアスペクト比によっては、初期表示の段階から複数の世界が表示されます。これを防ぐため、
 アスペクト比を固定し、複数の世界が表示されないような使い方を決めました。

 Padding-Bottom Hack というテクニックを使います。

 Usage:
  <Box ml={4} width="640px"> // このBoxが、GeoMapの祖先で、幅を固定しています
      <Box
          position"relative" // これが GeoMap内のabsoluteなBoxの基準になります。
          width="100%"       // 親タグに対する相対サイズを指定
          _before={{         // padding-bottom hack
            content: `""`,
            display: "block",
            paddingBottom: "56.25%" // ここで高さが計算されます。56.25% -> 16:9
          }}
      >
          <GeoMap
              marker={marker}
              initialCenter={initialCenter}
              initialZoom={initialZoom}
              onBoundingBoxChange={onBoundingBoxChange}
          />
      </Box>
  </Box>

 */

"use client";

import { useMapInitialization } from "@/hooks/useMapInitialization";
import { useMarkersAndClustering } from "@/hooks/useMarkersAndClustering";
import { useTrajectoryLayers } from "@/hooks/useTrajectoryLayers";
import { BoundingBox } from "@/types/maps";
import { getNearbyLatLngs } from "@/utils/map/mapHelpers";
import { Box } from "@chakra-ui/react";
import L from "leaflet";
import "leaflet-polylinedecorator";
import "leaflet.markercluster";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MdLocationPin } from "react-icons/md";

interface CustomMarkerOptions extends L.MarkerOptions {
  resourceId: string;
}

export interface GeoMapRef {
  isReady: boolean;
  zoomToCurrentPoint: (
    id: string,
    options?: { zoom?: number; includeNearby: boolean }
  ) => Promise<{ success: boolean; zoomLevel: number; center: L.LatLng }>;
  getMapInstance: () => L.Map | null;
  getClusterGroup: () => L.MarkerClusterGroup | null;
}

export const defaultIcon = L.divIcon({
  html: renderToStaticMarkup(<MdLocationPin size={24} color="blue" />),
  className: "",
  iconSize: [24, 24],
});

export const highlightIcon = L.divIcon({
  html: renderToStaticMarkup(<MdLocationPin size={28} color="red" />),
  className: "", // Leafletのデフォルトクラスを無効化
  iconSize: [28, 28],
});

const pulseIcon = L.divIcon({
  html: `<div class="marker-pulse"></div>`,
  className: "", // デフォルトスタイルをオフ
  iconSize: [32, 32],
});

interface Marker {
  lat: number;
  lng: number;
  id: string;
  opacity?: number;
}

export interface TrajectorySegment {
  path: [number, number][];
  color: string;
}

interface GeoMapProps {
  markers: Marker[];
  hoveredId?: string;
  trajectoryPath?: [number, number][];
  trajectorySegments?: TrajectorySegment[];
  setGeoResourceIds?: (ids: string[]) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  onBoundingBoxChange?: (bbox: BoundingBox) => void;
  onMoveEnd?: (center: L.LatLng, zoom: number) => void;
  onReady?: () => void;
}

const GeoMap = forwardRef(function GeoMap(
  {
    markers,
    hoveredId,
    trajectoryPath,
    trajectorySegments,
    setGeoResourceIds,
    initialCenter = [20, 0],
    initialZoom = 1,
    onBoundingBoxChange,
    onMoveEnd,
    onReady,
  }: GeoMapProps,
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { mapRef } = useMapInitialization({
    containerRef,
    initialCenter,
    initialZoom,
    onBoundingBoxChange,
    onMoveEnd,
  });

  const { clusterGroupRef } = useMarkersAndClustering({
    mapRef,
    markers,
    hoveredId,
    setGeoResourceIds,
    defaultIcon,
    pulseIcon,
  });

  useTrajectoryLayers({
    mapRef,
    trajectoryPath,
    trajectorySegments,
  });

  function zoomToCurrentPoint(
    currentId: string,
    options?: { zoom?: number; includeNearby: boolean }
  ): Promise<{ success: boolean; zoomLevel: number; center: L.LatLng }> {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;

    if (!map || !clusterGroup) {
      return Promise.resolve({
        success: false,
        zoomLevel: 0,
        center: L.latLng(0, 0),
      });
    }

    const markerLayer = clusterGroup.getLayers().find((layer: any) => {
      return layer.options?.resourceId === currentId;
    });

    if (!markerLayer || !(markerLayer instanceof L.Marker)) {
      return Promise.resolve({
        success: false,
        zoomLevel: map.getZoom(),
        center: map.getCenter(),
      });
    }

    const targetLatLng = markerLayer.getLatLng();

    // options が指定されない場合は、現在のズームを維持する
    let zoomLevelToApply = map.getZoom();
    if (options?.zoom !== undefined) {
      zoomLevelToApply = options.zoom;
    }

    if (options && options.includeNearby) {
      const dynamicRadiusKm = getDynamicRadiusKm(map.getZoom());
      const nearbyLatLngs = getNearbyLatLngs(
        markers,
        targetLatLng,
        dynamicRadiusKm
      );

      const allPointsForBounds = [
        targetLatLng,
        ...nearbyLatLngs.map((p) => p.latLng),
      ];
      const bounds = L.latLngBounds(allPointsForBounds);

      // includeNearby の場合のズーム調整
      // ・options.zoom が指定されていればそれと getBoundsZoom の小さい方
      // ・指定されていなければ getBoundsZoom の結果を優先
      const boundsCalculatedZoom = map.getBoundsZoom(bounds, false);
      if (options?.zoom !== undefined) {
        zoomLevelToApply = Math.min(boundsCalculatedZoom, options.zoom);
      } else {
        zoomLevelToApply = boundsCalculatedZoom;
      }
    }

    // 中心にマーカーを持ってくる
    map.flyTo(targetLatLng, zoomLevelToApply, {
      animate: true,
      duration: 0.5,
    });

    return Promise.resolve({
      success: true,
      zoomLevel: zoomLevelToApply,
      center: targetLatLng,
    });
  }

  const isMapReady = useRef(false);

  useEffect(() => {
    if (mapRef.current && clusterGroupRef.current) {
      isMapReady.current = true;
      onReady?.();
    }
  }, [mapRef.current, clusterGroupRef.current]);

  useImperativeHandle(ref, () => ({
    isReady: isMapReady.current,
    zoomToCurrentPoint,
    getMapInstance: () => mapRef.current,
    getClusterGroup: () => clusterGroupRef.current,
  }));

  return (
    <Box
      ref={containerRef} // Attach the `containerRef` to this div(<Box/>), so Leaflet can render the map inside it.
      borderRadius="md"
      position="absolute" // 親要素からの絶対配置
      top="0"
      left="0"
      right="0"
      bottom="0"
      border="1px solid red"
    />
  );
});

const getDynamicRadiusKm = (zoom: number): number =>
  Math.max(0.5, Math.min(5, zoom / 2));

export default GeoMap;
