/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module NearbyMarkers
 * @description Provides a utility function for finding markers within a specific radius of a central point on a map.
 */

import L from "leaflet";

/**
 * @description A basic interface for a marker with latitude, longitude, and a unique ID.
 */
interface Marker {
  /** The latitude coordinate. */
  lat: number;
  /** The longitude coordinate. */
  lng: number;
  /** The unique identifier for the marker. */
  id: string;
}

/**
 * @description Represents a point that is located nearby, including its ID and Leaflet LatLng object.
 */
export interface NearbyPoint {
  /** The unique identifier of the nearby point. */
  id: string;
  /** The Leaflet LatLng object representing the point's coordinates. */
  latLng: L.LatLng;
}

/**
 * Extracts markers within a specified distance from a given central point.
 *
 * This function first performs a quick bounding box check to filter out markers
 * that are definitely outside the radius, then calculates the precise distance
 * for the remaining markers to ensure they are within the `nearbyRadiusKm`.
 * It also excludes the center point itself from the results.
 *
 * @param {Marker[]} allMarkers - An array of all available markers to search through.
 * @param {L.LatLng} centerLatLng - The latitude and longitude of the central point.
 * @param {number} [nearbyRadiusKm=1] - The search radius in kilometers. Defaults to 1km.
 * @returns {NearbyPoint[]} An array of nearby points, each containing an ID and LatLng object.
 *
 * @example
 * ```typescript
 * const center = L.latLng(35.6812, 139.7671);
 * const allMarkers = [
 * { id: 'tokyo-station', lat: 35.6812, lng: 139.7671 },
 * { id: 'ginza', lat: 35.6728, lng: 139.7667 },
 * { id: 'shinjuku', lat: 35.6908, lng: 139.7001 }
 * ];
 *
 * const nearbyPoints = getNearbyLatLngs(allMarkers, center, 1);
 * // nearbyPoints will contain the 'ginza' marker
 * ```
 */
export const getNearbyLatLngs = (
  allMarkers: Marker[],
  centerLatLng: L.LatLng,
  nearbyRadiusKm: number = 1
): NearbyPoint[] => {
  const radiusMeters = nearbyRadiusKm * 1000;
  const bounds = centerLatLng.toBounds(radiusMeters); // Pre-filter with a bounding box

  return allMarkers
    .filter((m) => {
      const markerLatLng = L.latLng(m.lat, m.lng);
      const isInBounds = bounds.contains(markerLatLng);
      const isNotCenter = !(
        centerLatLng.lat === m.lat && centerLatLng.lng === m.lng
      );
      const isInRadius = centerLatLng.distanceTo(markerLatLng) <= radiusMeters;

      return isInBounds && isNotCenter && isInRadius;
    })
    .map((m) => ({
      id: m.id,
      latLng: L.latLng(m.lat, m.lng),
    }));
};
