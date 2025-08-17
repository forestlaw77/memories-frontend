/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module ResourceAdapter
 * @description
 * Provides an adapter class to transform resource data from the server's format into the client application's model.
 */

import { toaster } from "@/components/common/toaster";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import { ServerResourceMeta } from "@/types/server/server_model";
import { resolveCountryCode } from "../maps/country_name_to_iso";
import { applyDetailMetaEnhancement } from "./resourceEnhancer";

/**
 * A static class for converting server-side resource data to client-side models.
 *
 * This class takes data fetched from the server API and transforms it into a
 * structured `ResourceMeta` object that is easier for frontend components to handle.
 */
export class ResourceAdapter {
  /**
   * Converts a server resource object into a client resource model.
   *
   * The conversion process includes fitting the basic metadata, mapping the
   * detail metadata, and applying resource-type-specific metadata enhancements.
   *
   * @template TContentMeta - The type of the content metadata, extending `BaseContentMeta`.
   * @template TDetailMeta - The type of the detail metadata, extending `BaseDetailMeta`.
   * @param {RESOURCE_TYPE} resourceType - The type of resource to process.
   * @param {ServerResourceMeta} serverResource - The resource object fetched from the server.
   * @returns {ResourceMeta<TContentMeta, TDetailMeta> | null}
   * The converted resource metadata, or `null` if the conversion fails.
   */
  static fromServerResource<
    TContentMeta extends BaseContentMeta,
    TDetailMeta extends BaseDetailMeta
  >(
    resourceType: RESOURCE_TYPE,
    serverResource: ServerResourceMeta
  ): ResourceMeta<TContentMeta, TDetailMeta> | null {
    // Adapter for client-side BasicMeta
    if (!serverResource) {
      toaster.create({
        description: `The resource could not be obtained.`,
        type: "error",
      });
      return null;
    }
    if (!serverResource.id) {
      toaster.create({
        description: `The resource ID could not be obtained.`,
        type: "error",
      });
      return null;
    }
    if (!serverResource.basic_meta) {
      toaster.create({
        description: `Basic metadata could not be retrieved.`,
        type: "error",
      });
      return null;
    }
    const basicMeta = {
      resourceId: serverResource.id,
      resourceType: resourceType,
      createdAt: serverResource.basic_meta.created_at
        ? new Date(serverResource.basic_meta.created_at)
        : null,
      updatedAt: serverResource.basic_meta.updated_at
        ? new Date(serverResource.basic_meta.updated_at)
        : null,
      contents:
        serverResource.basic_meta.contents?.map(
          (content) =>
            ({
              contentId: content.id,
              filename: content.filename,
              mimetype: content.mimetype,
              hash: content.hash,
              size: content.size ? Number(content.size) : undefined,
              createdAt: content.created_at
                ? new Date(content.created_at)
                : undefined,
              updatedAt: content.updated_at
                ? new Date(content.updated_at)
                : undefined,
            } as TContentMeta)
        ) || [],
      childResourceIds: serverResource.basic_meta?.child_resource_ids || [],
      parentResourceIds: serverResource.basic_meta?.parent_resource_ids || [],
    };

    // Adapter for client-side DetailMeta
    const serverDetailMeta = serverResource.detail_meta as TDetailMeta;
    const detailMeta = serverDetailMeta
      ? ({
          // Get all RESOURCE_TYPE specific fields as strings initially, then convert as needed
          ...serverDetailMeta,
          resourceId: serverResource.id, // Null check is already performed
          title: serverDetailMeta.title ?? null,
          description: serverDetailMeta.description ?? null,
          country: (serverDetailMeta.country = serverDetailMeta.country
            ? resolveCountryCode(serverDetailMeta.country)
            : null),
          state: serverDetailMeta.state ?? null,
          city: serverDetailMeta.city ?? null,
          latitude: isNaN(Number(serverDetailMeta.latitude))
            ? null
            : Number(serverDetailMeta.latitude),
          longitude: isNaN(Number(serverDetailMeta.longitude))
            ? null
            : Number(serverDetailMeta.longitude),
          storageLocation: serverDetailMeta.storageLocation ?? null,
          recordedDateTime: serverDetailMeta.recordedDateTime
            ? new Date(serverDetailMeta.recordedDateTime)
            : null,
        } as TDetailMeta)
      : undefined;

    // RESOURCE_TYPE-specific enhancement
    if (detailMeta) {
      applyDetailMetaEnhancement<TContentMeta, TDetailMeta>(
        resourceType,
        serverResource.basic_meta,
        basicMeta,
        detailMeta
      );
    }

    return {
      basicMeta,
      detailMeta,
    };
  }
}
