/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { resolveCountryCode } from "./country_name_to_iso";

export const COUNTRY_CENTER_MAP: Record<string, [number, number]> = {
  // Asia
  JP: [36.2048, 138.2529],
  KR: [37.0, 127.5],
  CN: [35.0, 105.0],
  IN: [20.5937, 78.9629],
  ID: [-0.7893, 113.9213],
  TH: [15.87, 100.9925],
  PH: [12.8797, 121.774],
  VN: [21.0279, 105.851],
  SG: [1.3667, 103.8],
  MY: [2.5, 112.5],
  HK: [22.3, 114.1],
  TW: [23.5, 121.0],

  // North America
  US: [37.0902, -95.7129],
  CA: [56.1304, -106.3468],
  MX: [23.6345, -102.5528],

  // Europe
  FR: [46.0, 2.0],
  DE: [51.0, 9.0],
  GB: [55.3781, -3.436],
  IT: [41.8719, 12.5674],
  ES: [40.4637, -3.7492],
  RU: [61.524, 105.3188],
  NL: [52.1326, 5.2913],
  BE: [50.5039, 4.4699],
  SE: [60.1282, 18.6435],
  NO: [60.472, 8.4689],
  DK: [56.2639, 9.5018],
  FI: [61.9241, 25.7482],
  CH: [46.8182, 8.2275],
  AT: [47.5162, 14.5501],
  PT: [39.3999, -8.2245],
  IE: [53.4129, -8.2439],
  GR: [39.0742, 21.8243],
  PL: [51.9194, 19.1451],
  CZ: [49.8175, 15.473],
  HU: [47.1625, 19.5033],

  // South America
  BR: [-14.235, -51.9253],
  AR: [-34.8, -64.965],
  CL: [-35.6751, -71.5429],
  CO: [4.5709, -74.2973],
  PE: [-9.19, -75.0152],

  // Oceania
  AU: [-25.0, 135.0],
  NZ: [-42.0, 174.0],

  // Africa
  ZA: [-30.5595, 22.9375],
  EG: [26.8206, 30.8025],
  NG: [9.082, 8.6753],

  // Middle East
  SA: [23.8859, 45.0792],
  AE: [23.4241, 53.8478],
  TR: [38.9637, 35.2433],
};

export function getCountryCenter(
  country: string | null | undefined
): [number, number] | undefined {
  if (country) {
    const iso = resolveCountryCode(country);
    if (iso) {
      return COUNTRY_CENTER_MAP[iso];
    }
  }
  return undefined;
}
