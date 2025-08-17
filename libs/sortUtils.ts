/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { BaseDetailMeta } from "@/types/client/client_model";
import { BoundingBox } from "@/types/maps";

export function sortByBBoxCenter<T extends { detailMeta?: BaseDetailMeta }>(
  resources: T[],
  bbox: BoundingBox
): T[] {
  const centerLat = (bbox.minLat + bbox.maxLat) / 2;
  const centerLng = (bbox.minLng + bbox.maxLng) / 2;

  return [...resources].sort((a, b) => {
    const aLat = a.detailMeta?.latitude;
    const aLng = a.detailMeta?.longitude;
    const bLat = b.detailMeta?.latitude;
    const bLng = b.detailMeta?.longitude;

    if (
      typeof aLat !== "number" ||
      typeof aLng !== "number" ||
      typeof bLat !== "number" ||
      typeof bLng !== "number"
    )
      return 0;

    const aDist = Math.hypot(aLat - centerLat, aLng - centerLng);
    const bDist = Math.hypot(bLat - centerLat, bLng - centerLng);
    return aDist - bDist;
  });
}

export function sampleNearBBoxCenter<T extends { detailMeta?: BaseDetailMeta }>(
  resources: T[],
  bbox: BoundingBox,
  limit: number
): T[] {
  const centerLat = (bbox.minLat + bbox.maxLat) / 2;
  const centerLng = (bbox.minLng + bbox.maxLng) / 2;

  const candidates = resources
    .filter(
      (r) =>
        typeof r.detailMeta?.latitude === "number" &&
        typeof r.detailMeta?.longitude === "number"
    )
    .map((r) => {
      const lat = r.detailMeta!.latitude!;
      const lng = r.detailMeta!.longitude!;
      const dist = Math.hypot(lat - centerLat, lng - centerLng);
      return { resource: r, distance: dist };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit * 2);

  const shuffled = candidates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map((item) => item.resource);
}
