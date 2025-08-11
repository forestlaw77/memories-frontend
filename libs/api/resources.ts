// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { STORAGE_API_URL } from "@/config/settings";
import {
  createFetcher,
  ResourceFetcherError,
} from "@/libs/api/resource_fetcher";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import { UserMeta } from "@/types/user/user_types"; // UserMeta の型をインポート
import { signOut } from "next-auth/react";

export async function fetchResourcesSummary(
  resourceType: RESOURCE_TYPE,
  sessionToken: string
) {
  const fetcher = createFetcher(resourceType, false, sessionToken);
  if (!fetcher) {
    throw new Error(`Fetcher not available for ${resourceType}`);
  }
  return await fetcher.getResourcesSummary();
}

export async function fetchResourceIds(
  resourceType: RESOURCE_TYPE,
  sessionToken: string
) {
  const fetcher = createFetcher(resourceType, false, sessionToken);
  if (!fetcher) {
    throw new Error(`Fetcher not available for ${resourceType}`);
  }
  const { ids } = await fetcher.getResourceIds();
  return ids;
}

/**
 * 指定されたリソースタイプとIDのリソースメタデータを取得します。
 * @param resourceType リソースのタイプ
 * @param resourceId リソースのID
 * @param authToken 認証トークン
 */
export async function fetchResourceById(
  resourceType: RESOURCE_TYPE,
  resourceId: string,
  authToken: string
): Promise<ResourceMeta<BaseContentMeta, BaseDetailMeta>> {
  const fetcher = createFetcher(resourceType, false, authToken);
  if (!fetcher) {
    throw new Error(
      `Failed to create fetcher for resource type: ${resourceType}`
    );
  }
  try {
    const resource = await fetcher.getResource(resourceId);
    if (!resource) {
      throw new Error(
        `Resource with ID ${resourceId} not found for type ${resourceType}`
      );
    }
    return resource;
  } catch (error) {
    if (error instanceof ResourceFetcherError) {
      const status = (error.originalError as { status?: number })?.status;
      if (status === 401) {
        signOut();
      }
    }
    console.error(
      `Error fetching  ${resourceType} resource ${resourceId}:`,
      error
    );
    throw error;
  }
}

/**
 * 指定されたリソースのサムネイルを取得します。
 * @param resourceType リソースのタイプ
 * @param resourceId リソースのID
 * @param sessionToken 認証トークン
 * @returns Blob または null (画像がない場合やエラーの場合)
 */
export async function fetchThumbnailBlob(
  resourceType: RESOURCE_TYPE,
  resourceId: string,
  authToken: string,
  signal?: AbortSignal
): Promise<Blob | null> {
  const fetcher = createFetcher(resourceType, false, authToken);
  if (!fetcher) {
    throw new Error(`Failed to create fetcher for thumbnail: ${resourceType}`);
  }
  try {
    const blob = await fetcher.getThumbnail({
      resourceId,
      size: "large",
      signal,
    });
    if (blob instanceof Blob) {
      return blob;
    }
    return null;
  } catch (error) {
    if (error instanceof ResourceFetcherError) {
      const status = (error.originalError as { status?: number })?.status;
      if (status === 401) {
        signOut();
      } else if (status === 404) {
        console.log(
          `Thumbnail not found for ${resourceType} resource ${resourceId}`
        );
        return null;
      }
    }
    console.error(
      `Error fetching thumbnail for ${resourceType} resource ${resourceId}:`,
      error
    );
    return null;
  }
}

// fetchUserMeta は updateLocalStorageResources.tsx から移動して利用
export async function fetchUserMeta(
  sessionToken: string
): Promise<UserMeta | null> {
  // 既存の fetchUserMeta ロジックをそのままコピー
  try {
    const response = await fetch(`${STORAGE_API_URL}/users/meta`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user meta: ${response.statusText}`);
    }
    const { response_data } = await response.json();
    return response_data;
  } catch (error) {
    console.error("Failed to fetch user meta:", error);
    throw error; // React Query はエラーをキャッチして isError を設定する
  }
}

// 各リソースタイプのリソースメタデータを取得する関数
export async function fetchAllResources<
  TContent extends BaseContentMeta = BaseContentMeta,
  TDetail extends BaseDetailMeta = BaseDetailMeta
>(
  resourceType: RESOURCE_TYPE,
  sessionToken: string
): Promise<ResourceMeta<TContent, TDetail>[]> {
  const fetcher = createFetcher(resourceType, false, sessionToken); // enableCache は React Query が管理するので false
  if (!fetcher) {
    throw new Error(
      `Failed to create fetcher for resource type: ${resourceType}`
    );
  }
  try {
    const { resources } = await fetcher.getResources();
    if (!resources || !Array.isArray(resources)) {
      throw new Error(
        `No resources found for type ${resourceType} or invalid response format`
      );
    }
    return resources as ResourceMeta<TContent, TDetail>[];
  } catch (error) {
    if (error instanceof ResourceFetcherError) {
      const status = (error.originalError as { status?: number })?.status;
      if (status === 401) {
        signOut();
      }
    }
    console.error(
      `Error fetching all resources of type ${resourceType}:`,
      error
    );
    throw error;
  }
}

export async function fetchResourcesByIds<
  TContent extends BaseContentMeta = BaseContentMeta,
  TDetail extends BaseDetailMeta = BaseDetailMeta
>(
  resourceType: RESOURCE_TYPE,
  ids: string[],
  sessionToken: string
): Promise<ResourceMeta<TContent, TDetail>[]> {
  const fetcher = createFetcher(resourceType, false, sessionToken);
  if (!fetcher) {
    throw new Error(
      `Failed to create fetcher for resource type: ${resourceType}`
    );
  }

  try {
    const resourcePromises = ids.map((id) => fetcher.getResource(id));
    const results = await Promise.allSettled(resourcePromises);

    const resources = results
      .filter(
        (r): r is PromiseFulfilledResult<ResourceMeta<TContent, TDetail>> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value);

    return resources;
  } catch (error) {
    if (error instanceof ResourceFetcherError) {
      const status = (error.originalError as { status?: number })?.status;
      if (status === 401) {
        signOut();
      }
    }
    console.error(`Error fetching ${resourceType}:`, error);
    throw error;
  }
}
