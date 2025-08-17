/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module BookEnhancer
 * @description
 * Provides utility functions to enhance metadata for book resources.
 */

import {
  BaseContentMeta,
  BasicMeta,
  BookDetailMeta,
} from "@/types/client/client_model";
import { ServerBasicMeta } from "@/types/server/server_model";
import { getCountryCenter } from "../maps/country_center_map";

/**
 * Enhances the metadata of a book resource with additional information.
 *
 * This function uses EXIF data and default latitude/longitude for countries to
 * supplement missing metadata fields.
 *
 * @param {BasicMeta<BaseContentMeta>} basicMeta - The client's basic metadata object.
 * @param {BookDetailMeta} detailMeta - The detail metadata object for the book.
 * @param {ServerBasicMeta} serverBasicMeta - The server's basic metadata object.
 */
export function enhanceBookMeta(
  basicMeta: BasicMeta<BaseContentMeta>,
  detailMeta: BookDetailMeta,
  serverBasicMeta: ServerBasicMeta
) {
  const countryCenter = getCountryCenter(detailMeta.country);
  if (
    (detailMeta.latitude === null || detailMeta.longitude === null) &&
    countryCenter
  ) {
    [detailMeta.latitude, detailMeta.longitude] = countryCenter;
  }

  const content = serverBasicMeta.contents[0];
  if (!content) return;
  const exif = content.extra_info?.exif || {};
  detailMeta.title = detailMeta.title || exif.Title;
  detailMeta.author = detailMeta.author || exif.Creator;
  detailMeta.publisher = detailMeta.publisher || exif.Publisher;
  detailMeta.publishedAt =
    detailMeta.publishedAt || exif.Date || exif.MetadataDate;
  detailMeta.publishedAt = detailMeta.publishedAt
    ? new Date(detailMeta.publishedAt)
    : undefined;
  detailMeta.recordedDateTime =
    detailMeta.recordedDateTime || (detailMeta.publishedAt ?? null);
}
