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
  GetContentSuccessResponse,
  UpdateResourceSuccessResponse,
  UpdateThumbnailSuccessResponse,
} from "@/types/api/api_response";
import {
  BaseContentMeta,
  BaseDetailMeta,
  BookDetailMeta,
  DocumentDetailMeta,
  ImageContentMeta,
  ImageDetailMeta,
  MusicContentMeta,
  MusicDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
  VideoDetailMeta,
} from "@/types/client/client_model";

export type Fetcher = IResourceFetcher<
  RESOURCE_TYPE,
  ImageContentMeta | BaseContentMeta | MusicContentMeta,
  | ImageDetailMeta
  | BookDetailMeta
  | DocumentDetailMeta
  | MusicDetailMeta
  | VideoDetailMeta
>;

export interface IResourceFetcher<
  TResourceType extends RESOURCE_TYPE,
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
> {
  getResourcesSummary(): Promise<{
    resourceCount: number;
    contentCount: number;
  }>;

  getResourceIds(): Promise<{ ids: string[] }>;

  getResources(
    page?: number,
    pageSize?: number
  ): Promise<{
    resources: ResourceMeta<TContentMeta, TDetailMeta>[];
    total: number;
  }>;

  getResource(
    resourceId: string
  ): Promise<ResourceMeta<TContentMeta, TDetailMeta> | null>;

  deleteResource(resourceId: string): Promise<void>;

  getContent(
    resourceId: string,
    contentId: number,
    query: Record<string, string | number | boolean>,
    dataFormat: RESPONSE_TYPE.BLOB,
    filename?: string,
    signal?: AbortSignal
  ): Promise<Blob | null>;

  getContent(
    resourceId: string,
    contentId: number,
    query: Record<string, string | number | boolean>,
    dataFormat: RESPONSE_TYPE.JSON,
    filename?: string,
    signal?: AbortSignal
  ): Promise<GetContentSuccessResponse | null>;

  getContent(
    resourceId: string,
    contentId: number,
    query: Record<string, string | number | boolean>,
    dataFormat: RESPONSE_TYPE,
    filename: string,
    signal?: AbortSignal
  ): Promise<Blob | GetContentSuccessResponse | null>;

  getThumbnail({
    resourceId,
    size,
    signal,
  }: {
    resourceId: string;
    size?: string;
    signal?: AbortSignal;
  }): Promise<Blob | null>;

  addResource(formData: FormData): Promise<AddResourceSuccessResponse>;

  updateResource(
    resourceId: string,
    formData: FormData
  ): Promise<UpdateResourceSuccessResponse>;

  addResourceContent(
    resourceId: string,
    formData: FormData
  ): Promise<AddResourceContentSuccessResponse>;

  updateThumbnail(
    resourceId: string,
    angle: number
  ): Promise<UpdateThumbnailSuccessResponse>;

  updateContentExif(
    resourceId: string,
    contentId: number,
    exif_items: Record<string, any>
  ): Promise<any>;

  getContentURL(
    resourceId: string,
    contentId: number,
    filename: string,
    query?: Record<string, string | number | boolean>
  ): string;

  getThumbnailURL(
    resourceId: string,
    query?: Record<string, string | number | boolean>
  ): string;
}
