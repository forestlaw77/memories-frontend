/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import {
  BaseContentMeta,
  BaseDetailMeta,
  ResourceMeta,
} from "@/types/client/client_model";
import { BoundingBox } from "@/types/maps";

/**
 * Checks if a given resource's geographical coordinates fall within a specified bounding box.
 *
 * This function handles the special case where the bounding box crosses the antimeridian
 * (i.e., `minLng` is greater than `maxLng`, indicating the box spans across -180/180 longitude).
 *
 * @param resource - The resource object to check. It must have `detailMeta.latitude` and `detailMeta.longitude`.
 * @param bbox - The bounding box to check against.
 * @returns `true` if the resource's coordinates are within the bounding box (including boundaries), `false` otherwise.
 * Returns `false` if the resource's latitude or longitude is `null` or `undefined`.
 */
export function isWithinBBox(
  resource: ResourceMeta<BaseContentMeta, BaseDetailMeta>,
  bbox: BoundingBox
): boolean {
  // Destructure latitude and longitude from resource's detailMeta, defaulting to an empty object if detailMeta is null/undefined.
  const { latitude, longitude } = resource.detailMeta ?? {};

  // If latitude or longitude is null or undefined, the resource cannot be within any bounding box.
  if (
    latitude == null ||
    longitude == null ||
    isNaN(latitude) ||
    isNaN(longitude)
  )
    return false;

  // Check if the latitude is within the bounding box's latitude range.
  const latInRange = latitude >= bbox.minLat && latitude <= bbox.maxLat;

  // Check if the longitude is within the bounding box's longitude range.
  // This handles two cases:
  // 1. Normal case: The bounding box does not cross the antimeridian (minLng <= maxLng).
  //    Longitude must be between minLng and maxLng (inclusive).
  // 2. Special case: The bounding box crosses the antimeridian (minLng > maxLng).
  //    Longitude must be greater than or equal to minLng OR less than or equal to maxLng.
  const lngInRange =
    bbox.minLng <= bbox.maxLng
      ? longitude >= bbox.minLng && longitude <= bbox.maxLng // Normal case
      : longitude >= bbox.minLng || longitude <= bbox.maxLng; // Antimeridian crossing case

  // A resource is within the bounding box if both its latitude and longitude are in range.
  return latInRange && lngInRange;
}
