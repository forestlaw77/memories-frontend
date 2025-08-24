/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { ResourceAdapter } from "@/libs/adapters/resourceAdapter";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import { clientEnv } from "@/libs/config/env.client";
import {
  AddResourceContentSuccessResponse,
  AddResourceSuccessResponse,
  GetContentSuccessResponse,
  GetResourcesSuccessResponse,
  GetResourceSuccessResponse,
  UpdateResourceSuccessResponse,
  UpdateThumbnailSuccessResponse,
} from "@/types/api/api_response";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import { ServerResourceMeta } from "@/types/server/server_model";
import { buildQuery, handleApiResponse } from "@/utils/apiUtils";
import { ResourceFetcherError } from "@/utils/ResourceFetcherError";
import { IResourceFetcher } from "./IResourceFetcher";

export class BrowserFetcher<
  TResourceType extends RESOURCE_TYPE,
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
> implements IResourceFetcher<TResourceType, TContentMeta, TDetailMeta>
{
  private enableCache: boolean;
  private authToken: string | null;

  constructor(
    public resourceType: TResourceType,
    enableCache: boolean,
    authToken: string | null
  ) {
    this.enableCache = enableCache;
    this.authToken = authToken;
  }

  // private helper method
  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const baseUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/${path}`;
    const queryString = query ? buildQuery(query) : "";
    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  }

  // private helper method
  private async callApi<T>(
    method: string,
    path: string,
    query?: Record<string, string | number | boolean | undefined | null>,
    options?: Omit<RequestInit, "method" | "body">,
    body?: BodyInit | null,
    errorMessage?: string
  ): Promise<T> {
    const url = this.buildUrl(path, query);

    const defaultHeaders: { [key: string]: string } = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : {};

    // JSONボディの場合にのみContent-Typeを設定
    if (
      typeof body === "object" &&
      body !== null &&
      !(body instanceof FormData)
    ) {
      defaultHeaders["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }

    const response = await handleApiResponse(
      fetch(url, {
        method,
        headers: {
          ...defaultHeaders,
          ...options?.headers,
        },
        ...options,
        body,
      }),
      this.resourceType,
      errorMessage || `Failed to ${method} resource`
    );

    return response.json() as Promise<T>;
  }

  async getResourcesSummary(): Promise<{
    resourceCount: number;
    contentCount: number;
  }> {
    const apiResponse: any = await this.callApi(
      "GET",
      "summary",
      undefined, // queryはなし
      {}, // optionsもなし
      null, // bodyもなし
      "Failed to fetch resource summary" // エラーメッセージ
    );

    const { resource_count, content_count } = apiResponse.response_data;
    return { resourceCount: resource_count, contentCount: content_count };
  }

  async getResourceIds(): Promise<{ ids: string[] }> {
    const apiResponse: any = await this.callApi(
      "GET",
      "ids",
      undefined,
      {},
      null,
      "Failed to fetch resource IDs"
    );

    const ids: string[] = apiResponse.response_data?.resource_ids;
    return { ids: ids };
  }

  async getResources(
    page?: number,
    pageSize?: number
  ): Promise<{
    resources: ResourceMeta<TContentMeta, TDetailMeta>[];
    total: number;
  }> {
    const queryParams = { page, per_page: pageSize };
    const apiResponse = await this.callApi<GetResourcesSuccessResponse>(
      "GET",
      "", // リソースタイプ直下のエンドポイントのためパスは空
      queryParams, // ここでクエリパラメータを渡す
      {},
      null,
      "Failed to fetch resources"
    );

    const resource_list: ServerResourceMeta[] =
      apiResponse.response_data?.resources || [];
    const totalCount = apiResponse.response_data?.total_items || 0;

    return {
      resources: resource_list
        .map((resource) =>
          ResourceAdapter.fromServerResource<TContentMeta, TDetailMeta>(
            this.resourceType,
            resource
          )
        )
        .filter(
          (r): r is ResourceMeta<TContentMeta, TDetailMeta> => r !== null
        ),
      total: totalCount,
    };
  }

  async getResource(
    resourceId: string
  ): Promise<ResourceMeta<TContentMeta, TDetailMeta> | null> {
    const apiResponse: GetResourceSuccessResponse = await this.callApi(
      "GET",
      resourceId, // パスとして resourceId を渡す
      undefined, // クエリパラメータはなし
      {}, // オプションもなし
      null, // ボディもなし
      "Failed to fetch resource"
    );

    const serverResourceMeta: ServerResourceMeta = {
      id: apiResponse.resource_id,
      basic_meta: apiResponse.basic_meta,
      detail_meta: apiResponse.detail_meta,
    };

    const clientResourceMeta = ResourceAdapter.fromServerResource<
      TContentMeta,
      TDetailMeta
    >(this.resourceType, serverResourceMeta);

    return clientResourceMeta;
  }

  async deleteResource(resourceId: string): Promise<void> {
    await this.callApi(
      "DELETE",
      resourceId, // パスとして resourceId を渡す
      undefined, // クエリパラメータはなし
      {}, // オプションもなし
      null, // ボディもなし
      "Failed to delete resource"
    );
  }

  async getContent(
    resourceId: string,
    contentId: number,
    query: Record<string, string | number | boolean>,
    dataFormat: RESPONSE_TYPE.BLOB,
    filename?: string,
    signal?: AbortSignal
  ): Promise<Blob | null>;

  async getContent(
    resourceId: string,
    contentId: number,
    query: Record<string, string | number | boolean>,
    dataFormat: RESPONSE_TYPE.JSON,
    filename?: string,
    signal?: AbortSignal
  ): Promise<GetContentSuccessResponse | null>;

  async getContent(
    resourceId: string,
    contentId: number,
    query: Record<string, string | number | boolean> = { binary: true },
    dataFormat: RESPONSE_TYPE = RESPONSE_TYPE.BLOB,
    filename: string = "",
    signal?: AbortSignal
  ): Promise<Blob | GetContentSuccessResponse | null> {
    const path = filename
      ? `${resourceId}/contents/${contentId}/${filename}`
      : `${resourceId}/contents/${contentId}`;

    const builtQuery = buildQuery(query);
    const url = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${
      this.resourceType
    }/${path}${builtQuery ? `?${builtQuery}` : ""}`;

    try {
      const response = await handleApiResponse(
        fetch(url, {
          method: "GET",
          headers: {
            Authorization: this.authToken ? `Bearer ${this.authToken}` : "", // ✅ トークンを利用
          },
          cache: this.enableCache ? "force-cache" : "default",
          signal: signal,
        }),
        this.resourceType,
        "Failed to get content"
      );

      if (dataFormat === RESPONSE_TYPE.BLOB) {
        return await response.blob();
      } else {
        return await response.json();
      }
    } catch (error) {
      if (error instanceof ResourceFetcherError) {
        console.error(`[Content Fetch Error] ${error.message}`, error);
      } else {
        console.error(
          "An unexpected error occurred while fetching content:",
          error
        );
      }
      return null;
    }
  }

  async getThumbnail({
    resourceId,
    size = "medium",
    signal,
  }: {
    resourceId: string;
    size?: string;
    signal?: AbortSignal;
  }): Promise<Blob | null> {
    const query = buildQuery({ binary: true, size: size, fit: "contain" });

    const url = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${
      this.resourceType
    }/${resourceId}/thumbnail${query ? `?${query}` : ""}`;

    try {
      const response = await handleApiResponse(
        fetch(url, {
          method: "GET",
          headers: {
            Authorization: this.authToken ? `Bearer ${this.authToken}` : "",
          },
          cache: this.enableCache ? "force-cache" : "default",
          signal: signal,
        }),
        this.resourceType,
        "Failed to get thumbnail"
      );

      return await response.blob();
    } catch (error) {
      if (error instanceof ResourceFetcherError) {
        console.log(`[Thumbnail Fetch Error] ${error.message}`, error);
      } else {
        console.log(
          "An unexpected error occurred while fetching thumbnail:",
          error
        );
      }
      return null;
    }
  }

  async addResource(formData: FormData): Promise<AddResourceSuccessResponse> {
    const queryParams = { "auto-thumbnail": true, "auto-exif": true };

    const apiResponse = await this.callApi<AddResourceSuccessResponse>(
      "POST",
      "",
      queryParams,
      { headers: {} }, // FormDataを使用する場合は、Content-Typeヘッダーを明示的に設定しない
      formData,
      "Failed to POST Resource"
    );

    return apiResponse;
  }

  async updateResource(
    resourceId: string,
    formData: FormData
  ): Promise<UpdateResourceSuccessResponse> {
    const apiResponse = await this.callApi<UpdateResourceSuccessResponse>(
      "PUT",
      resourceId,
      undefined, // クエリパラメータはなし
      { headers: {} }, // オプションもなし
      formData,
      "Failed to update resource"
    );
    return apiResponse;
  }

  async addResourceContent(
    resourceId: string,
    formData: FormData
  ): Promise<AddResourceContentSuccessResponse> {
    const queryParams = { "auto-exif": true };

    const apiResponse = await this.callApi<AddResourceContentSuccessResponse>(
      "POST",
      `${resourceId}/contents`,
      queryParams,
      { headers: {} },
      formData,
      "Failed to add resource content"
    );
    return apiResponse;
  }

  async updateThumbnail(
    resourceId: string,
    angle: number
  ): Promise<UpdateThumbnailSuccessResponse> {
    const apiResponse = await this.callApi<UpdateThumbnailSuccessResponse>(
      "PATCH",
      `${resourceId}/thumbnail`,
      undefined, // クエリパラメータはなし
      {}, // オプションはなし
      JSON.stringify({ angle }), // JSONボディを直接渡す
      "Failed to update thumbnail"
    );
    return apiResponse;
  }

  async updateContentExif(
    resourceId: string,
    contentId: number,
    exif_items: Record<string, any>
  ): Promise<any> {
    const apiResponse = await this.callApi<any>(
      "PATCH",
      `${resourceId}/${contentId}/exif`,
      undefined, // クエリパラメータはなし
      {}, // オプションはなし
      JSON.stringify(exif_items), // JSONボディを直接渡す
      "Failed to update exif"
    );
    return apiResponse;
  }

  getContentURL(
    resourceId: string,
    contentId: number,
    filename: string,
    query?: Record<string, string | number | boolean>
  ): string {
    const baseUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/${resourceId}/contents/${contentId}/${filename}`;

    return query ? `${baseUrl}?${buildQuery(query)}` : baseUrl;
  }

  getThumbnailURL(
    resourceId: string,
    query?: Record<string, string | number | boolean>
  ): string {
    const baseUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/${resourceId}/thumbnails`;

    return query ? `${baseUrl}?${buildQuery(query)}` : baseUrl;
  }
}
