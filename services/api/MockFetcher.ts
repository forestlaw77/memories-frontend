/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import {
  AddResourceContentSuccessResponse,
  AddResourceSuccessResponse,
  UpdateThumbnailSuccessResponse,
} from "@/types/api/api_response";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
} from "@/types/client/client_model";
import { IResourceFetcher } from "./IResourceFetcher";

export class MockFetcher<
  TResourceType extends RESOURCE_TYPE,
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
> implements IResourceFetcher<TResourceType, TContentMeta, TDetailMeta>
{
  constructor(private resourceType: TResourceType) {
    console.info(`[Stub] MockFetcher for ${resourceType} initialized`);
  }

  async getResourcesSummary(): Promise<{
    resourceCount: number;
    contentCount: number;
  }> {
    console.log(`[MockFetcher] getResourcesSummary for ${this.resourceType}`);
    return Promise.resolve({ resourceCount: 0, contentCount: 0 });
  }

  async getResourceIds(): Promise<{ ids: string[] }> {
    console.log(`[MockFetcher] getResourceIds for ${this.resourceType}`);
    return Promise.resolve({ ids: [] });
  }

  async getResources(
    page?: number,
    pageSize?: number
  ): Promise<{
    resources: any[];
    total: number;
  }> {
    console.log(
      `[MockFetcher] getResources for ${this.resourceType}, page=${page}, pageSize=${pageSize}`
    );
    return Promise.resolve({ resources: [], total: 0 });
  }

  async getResource(resourceId: string): Promise<any | null> {
    console.log(
      `[MockFetcher] getResource(${resourceId}) for ${this.resourceType}`
    );
    return Promise.resolve(null);
  }

  async deleteResource(resourceId: string): Promise<void> {
    console.log(
      `[MockFetcher] deleteResource(${resourceId}) for ${this.resourceType}`
    );
    return Promise.resolve();
  }

  async getContent(
    resourceId: string,
    contentId: number,
    query: Record<string, string | number | boolean>,
    dataFormat: RESPONSE_TYPE,
    filename?: string,
    signal?: AbortSignal
  ): Promise<any | null> {
    console.log(
      `[MockFetcher] getContent(${resourceId}, ${contentId}) for ${
        this.resourceType
      }, query=${JSON.stringify(
        query
      )}, dataFormat=${dataFormat}, filename=${filename}`
    );
    return Promise.resolve(null);
  }

  async getThumbnail({
    resourceId,
    size,
    signal,
  }: {
    resourceId: string;
    size?: string;
    signal?: AbortSignal;
  }): Promise<Blob | null> {
    console.log(
      `[MockFetcher] getThumbnail(${resourceId}) for ${this.resourceType}, size=${size}`
    );
    return Promise.resolve(null);
  }

  async addResource(formData: FormData): Promise<AddResourceSuccessResponse> {
    console.log(`[MockFetcher] addResource for ${this.resourceType}`);
    return Promise.resolve({
      status: "success",
      message: "Not implemented",
      resource_id: "",
    });
  }

  async updateResource(
    resourceId: string,
    formData: FormData
  ): Promise<AddResourceSuccessResponse> {
    console.log(
      `[MockFetcher] updateResource(${resourceId}) for ${this.resourceType}`
    );
    return Promise.resolve({
      status: "success",
      message: "Not implemented",
      resource_id: resourceId,
    });
  }

  async addResourceContent(
    resourceId: string,
    formData: FormData
  ): Promise<AddResourceContentSuccessResponse> {
    console.log(
      `[MockFetcher] addResourceContent(${resourceId}) for ${this.resourceType}`
    );
    return Promise.resolve({
      status: "success",
      message: "Not implemented",
      resource_id: resourceId,
      content_id: 0,
    });
  }

  async updateThumbnail(
    resourceId: string,
    angle: number
  ): Promise<UpdateThumbnailSuccessResponse> {
    console.log(
      `[MockFetcher] updateThumbnail(${resourceId}, angle=${angle}) for ${this.resourceType}`
    );
    return Promise.resolve({
      status: "success",
      message: "Not implemented",
      resource_id: resourceId,
    });
  }

  async updateContentExif(
    resourceId: string,
    contentId: number,
    exifData: Record<string, any>
  ): Promise<void> {
    console.log(
      `[MockFetcher] updateContentExif(${resourceId}, ${contentId}) for ${
        this.resourceType
      }, exifData=${JSON.stringify(exifData)}`
    );
    return Promise.resolve();
  }

  getContentURL(
    resourceId: string,
    contentId: number,
    filename: string,
    query?: Record<string, string | number | boolean>
  ): string {
    console.log(
      `[MockFetcher] getContentURL(${resourceId}, ${contentId}, ${filename}  ) for ${
        this.resourceType
      }, query=${JSON.stringify(query)}`
    );
    return "";
  }

  getThumbnailURL(
    resourceId: string,
    query?: Record<string, string | number | boolean>
  ): string {
    console.log(
      `[MockFetcher] getThumbnailURL(${resourceId}) for ${
        this.resourceType
      }, query=${JSON.stringify(query)}`
    );
    return "";
  }
}
