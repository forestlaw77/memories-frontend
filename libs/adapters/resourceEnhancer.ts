/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module ResourceEnhancer
 * @description
 * Provides logic to enhance detail metadata with additional information based on resource type.
 */

import {
  BaseContentMeta,
  BaseDetailMeta,
  BasicMeta,
  BookDetailMeta,
  DocumentDetailMeta,
  ImageDetailMeta,
  MusicDetailMeta,
  RESOURCE_TYPE,
  VideoDetailMeta,
} from "@/types/client/client_model";
import { ServerBasicMeta } from "@/types/server/server_model";
import { enhanceBookMeta } from "./bookEnhancer";
import { enhanceDocumentMeta } from "./documentEnhancer";
import { enhanceImageMeta } from "./imageEnhancer";
import { enhanceMusicMeta } from "./musicEnhancer";
import { enhanceVideoMeta } from "./videoEnhancer";

/**
 * Applies additional information to the detail metadata based on the resource type.
 *
 * This function acts as a dispatcher, encapsulating the specific enhancement logic
 * for each resource type into separate, dedicated functions.
 *
 * @template TContentMeta - The type of the content metadata.
 * @template TDetailMeta - The type of the detail metadata.
 * @param {RESOURCE_TYPE} resourceType - The type of resource to process.
 * @param {ServerBasicMeta} serverBasicMeta - The server's basic metadata object.
 * @param {BasicMeta<TContentMeta>} basicMeta - The client's basic metadata object.
 * @param {TDetailMeta} detailMeta - The client's detail metadata object.
 */
export function applyDetailMetaEnhancement<
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
>(
  resourceType: RESOURCE_TYPE,
  serverBasicMeta: ServerBasicMeta,
  basicMeta: BasicMeta<TContentMeta>,
  detailMeta: TDetailMeta
) {
  switch (resourceType) {
    case RESOURCE_TYPE.BOOKS:
      enhanceBookMeta(basicMeta, detailMeta as BookDetailMeta, serverBasicMeta);
      break;
    case RESOURCE_TYPE.DOCUMENTS:
      enhanceDocumentMeta(
        basicMeta,
        detailMeta as DocumentDetailMeta,
        serverBasicMeta
      );
      break;
    case RESOURCE_TYPE.IMAGES:
      enhanceImageMeta(
        basicMeta,
        detailMeta as ImageDetailMeta,
        serverBasicMeta
      );
      break;
    case RESOURCE_TYPE.MUSIC:
      enhanceMusicMeta(
        basicMeta,
        detailMeta as MusicDetailMeta,
        serverBasicMeta
      );
      break;
    case RESOURCE_TYPE.VIDEOS:
      enhanceVideoMeta(
        basicMeta,
        detailMeta as VideoDetailMeta,
        serverBasicMeta
      );
      break;
    default:
      console.warn(
        `No enhancement function for resource type: ${resourceType}`
      );
      break;
  }
}
