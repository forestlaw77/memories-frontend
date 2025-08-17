/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

/**
 * Defines the structure for a bounding box, representing a geographical area.
 */
export interface BoundingBox {
  minLat: number; // Minimum latitude (south)
  minLng: number; // Minimum longitude (west)
  maxLat: number; // Maximum latitude (north)
  maxLng: number; // Maximum longitude (east)
}
