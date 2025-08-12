// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

//import { STORAGE_API_URL } from "@/config/settings";
import { ResourceAdapter } from "@/libs/adapters/ResourceAdapter";
import { clientEnv } from "@/libs/config/env.client";
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
  ResourceTypeToMetaMap,
  VideoDetailMeta,
} from "@/types/client/client_model";
import {
  ServerBasicMeta,
  ServerDetailMeta,
  ServerResourceMeta,
} from "@/types/server/server_model";
import { RESPONSE_TYPE } from "./resource_api";

export class ResourceFetcherError extends Error {
  constructor(
    public resourceType: RESOURCE_TYPE,
    message: string,
    public originalError?: unknown
  ) {
    super(`[ResourceFetcher] Error (${resourceType}): ${message}`);
  }
}

interface GetResourcesSuccessResponse {
  status: "success";
  message: string;
  response_data: {
    resources: ServerResourceMeta[];
    total_items: number;
    page: number | "all";
    per_page: number | "all";
  };
}

interface GetResourceSuccessResponse {
  status: "success";
  message: string;
  resource_id: string;
  basic_meta: ServerBasicMeta;
  detail_meta: ServerDetailMeta;
}

interface GetContentSuccessResponse {
  status: "success";
  message: string;
  resource_id: string;
  content_id: number;
  response_data: {
    content: string;
    mimetype: string;
  };
}

interface AddResourceSuccessResponse {
  status: "success";
  message: string;
  resource_id: string; // 追加されたリソースID (オプション)
}

interface UpdateResourceSuccessResponse {
  status: "success"; // 通常、成功時は "success"
  message: string;
  resource_id: string; // 更新されたリソースID (オプション)
}

interface AddResourceContentSuccessResponse {
  status: "success"; // 通常、成功時は "success"
  message: string;
  resource_id: string; // 追加されたリソースID (オプション)
  content_id: number; // 追加されたコンテンツID (オプション)
}

interface UpdateThumbnailSuccessResponse {
  status: "success";
  message: string;
  resource_id: string;
}

export class ResourceFetcher<
  TResourceType extends RESOURCE_TYPE,
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
> {
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

  async getResourcesSummary(): Promise<{
    resourceCount: number;
    contentCount: number;
  }> {
    const url = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/summary`;

    try {
      const response = await handleApiResponse(
        fetch(url, {
          method: "GET",
          headers: {
            Authorization: this.authToken ? `Bearer ${this.authToken}` : "", // ✅ トークンを利用
          },
        }),
        this.resourceType,
        "Failed to fetch resource IDs"
      );

      const apiResponse: any = await response.json();
      const { resource_count, content_count } = apiResponse.response_data;
      return { resourceCount: resource_count, contentCount: content_count };
    } catch (error) {
      throw error;
    }
  }

  async getResourceIds(): Promise<{ ids: string[] }> {
    const url = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/ids`;

    try {
      const response = await handleApiResponse(
        fetch(url, {
          method: "GET",
          headers: {
            Authorization: this.authToken ? `Bearer ${this.authToken}` : "", // ✅ トークンを利用
          },
        }),
        this.resourceType,
        "Failed to fetch resource IDs"
      );

      const apiResponse: any = await response.json();
      const ids: string[] = apiResponse.response_data?.resource_ids;
      return { ids: ids };
    } catch (error) {
      throw error;
    }
  }

  async getResources(
    page?: number,
    pageSize?: number
  ): Promise<{
    resources: ResourceMeta<TContentMeta, TDetailMeta>[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", page.toString());
    if (pageSize !== undefined) params.append("per_page", pageSize.toString());

    const queryString = params.toString();

    const url = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${
      this.resourceType
    }/${queryString ? `?${queryString}` : ""}`;

    try {
      const response = await handleApiResponse(
        fetch(url, {
          method: "GET",
          headers: {
            Authorization: this.authToken ? `Bearer ${this.authToken}` : "", // ✅ トークンを利用
          },
        }),
        this.resourceType,
        "Failed to fetch resources"
      );

      const apiResponse: GetResourcesSuccessResponse = await response.json();

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
    } catch (error) {
      throw error;
    }
  }

  async getResource(
    resourceId: string
  ): Promise<ResourceMeta<TContentMeta, TDetailMeta> | null> {
    const url = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/${resourceId}`;
    try {
      const response = await handleApiResponse(
        fetch(url, {
          method: "GET",
          headers: {
            Authorization: this.authToken ? `Bearer ${this.authToken}` : "", // ✅ トークンを利用
          },
        }),
        this.resourceType,
        "Failed to fetch resource"
      );

      const apiResponse: GetResourceSuccessResponse = await response.json();

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
    } catch (error) {
      throw error;
    }
  }

  async deleteResource(resourceId: string) {
    const url = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/${resourceId}`;
    try {
      const response = await handleApiResponse(
        fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: this.authToken ? `Bearer ${this.authToken}` : "",
          },
        }),
        this.resourceType,
        "Failed to deletee resource"
      );
    } catch (error) {
      throw error;
    }
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
    const apiUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/?auto-thumbnail=true&auto-exif=true`;

    const response = await handleApiResponse(
      fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: this.authToken ? `Bearer ${this.authToken}` : "", // ✅ トークンを利用
        },
        body: formData,
      }),
      this.resourceType,
      "Failed to POST Resource"
    );

    return await response.json();
  }

  async updateResource(
    resourceId: string,
    formData: FormData
  ): Promise<UpdateResourceSuccessResponse> {
    const apiUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/${resourceId}`;

    const response = await handleApiResponse(
      fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: this.authToken ? `Bearer ${this.authToken}` : "", // ✅ トークンを利用
        },
        body: formData,
      }),
      this.resourceType,
      "Failed to update resource"
    );

    return await response.json();
  }

  async addResourceContent(
    resourceId: string,
    formData: FormData
  ): Promise<AddResourceContentSuccessResponse> {
    const apiUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/${resourceId}/contents?auto-exif=true`;

    const response = await handleApiResponse(
      fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: this.authToken ? `Bearer ${this.authToken}` : "", // ✅ トークンを利用
        },
        body: formData,
      }),
      this.resourceType,
      "Failed to add resource content"
    );

    return await response.json();
  }

  async updateThumbnail(
    resourceId: string,
    angle: number
  ): Promise<UpdateThumbnailSuccessResponse> {
    const apiUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/${resourceId}/thumbnail`;

    const response = await handleApiResponse(
      fetch(apiUrl, {
        method: "PATCH",
        headers: {
          Authorization: this.authToken ? `Bearer ${this.authToken}` : "", // ✅ トークンを利用
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ angle }),
      }),
      this.resourceType,
      "Failed to update thumbnail"
    );

    return await response.json();
  }

  async updateContentExif(
    resourceId: string,
    contentId: number,
    exif_items: Record<string, any>
  ) {
    const apiUrl = `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/${this.resourceType}/${resourceId}/${contentId}/exif`;

    const response = await handleApiResponse(
      fetch(apiUrl, {
        method: "PATCH",
        headers: {
          Authorization: this.authToken ? `Bearer ${this.authToken}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exif_items),
      }),
      this.resourceType,
      "Failed to update exif"
    );
    return await response.json();
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

