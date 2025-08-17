/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module MetadataUtils
 * @description
 * Provides helper utility functions for processing metadata.
 */

import { resolveCountryCode } from "../maps/country_name_to_iso";

/**
 * Applies address-related fields from `locationInfo` to a detail metadata object.
 *
 * This function supplements missing address information from available location data.
 * It also converts country names to their respective ISO 3166-1 Alpha-2 codes.
 *
 * @param {Record<string, any>} detailMeta - The detail metadata object to apply address fields to.
 * @param {any} locationInfo - The location object from the server's `extra_info`.
 */
export function applyAddressFields(
  detailMeta: Record<string, any>,
  locationInfo: any
) {
  if (!("country" in detailMeta)) {
    detailMeta["country"] =
      !locationInfo || !locationInfo.address || !locationInfo.address["country"]
        ? "Unknown"
        : resolveCountryCode(locationInfo.address["country"]) ||
          locationInfo.address["country"];
  } else if (detailMeta.country.length > 2) {
    detailMeta.country =
      resolveCountryCode(detailMeta["country"]) || detailMeta.country;
  }

  const addressFields = ["tourism", "amenity", "city", "county"];
  addressFields.forEach((key) => {
    if (!(key in detailMeta) || detailMeta[key] === "") {
      detailMeta[key] =
        !locationInfo || !locationInfo.address || !locationInfo.address[key]
          ? ""
          : locationInfo.address[key];
    }
  });

  if (!detailMeta.state || detailMeta.state === "") {
    if (!locationInfo || !locationInfo.address) {
      detailMeta.state = "";
    } else {
      detailMeta.state =
        locationInfo.address["state"] ||
        locationInfo.address["province"] ||
        locationInfo.address["region"] ||
        locationInfo.address["department"] ||
        locationInfo.address["county"] ||
        detailMeta.city ||
        "";
      detailMeta.state = detailMeta.state.replace(/ Prefecture$/, "");
      detailMeta.state = detailMeta.state.replace(/ Province$/, "");
    }
  }
}

/**
 * Converts an EXIF orientation label string to its corresponding numeric value.
 *
 * @param {string} label - The string label for the EXIF orientation (e.g., "Rotate 90 CW").
 * @returns {number} The corresponding numeric orientation value (e.g., 6). Defaults to `1` ("Horizontal (normal)").
 */
export function getOrientationValue(label: string): number {
  const orientationLabelToValue: Record<string, number> = {
    "Horizontal (normal)": 1,
    "Mirror horizontal": 2,
    "Rotate 180": 3,
    "Mirror vertical": 4,
    "Mirror horizontal and rotate 270 CW": 5,
    "Rotate 90 CW": 6,
    "Mirror horizontal and rotate 90 CW": 7,
    "Rotate 270 CW": 8,
  };
  return orientationLabelToValue[label] ?? 1;
}
