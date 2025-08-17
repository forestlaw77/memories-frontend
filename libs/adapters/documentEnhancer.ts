/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module DocumentEnhancer
 * @description
 * Provides utility functions to enhance metadata for document resources.
 */

import {
  BaseContentMeta,
  BasicMeta,
  DocumentDetailMeta,
} from "@/types/client/client_model";
import { ServerBasicMeta } from "@/types/server/server_model";
import { getCountryCenter } from "../maps/country_center_map";

/**
 * Enhances the metadata of a document resource with additional information.
 *
 * This function uses EXIF data and default latitude/longitude for countries to
 * supplement missing metadata fields.
 *
 * @param {BasicMeta<BaseContentMeta>} basicMeta - The client's basic metadata object.
 * @param {DocumentDetailMeta} detailMeta - The detail metadata object for the document.
 * @param {ServerBasicMeta} serverBasicMeta - The server's basic metadata object.
 */
export function enhanceDocumentMeta(
  basicMeta: BasicMeta<BaseContentMeta>,
  detailMeta: DocumentDetailMeta,
  serverBasicMeta: ServerBasicMeta
) {
  const countryCenter = getCountryCenter(detailMeta.country);
  if (
    (detailMeta.latitude === null || detailMeta.longitude === null) &&
    countryCenter
  ) {
    [detailMeta.latitude, detailMeta.longitude] = countryCenter;
  }

  const content = serverBasicMeta.contents?.[0];
  if (!content) return;
  const exif = content.extra_info?.exif || {};
  detailMeta.title = detailMeta.title || exif.Title;
  detailMeta.creator = detailMeta.creator || exif.Creator;
  detailMeta.recordedDateTime =
    detailMeta.recordedDateTime ||
    (basicMeta.createdAt ? new Date(basicMeta.createdAt) : null);
}