export type Fetcher = ResourceFetcher<
  RESOURCE_TYPE,
  ImageContentMeta | BaseContentMeta | MusicContentMeta,
  | ImageDetailMeta
  | BookDetailMeta
  | DocumentDetailMeta
  | MusicDetailMeta
  | VideoDetailMeta
>;

export function createFetcher<K extends RESOURCE_TYPE>(
  type: K | null,
  enableCache: boolean,
  authToken: string | null | undefined
): ResourceFetcher<
  K,
  ResourceTypeToMetaMap[K]["content"],
  ResourceTypeToMetaMap[K]["detail"]
> {
  if (!type || !authToken) {
    throw new RangeError("[createFetcher] ResourceType or authToken is null");
  }
  return new ResourceFetcher(type, enableCache, authToken);
}

export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  // Converts object to URLSearchParams string, excluding undefined/null
  return new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)])
  ).toString();
}

async function handleApiResponse(
  responsePromise: Promise<Response>,
  resourceType: RESOURCE_TYPE,
  baseMessage: string
): Promise<Response> {
  try {
    const response = await responsePromise;

    if (!response.ok) {
      let errorDetails: string = response.statusText;
      try {
        const errorJson = await response.json();
        errorDetails = errorJson.message || JSON.stringify(errorJson);
      } catch (e) {
        try {
          errorDetails = await response.text();
        } catch (textError) {
          errorDetails = response.statusText;
        }
      }
      const fullMessage = `${baseMessage} (Status: ${response.status}, Details: ${errorDetails})`;
      if (response.status === 404) {
        console.log(`[API Error] ${fullMessage}`, {
          resourceType,
          status: response.status,
          details: errorDetails,
        });
      } else {
        console.error(`[API Error] ${fullMessage}`, {
          resourceType,
          status: response.status,
          details: errorDetails,
        });
      }
      throw new ResourceFetcherError(resourceType, fullMessage, {
        status: response.status,
        details: errorDetails,
      });
    }

    return response; // 成功した Response オブジェクトをそのまま返す
  } catch (error) {
    if (error instanceof ResourceFetcherError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[Network Error] ${baseMessage} for ${resourceType}: ${errorMessage}`,
      error
    );
    throw new ResourceFetcherError(
      resourceType,
      `${baseMessage}: Network or unexpected error - ${errorMessage}`,
      error
    );
  }
}

export async function fetchResourcesByType(
  resourceType: RESOURCE_TYPE,
  authToken: string
) {
  const fetcher = createFetcher(resourceType, false, authToken);
  if (!fetcher) {
    throw new Error(`Fetcher not available for ${resourceType}`);
  }
  const { resources } = await fetcher.getResources();
  return resources;
}
