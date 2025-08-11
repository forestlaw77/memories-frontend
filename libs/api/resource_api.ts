// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { STORAGE_API_URL } from "@/config/settings";
import { ContentApiResponse } from "@/types/api/api_response";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { ServerResourceMeta } from "@/types/server/server_model";

export enum RESPONSE_TYPE {
  JSON = "json",
  BLOB = "blob",
}

/**
 * Fetches resource data from the storage API.
 * Supports metadata retrieval in JSON format and binary content retrieval as Blob.
 *
 * @param {RESOURCE_TYPE} resourceType - The category of resource to fetch (e.g., images, books).
 * @param {string} [path] - The specific resource path or ID (optional).
 * @param {string} [query] - Additional query parameters for the request (optional).
 * @param {"json" | "blob"} [responseType="json"] - The expected response format.
 *                              - `"json"`: Returns a parsed JSON object.
 *                              - `"blob"`: Returns binary data as a Blob.
 *
 * @returns {Promise<any>} - A promise resolving to:
 *                              - JSON object if `responseType === "json"`
 *                              - Blob if `responseType === "blob"`
 *                              - `null` if the request fails or returns an error
 *
 * @throws {Error} - Logs errors in the console but does not throw exceptions,
 *                   returning `null` instead to prevent crashes.
 */
async function fetchResource(options: {
  resourceType: RESOURCE_TYPE;
  path?: string;
  query?: string;
  responseType?: RESPONSE_TYPE.JSON;
  cache?: RequestCache;
}): Promise<any | null>;

async function fetchResource(options: {
  resourceType: RESOURCE_TYPE;
  path?: string;
  query?: string;
  responseType: RESPONSE_TYPE.BLOB;
  cache?: RequestCache;
}): Promise<Blob | null>;

async function fetchResource(options: {
  resourceType: RESOURCE_TYPE;
  path?: string;
  query?: string;
  responseType: RESPONSE_TYPE;
  cache?: RequestCache;
}): Promise<Blob | ContentApiResponse | ServerResourceMeta[] | any | null>;

async function fetchResource({
  resourceType,
  path,
  query,
  responseType = RESPONSE_TYPE.JSON,
  cache = "default",
}: {
  resourceType: RESOURCE_TYPE;
  path?: string;
  query?: string;
  responseType?: RESPONSE_TYPE;
  cache?: RequestCache;
}): Promise<any | Blob | null> {
  const queryParams = new URLSearchParams(query);
  let url = `${STORAGE_API_URL}/${resourceType}`;
  url = path ? `${url}/${path}` : url;
  url = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
  try {
    const response = await fetch(url, {
      cache: cache,
      method: "GET",
    });

    if (!response.ok) {
      console.info(
        `API fetch error: ${response.status} ${response.statusText}`
      );
      return null; // Returns `null` on failed response to prevent errors
    }

    return responseType === RESPONSE_TYPE.JSON
      ? response.json()
      : response.blob();
  } catch (error) {
    console.error("API fetch error:", error);
    return null; // Handles errors gracefully by returning `null`
  }
}

async function postResource(resourceType: RESOURCE_TYPE, formData: FormData) {
  const apiUrl = `${STORAGE_API_URL}/${resourceType}?auto-thumbnail=true&auto-exif=true`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "API error" }));
      throw new Error(errorData?.message || "API error");
    }

    return await response.json();
  } catch (error) {
    console.error("error: Failed to POST Resource:", error);
    throw error;
  }
}

async function putResource(
  resourceType: RESOURCE_TYPE,
  id: string,
  formData: FormData
) {
  try {
    const response = await fetch(`${STORAGE_API_URL}/${resourceType}/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "APIエラー");
    }

    return response.json();
  } catch (error) {
    console.error("APIエラー", error);
  }
}

async function updateResource(
  resourceType: RESOURCE_TYPE,
  id: string,
  formData: FormData
) {
  try {
    const response = await fetch(
      `${STORAGE_API_URL}/${resourceType}/${id}?generate-thumbnail=true`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "APIエラー");
    }

    return response.json();
  } catch (error) {
    console.error("API更新エラー:", error);
    throw error;
  }
}

async function postResourceContentAddition(
  resourceType: RESOURCE_TYPE,
  id: string,
  formData: FormData
) {
  console.log(`${STORAGE_API_URL}/${resourceType}/${id}/contents`);
  try {
    const response = await fetch(
      `${STORAGE_API_URL}/${resourceType}/${id}/contents?auto-exif=true`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "APIエラー");
    }

    return response.json();
  } catch (error) {
    console.error("API登録エラー:", error);
    throw error;
  }
}

async function patchResource(
  resourceType: RESOURCE_TYPE,
  id: string,
  formData: FormData
) {
  try {
    const response = await fetch(`${STORAGE_API_URL}/${resourceType}/${id}`, {
      method: "PATCH",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "APIエラー");
    }

    return response.json();
  } catch (error) {
    console.error("API登録エラー:", error);
    throw error;
  }
}

export {
  fetchResource,
  postResource,
  postResourceContentAddition,
  putResource,
  updateResource,
};
