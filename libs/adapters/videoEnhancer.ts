/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module VideoEnhancer
 * @description
 * Provides utility functions to enhance metadata for video resources.
 */

import {
  BaseContentMeta,
  BasicMeta,
  VideoDetailMeta,
} from "@/types/client/client_model";
import { ServerBasicMeta } from "@/types/server/server_model";
import { applyAddressFields } from "./metadataUtils";

/**
 * Enhances the metadata of a video resource with additional information.
 *
 * This function uses EXIF data (GPS coordinates, shooting date/time) and location
 * information to supplement missing metadata fields.
 *
 * @param {BasicMeta<BaseContentMeta>} basicMeta - The client's basic metadata object.
 * @param {VideoDetailMeta} detailMeta - The detail metadata object for the video.
 * @param {ServerBasicMeta} serverBasicMeta - The server's basic metadata object.
 */
export function enhanceVideoMeta(
  basicMeta: BasicMeta<BaseContentMeta>,
  detailMeta: VideoDetailMeta,
  serverBasicMeta: ServerBasicMeta
) {
  const content = serverBasicMeta.contents?.[0];
  if (!content) return;
  const exif = content.extra_info?.exif || {};
  const location = content.extra_info?.location;

  detailMeta.latitude =
    Number.isNaN(detailMeta.latitude) && exif.GPSLatitude
      ? Number(exif.GPSLatitude)
      : detailMeta.latitude;
  detailMeta.longitude =
    Number.isNaN(detailMeta.longitude) && exif.GPSLongitude
      ? Number(exif.GPSLongitude)
      : detailMeta.longitude;

  detailMeta.address = location?.address_string;
  detailMeta.shootingDateTime = detailMeta.shootingDateTime
    ? new Date(detailMeta.shootingDateTime)
    : exif.DateTimeOriginal
    ? new Date(exif.DateTimeOriginal)
    : undefined;
  detailMeta.shootingOffsetTime = exif.OffsetTime ? exif.OffsetTime : undefined;
  detailMeta.recordedDateTime = detailMeta.shootingDateTime ?? null;

  applyAddressFields(detailMeta, location);
}
