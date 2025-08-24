/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import {
  AddResourceContentSuccessResponse,
  AddResourceSuccessResponse,
  UpdateResourceSuccessResponse,
  UpdateThumbnailSuccessResponse,
} from "@/types/api/api_response";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
//import { invoke } from "@tauri-apps/api/tauri";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import { IResourceFetcher } from "./IResourceFetcher";

export class TauriFetcher<
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

  async getResourcesSummary(): Promise<{
    resourceCount: number;
    contentCount: number;
  }> {
    console.log(`[TauriFetcher] getResourcesSummary for ${this.resourceType}`);
    return Promise.resolve({ resourceCount: 0, contentCount: 0 });
    // const apiResponse: {
    //   response_data: { resource_count: number; content_count: number };
    // } = await invoke("get_resources_summary", {
    //   resourceType: this.resourceType,
    //   authToken: this.authToken,
    // });
    // return {
    //   resourceCount: apiResponse.response_data.resource_count,
    //   contentCount: apiResponse.response_data.content_count,
    // };
  }

  async getResourceIds(): Promise<{ ids: string[] }> {
    console.log(`[TauriFetcher] getResourceIds for ${this.resourceType}`);
    return Promise.resolve({ ids: [] });
    // const apiResponse: { response_data: { ids: string[] } } = await invoke(
    //   "get_resource_ids",
    //   {
    //     resourceType: this.resourceType,
    //     authToken: this.authToken,
    //   }
    // );
    // return { ids: apiResponse.response_data.ids };
  }

  async getResources(
    page?: number,
    pageSize?: number
  ): Promise<{
    resources: ResourceMeta<TContentMeta, TDetailMeta>[];
    total: number;
  }> {
    console.log(
      `[TauriFetcher] getResources for ${this.resourceType}, page=${page}, pageSize=${pageSize}`
    );
    return Promise.resolve({ resources: [], total: 0 });
    // const apiResponse: GetResourcesSuccessResponse = await invoke(
    //   "get_resources",
    //   {
    //     resourceType: this.resourceType,
    //     page,
    //     pageSize,
    //     authToken: this.authToken,
    //   }
    // );

    // const resource_list: ServerResourceMeta[] =
    //   apiResponse.response_data?.resources || [];
    // const totalCount = apiResponse.response_data?.total_items || 0;

    // return {
    //   resources: resource_list
    //     .map((resource) =>
    //       ResourceAdapter.fromServerResource<TContentMeta, TDetailMeta>(
    //         this.resourceType,
    //         resource
    //       )
    //     )
    //     .filter(
    //       (r): r is ResourceMeta<TContentMeta, TDetailMeta> => r !== null
    //     ),
    //   total: totalCount,
    // };
  }

  async getResource(
    resourceId: string
  ): Promise<ResourceMeta<TContentMeta, TDetailMeta> | null> {
    console.log(
      `[TauriFetcher] getResource(${resourceId}) for ${this.resourceType}`
    );
    return Promise.resolve(null);
    // const apiResponse: GetResourceSuccessResponse = await invoke(
    //   "get_resource",
    //   {
    //     resourceType: this.resourceType,
    //     resourceId,
    //     authToken: this.authToken,
    //   }
    // );

    // if (!apiResponse || !apiResponse.basic_meta) {
    //   return null;
    // }

    // const serverResource: ServerResourceMeta = {
    //   id: resourceId,
    //   basic_meta: apiResponse.basic_meta,
    //   detail_meta: apiResponse.detail_meta || {},
    // };

    // const resource = ResourceAdapter.fromServerResource<
    //   TContentMeta,
    //   TDetailMeta
    // >(this.resourceType, serverResource);
    // return resource;
  }

  async deleteResource(resourceId: string): Promise<void> {
    console.log(
      `[TauriFetcher] deleteResource(${resourceId}) for ${this.resourceType}`
    );
    return Promise.resolve();
    // await invoke("delete_resource", {
    //   resourceType: this.resourceType,
    //   resourceId,
    //   authToken: this.authToken,
    // });
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
      `[TauriFetcher] getContent(${resourceId}, ${contentId}) for ${
        this.resourceType
      }, query=${JSON.stringify(
        query
      )}, dataFormat=${dataFormat}, filename=${filename}`
    );
    return Promise.resolve(null);
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
    console.log(
      `[TauriFetcher] getThumbnail(${resourceId}) for ${this.resourceType}, size=${size}`
    );
    return Promise.resolve(null);
    // Tauri では signal はサポートされていないため無視します
    // try {
    //   const apiResponse: {
    //     response_data: { content: string; mimetype: string };
    //   } = await invoke("get_thumbnail", {
    //     resourceType: this.resourceType,
    //     resourceId,
    //     size,
    //     authToken: this.authToken,
    //   });

    //   if (
    //     !apiResponse ||
    //     !apiResponse.response_data ||
    //     !apiResponse.response_data.content
    //   ) {
    //     return null;
    //   }

    //   const base64Data = apiResponse.response_data.content;
    //   const mimeType =
    //     apiResponse.response_data.mimetype || "application/octet-stream";

    //   // Base64 文字列をデコードしてバイナリデータに変換
    //   const byteCharacters = atob(base64Data);
    //   const byteNumbers = new Array(byteCharacters.length);
    //   for (let i = 0; i < byteCharacters.length; i++) {
    //     byteNumbers[i] = byteCharacters.charCodeAt(i);
    //   }
    //   const byteArray = new Uint8Array(byteNumbers);

    //   // Blob を作成して返す
    //   return new Blob([byteArray], { type: mimeType });
    // } catch (error) {
    //   console.error("Error fetching thumbnail:", error);
    //   return null;
    // }
  }

  async addResource(formData: FormData): Promise<AddResourceSuccessResponse> {
    console.log(`[TauriFetcher] addResource for ${this.resourceType}`);
    return Promise.resolve({
      status: "success",
      message: "Not implemented",
      resource_id: "",
    });
    // Tauri では FormData を直接送信できないため、必要なデータを抽出してオブジェクトに変換します
    // const entries: Record<string, any> = {};
    // formData.forEach((value, key) => {
    //   if (value instanceof File) {
    //     // ファイルの場合は Base64 エンコードして送信
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //       const base64String = (reader.result as string).split(",")[1]; // "data:*/*;base64," の部分を除去
    //       entries[key] = {
    //         filename: value.name,
    //         content: base64String,
    //         type: value.type,
    //       };
    //     };
    //     reader.readAsDataURL(value);
    //   } else {
    //     entries[key] = value;
    //   }
    // });

    // // 全てのファイルが読み込まれるまで待機
    // await new Promise((resolve) => setTimeout(resolve, 100));

    // const apiResponse: AddResourceSuccessResponse = await invoke(
    //   "add_resource",
    //   {
    //     resourceType: this.resourceType,
    //     data: entries,
    //     authToken: this.authToken,
    //   }
    // );

    // return apiResponse;
  }

  async updateResource(
    resourceId: string,
    formData: FormData
  ): Promise<UpdateResourceSuccessResponse> {
    console.log(
      `[TauriFetcher] updateResource(${resourceId}) for ${this.resourceType}`
    );
    return Promise.resolve({
      status: "success",
      message: "Not implemented",
      resource_id: resourceId,
    });
    // Tauri では FormData を直接送信できないため、必要なデータを抽出してオブジェクトに変換します
    // const entries: Record<string, any> = {};
    // formData.forEach((value, key) => {
    //   if (value instanceof File) {
    //     // ファイルの場合は Base64 エンコードして送信
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //       const base64String = (reader.result as string).split(",")[1]; // "data:*/*;base64," の部分を除去
    //       entries[key] = {
    //         filename: value.name,
    //         content: base64String,
    //         type: value.type,
    //       };
    //     };
    //     reader.readAsDataURL(value);
    //   } else {
    //     entries[key] = value;
    //   }
    // });

    // // 全てのファイルが読み込まれるまで待機
    // await new Promise((resolve) => setTimeout(resolve, 100));

    // const apiResponse: UpdateResourceSuccessResponse = await invoke(
    //   "update_resource",
    //   {
    //     resourceType: this.resourceType,
    //     resourceId,
    //     data: entries,
    //     authToken: this.authToken,
    //   }
    // );

    // return apiResponse;
  }
  async addResourceContent(
    resourceId: string,
    formData: FormData
  ): Promise<AddResourceContentSuccessResponse> {
    console.log(
      `[TauriFetcher] addResourceContent(${resourceId}) for ${this.resourceType}`
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
      `[TauriFetcher] updateThumbnail(${resourceId}, angle=${angle}) for ${this.resourceType}`
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
      `[TauriFetcher] updateContentExif(${resourceId}, ${contentId}) for ${
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
      `[TauriFetcher] getContentURL(${resourceId}, ${contentId}, ${filename}  ) for ${
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
      `[TauriFetcher] getThumbnailURL(${resourceId}) for ${
        this.resourceType
      }, query=${JSON.stringify(query)}`
    );
    return "";
  }
}
