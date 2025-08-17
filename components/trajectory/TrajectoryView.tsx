/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { useResourceView } from "@/hooks/useResourceView";
import { useThumbnailStore } from "@/hooks/useThumbnailStore";
import { useTrajectoryPoints } from "@/hooks/useTrajectoryPoints";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { SortStrategy } from "@/types/client/view_preferences";
import { Box, Button, Text as ChakraText, Spinner } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper as SwiperType } from "swiper/types";
import DynamicBreadcrumb from "../common/DynamicBreadcrumb";
import { TrajectorySegment } from "../map/GeoMap";
import ResourceControls from "../resource/ui/ResourceControls";
import { TrajectoryMapSection } from "./TrajectoryMapSection";
import { TrajectoryPlaybackControls } from "./TrajectoryPlaybackControls";

export default function TrajectoryView() {
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);
  const swiperRef = useRef<SwiperType>(undefined);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);

  const {
    processedResources,
    isLoadingAllResources,
    isLoadingThumbnails,
    viewResources,
    setPage,
    pageSize,
    thumbnails,
  } = useResourceView({
    resourceType,
    sortStrategy: SortStrategy.RecordedAsc,
  });

  // 軌跡として表示可能なリソースの抽出
  const visibleResources = useMemo(() => {
    return processedResources?.filter((resource) => {
      const { latitude, longitude } = resource.detailMeta ?? {};
      if (latitude == null || longitude == null) return false;
      return !Number.isNaN(latitude) || !Number.isNaN(longitude);
    });
  }, [processedResources]);

  const trajectoryPoints = useTrajectoryPoints(visibleResources);
  const hasTrajectoryPoints = trajectoryPoints.length > 0;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackInterval, setPlaybackInterval] = useState<number>(2000); // 2sec

  const currentPoint = useMemo(() => {
    if (!hasTrajectoryPoints) return null;
    return trajectoryPoints[currentIndex];
  }, [trajectoryPoints, currentIndex, hasTrajectoryPoints]);

  const closestPoint = useMemo(() => {
    if (!hasTrajectoryPoints || !currentPoint) return null;
    return trajectoryPoints.reduce((prev, curr) => {
      const prevDiff = Math.abs(
        prev.recordedDateTime.getTime() -
          currentPoint.recordedDateTime.getTime()
      );
      const currDiff = Math.abs(
        curr.recordedDateTime.getTime() -
          currentPoint.recordedDateTime.getTime()
      );
      return currDiff < prevDiff ? curr : prev;
    }, trajectoryPoints[0]);
  }, [trajectoryPoints, currentPoint, hasTrajectoryPoints]);

  const pastPoints = useMemo(() => {
    if (!currentPoint) return [];
    return trajectoryPoints.filter(
      (p) =>
        p.recordedDateTime.getTime() <= currentPoint.recordedDateTime.getTime()
    );
  }, [trajectoryPoints, currentPoint]);

  const futurePoints = useMemo(() => {
    if (!currentPoint) return [];
    return trajectoryPoints.filter(
      (p) =>
        p.recordedDateTime.getTime() > currentPoint.recordedDateTime.getTime()
    );
  }, [trajectoryPoints, currentPoint]);

  const trajectorySegments = useMemo(() => {
    const segments: TrajectorySegment[] = [];
    // PAST
    if (pastPoints.length >= 2) {
      segments.push({
        path: pastPoints.map((p) => [p.lat, p.lng]),
        color: "blue",
      });
    }
    // FUTURE
    if (futurePoints.length >= 2) {
      segments.push({
        path: futurePoints.map((p) => [p.lat, p.lng]),
        color: "gray",
      });
    }
    // PAST-FUTURE
    if (pastPoints.length > 0 && futurePoints.length > 0) {
      const connector: [number, number][] = [
        [
          pastPoints[pastPoints.length - 1].lat,
          pastPoints[pastPoints.length - 1].lng,
        ],
        [futurePoints[0].lat, futurePoints[0].lng],
      ];
      segments.push({
        path: connector,
        color: "red",
      });
    }
    return segments;
  }, [pastPoints, futurePoints]);

  useEffect(() => {
    if (hasTrajectoryPoints) {
      if (closestPoint) {
        setHoveredId(closestPoint.resourceId);
      } else {
        setHoveredId(undefined);
      }
    } else {
      setHoveredId(undefined);
      setCurrentIndex(0);
    }
  }, [closestPoint, hasTrajectoryPoints]);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < trajectoryPoints.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false); // 再生停止
          return prev;
        }
      });
    }, playbackInterval);

    return () => clearInterval(interval);
  }, [isPlaying, playbackInterval, trajectoryPoints.length]);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(currentIndex);
    }
  }, [currentIndex]);

  const preloadThumbnails = useThumbnailStore((s) => s.preloadThumbnails);
  useEffect(() => {
    preloadThumbnails(thumbnails);
  }, [thumbnails]);

  const isLoadingCombined = isLoadingAllResources || isLoadingThumbnails;

  return (
    <Box p={6}>
      <DynamicBreadcrumb />
      <ResourceControls
        resourceType={resourceType}
        allResources={processedResources}
        setPage={(page) => setPage(page)}
        count={processedResources?.length ?? 0}
        onAction={(action) => {}}
      />
      {isLoadingCombined ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <ChakraText mt={4} fontSize="lg">
            Loading resources...
          </ChakraText>
        </Box>
      ) : (
        <>
          {processedResources?.length === 0 ? (
            <Box textAlign="center" py={10}>
              <ChakraText fontSize="xl" color="gray.500">
                No resources found for '{resourceType}'.
              </ChakraText>
              <Button mt={4} colorPalette="blue" onClick={() => {}}>
                Add New {resourceType.slice(0, -1) || "Resource"}
              </Button>
            </Box>
          ) : (
            <Box height="calc(100vh - 256px)">
              <TrajectoryMapSection
                hoveredId={hoveredId}
                currentPoint={currentPoint}
                trajectoryPoints={trajectoryPoints}
                trajectorySegments={trajectorySegments}
                visibleResources={visibleResources ?? []}
                resourceType={resourceType}
                thumbnails={thumbnails}
                currentId={currentId}
                setCurrentId={(id) => {
                  setCurrentId(id);
                  const index = trajectoryPoints.findIndex(
                    (p) => p.resourceId === id
                  );
                  setCurrentIndex(index >= 0 ? index : 0);
                }}
                swiperRef={swiperRef}
              />

              {hasTrajectoryPoints && (
                <TrajectoryPlaybackControls
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                  trajectoryPoints={trajectoryPoints}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  playbackInterval={playbackInterval}
                  setPlaybackInterval={setPlaybackInterval}
                  hasTrajectoryPoints={hasTrajectoryPoints}
                />
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
