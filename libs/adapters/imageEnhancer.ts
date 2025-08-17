/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module ImageEnhancer
 * @description
 * Provides utility functions to enhance metadata for image resources.
 */

import {
  BasicMeta,
  ImageContentMeta,
  ImageDetailMeta,
} from "@/types/client/client_model";
import { ServerBasicMeta } from "@/types/server/server_model";
import { applyAddressFields, getOrientationValue } from "./metadataUtils";

/**
 * Enhances the metadata of an image resource with additional information.
 *
 * This function uses EXIF data (GPS coordinates, shooting date/time, orientation)
 * and location information to supplement and normalize detail metadata.
 *
 * @param {BasicMeta<ImageContentMeta>} basicMeta - The client's basic metadata object.
 * @param {ImageDetailMeta} detailMeta - The detail metadata object for the image.
 * @param {ServerBasicMeta} serverBasicMeta - The server's basic metadata object.
 */
export function enhanceImageMeta(
  basicMeta: BasicMeta<ImageContentMeta>,
  detailMeta: ImageDetailMeta,
  serverBasicMeta: ServerBasicMeta
) {
  const content = serverBasicMeta.contents?.[0];
  if (!content) return;
  const exif = content.extra_info?.exif || {};
  const location = content.extra_info?.location;

  detailMeta.latitude =
    detailMeta.latitude === null && !isNaN(Number(exif.GPSLatitude))
      ? Number(exif.GPSLatitude)
      : detailMeta.latitude;
  detailMeta.longitude =
    detailMeta.longitude === null && !isNaN(Number(exif.GPSLongitude))
      ? Number(exif.GPSLongitude)
      : detailMeta.longitude;

  detailMeta.address = detailMeta.address || location?.address_string;
  detailMeta.orientation = getOrientationValue(exif?.Orientation);
  detailMeta.shootingDateTime = detailMeta.shootingDateTime
    ? new Date(detailMeta.shootingDateTime)
    : exif.DateTimeOriginal
    ? new Date(exif.DateTimeOriginal)
    : undefined;

  detailMeta.shootingOffsetTime = exif.OffsetTime ? exif.OffsetTime : undefined;
  detailMeta.recordedDateTime = detailMeta.shootingDateTime ?? null;
  applyAddressFields(detailMeta, location);

  serverBasicMeta.contents.forEach((c, i) => {
    const exif = c.extra_info?.exif || {};
    const contentMeta = basicMeta.contents[i];
    contentMeta.address = contentMeta.address || location?.address_string;
    console.log("address:", exif);
    contentMeta.latitude =
      contentMeta.latitude ?? exif.GPSLatitude
        ? Number(exif.GPSLatitude)
        : undefined;
    console.log("contentMeta.latitude", contentMeta.latitude);
    contentMeta.longitude =
      contentMeta.longitude ?? exif.GPSLongitude
        ? Number(exif.GPSLongitude)
        : undefined;
    contentMeta.shootingDateTime = exif.DateTimeOriginal
      ? new Date(exif.DateTimeOriginal)
      : undefined;
    contentMeta.shootingOffsetTime = exif.OffsetTime
      ? exif.OffsetTime
      : undefined;
  });
}
