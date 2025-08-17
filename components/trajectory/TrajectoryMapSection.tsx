/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import GeoMap, { GeoMapRef, TrajectorySegment } from "@/components/map/GeoMap";
import ResourceSlideshow from "@/components/resource/ui/ResourceSlideshow";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { TrajectoryPoint } from "@/hooks/useTrajectoryPoints";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import { MapZoomMode } from "@/types/client/view_preferences";
import { Box, Flex } from "@chakra-ui/react";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { Swiper as SwiperType } from "swiper/types";

interface TrajectoryMapSectionProps {
  hoveredId: string | undefined;
  currentPoint: TrajectoryPoint | null;
  trajectoryPoints: TrajectoryPoint[];
  trajectorySegments: TrajectorySegment[];
  visibleResources: ResourceMeta<BaseContentMeta, BaseDetailMeta>[];
  resourceType: RESOURCE_TYPE;
  thumbnails: { [key: string]: string };
  currentId: string | undefined;
  setCurrentId: (id: string) => void;
  swiperRef: React.MutableRefObject<SwiperType | undefined>;
  fadeMode?: boolean;
}

export const TrajectoryMapSection = ({
  hoveredId,
  currentPoint,
  trajectoryPoints,
  trajectorySegments,
  visibleResources,
  resourceType,
  thumbnails,
  currentId,
  setCurrentId,
  swiperRef,
  fadeMode,
}: TrajectoryMapSectionProps) => {
  const detailMapRef = useRef<GeoMapRef>(null);
  const overviewMapRef = useRef<GeoMapRef>(null);
  const { settings } = useGlobalSettings();

  // current point のズーム
  useEffect(() => {
    const detailMap = detailMapRef.current;

    if (!currentPoint || !detailMap?.isReady) return;

    const zoomOptions =
      settings.mapZoomMode === MapZoomMode.Auto
        ? { includeNearby: settings.includeNearby ?? true }
        : settings.mapZoomMode === MapZoomMode.Fixed
        ? { zoom: settings.fixedZoomLevel ?? 16, includeNearby: false }
        : undefined;

    detailMap.zoomToCurrentPoint(currentPoint.resourceId, zoomOptions);
    // .then(({ success, center }) => {
    //   if (success) {
    //     console.log("Zoomed to", center);
    //   } else {
    //     console.warn("Zoom failed");
    //   }
    // });
  }, [currentPoint]);

  const getOpacity = (point: TrajectoryPoint): number => {
    if (!fadeMode || !currentPoint) return 1;
    const now = currentPoint.recordedDateTime.getTime();
    const diff = Math.abs(point.recordedDateTime.getTime() - now);
    const maxDiff = 1000 * 60 * 60; // 1時間以内を濃く
    return Math.max(0.2, 1 - diff / maxDiff); // 0.2〜1の範囲でフェード
  };

  return (
    <Flex height="80%">
      <Box flex="1" position="relative">
        <GeoMap
          ref={detailMapRef}
          markers={trajectoryPoints.map((p) => ({
            lat: p.lat,
            lng: p.lng,
            id: p.resourceId,
            opacity: getOpacity(p),
          }))}
          hoveredId={hoveredId}
          trajectorySegments={trajectorySegments}
          initialCenter={[
            trajectoryPoints[0]?.lat ?? 0,
            trajectoryPoints[0]?.lng ?? 0,
          ]}
          initialZoom={12}
          onReady={() => {
            if (overviewMapRef.current?.isReady && currentPoint) {
              const map = overviewMapRef.current.getMapInstance();
              map?.flyTo(
                L.latLng(currentPoint.lat, currentPoint.lng),
                map.getZoom() ?? 5
              );
            }
          }}
        />
        <Box
          position="absolute"
          bottom="20px"
          left="16px"
          zIndex={1000}
          height="250px"
          width="250px"
        >
          <GeoMap
            ref={overviewMapRef}
            markers={trajectoryPoints.map((p) => ({
              lat: p.lat,
              lng: p.lng,
              id: p.resourceId,
            }))}
            hoveredId={hoveredId}
            trajectorySegments={trajectorySegments}
            initialCenter={[
              trajectoryPoints[0]?.lat ?? 0,
              trajectoryPoints[0]?.lng ?? 0,
            ]}
            initialZoom={3}
            onReady={() => {
              const map = overviewMapRef.current?.getMapInstance();
              map?.invalidateSize(); // ✅ サイズ再計算
              if (currentPoint) {
                map?.flyTo(
                  L.latLng(currentPoint.lat, currentPoint.lng),
                  map.getZoom() ?? 3
                );
              }
            }}
          />
        </Box>
        <Box
          position="absolute"
          bottom="20px"
          right="16px"
          zIndex={1000}
          width="250px"
        >
          <ResourceSlideshow
            resources={visibleResources}
            resourceType={resourceType}
            thumbnails={thumbnails}
            currentId={currentId}
            onSelect={(id) => {
              setCurrentId(id);
            }}
            swiperRef={swiperRef}
            autoplay={false}
          />
        </Box>
      </Box>
    </Flex>
  );
};
