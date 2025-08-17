/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { getCountryCenter } from "@/libs/maps/country_center_map";
import { isWithinBBox } from "@/libs/maps/utils";
import {
  BaseContentMeta,
  BaseDetailMeta,
  ResourceMeta,
} from "@/types/client/client_model";
import { BoundingBox } from "@/types/maps";
import { useCallback, useMemo, useState } from "react";
import GeoMap from "./GeoMap";

interface MapWithBBoxProps {
  allResources: ResourceMeta<BaseContentMeta, BaseDetailMeta>[];
  onBoundingBoxChange: (bbox: BoundingBox) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  hoveredId?: string;
  setGeoResourceIds: (ids: string[]) => void;
}

export default function MapWithBBox({
  allResources,
  onBoundingBoxChange,
  initialCenter,
  initialZoom,
  hoveredId,
  setGeoResourceIds,
}: MapWithBBoxProps) {
  const [bbox, setBbox] = useState<BoundingBox | null>(null);

  const visibleResources = useMemo(() => {
    if (!bbox) return allResources;

    return allResources.filter((res) => isWithinBBox(res, bbox));
  }, [allResources, bbox]);

  const onBoundingBoxChangeWrapper = useCallback(
    (newBbox: BoundingBox) => {
      // console.log("🔍 New BBox:", newBbox); // DEBUG
      setBbox(newBbox);
      onBoundingBoxChange(newBbox);
    },
    [onBoundingBoxChange]
  );

  const markers = useMemo(
    () =>
      visibleResources
        .map((r) => {
          if (
            (r.detailMeta?.latitude === null ||
              r.detailMeta?.longitude === null) &&
            r.detailMeta?.country
          ) {
            const countryCenter = getCountryCenter(r.detailMeta?.country);
            if (countryCenter) {
              const [lat, lng] = countryCenter;
              return {
                lat: lat,
                lng: lng,
                id: r.basicMeta.resourceId,
              };
            }
          }
          return {
            lat: r.detailMeta?.latitude,
            lng: r.detailMeta?.longitude,
            id: r.basicMeta.resourceId,
          };
        })
        .filter(
          (m): m is { lat: number; lng: number; id: string } =>
            !Number.isNaN(m.lat) && !Number.isNaN(m.lng)
        ),
    [visibleResources]
  );

  return (
    <GeoMap
      markers={markers}
      hoveredId={hoveredId}
      setGeoResourceIds={setGeoResourceIds}
      initialCenter={initialCenter}
      initialZoom={initialZoom}
      onBoundingBoxChange={onBoundingBoxChangeWrapper}
    />
  );
}
