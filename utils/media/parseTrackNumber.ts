/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

/**
 * Parses a track number string and extracts the numeric value.
 *
 * This function is designed to process track numbers formatted as "{trackNumber} of {totalTracks}".
 * If the format is valid, it returns the extracted track number as a number; otherwise, it returns NaN.
 *
 * @param {string} trackNumber - The track number string (e.g., "3 of 10").
 * @returns {number} The parsed track number, or NaN if the format is invalid.
 *
 * @example
 * ```ts
 * const track1 = parseTrackNumber("5 of 12");
 * console.log(track1); // Output: 5
 *
 * const track2 = parseTrackNumber("Track 7");
 * console.log(track2); // Output: NaN
 * ```
 */
export function parseTrackNumber(trackNumber: string): number {
  const match = trackNumber.match(/^(\d+)\s*of\s*\d+$/);
  return match ? parseInt(match[1], 10) : NaN;
}
