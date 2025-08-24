/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

//import { STORAGE_API_URL } from "@/config/settings";
import { createFetcher } from "@/services/api/createFetcher";
import { RESOURCE_TYPE, ResourceMetaMap } from "@/types/client/client_model";
import { UserMeta } from "@/types/user/user_types";
import { clientEnv } from "../config/env.client";
//import { createFetcher } from "../api/resource_fetcher";

/**
 * Fetches the user's metadata from the storage API.
 *
 * @returns {Promise<UserMeta | null>} A promise that resolves to the user's metadata, or `null` if the fetch fails.
 */
export async function fetchUserMeta(
  sessionToken: string | null
): Promise<UserMeta | null> {
  console.log("[fetchUserMeta] sessionToken:", sessionToken);
  try {
    if (!sessionToken) {
      console.error("session error");
    }
    const response = await fetch(
      `${clientEnv.NEXT_PUBLIC_BACKEND_API_URL}/users/meta`,
      {
        method: "GET",
        headers: {
          Authorization: sessionToken ? `Bearer ${sessionToken}` : "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const { response_data } = await response.json();
    return response_data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch user meta:", error.message);
    } else {
      console.error("Unexpected error while fetching user meta:", error);
    }
    return null;
  }
}

/**
 * Updates local storage resources based on changes detected in the server metadata.
 *
 * @param {RESOURCE_TYPE[]} resourceTypes - An array of resource types to update. If empty, all resource types are checked.
 */
export async function updateLocalStorageResources(
  resourceTypes: RESOURCE_TYPE[] = [],
  sessionToken: string | null | undefined
) {
  console.log("[updateLocalStorageResources] sessionToken:", sessionToken);
  if (!sessionToken) {
    console.error("session error");
    return;
  }
  const cachedMeta = JSON.parse(localStorage.getItem("userMeta") || "{}");
  const cachedResources = cachedMeta.resources || {};
  const serverMeta = await fetchUserMeta(sessionToken);
  if (!serverMeta) return;

  /**
   * Determines which resource types require updates by comparing server and cached metadata.
   */
  const updatedTypes: RESOURCE_TYPE[] = (
    resourceTypes.length
      ? resourceTypes
      : (Object.keys(serverMeta.resources) as RESOURCE_TYPE[])
  ).filter((type) => cachedResources[type] !== serverMeta.resources[type]);

  if (updatedTypes.length === 0) {
    console.log("No updates needed, skipping localStorage updates.");
    return;
  }

  /**
   * Stores updated resources fetched from the server.
   */
  const newResources: ResourceMetaMap = {
    [RESOURCE_TYPE.BOOKS]: [],
    [RESOURCE_TYPE.DOCUMENTS]: [],
    [RESOURCE_TYPE.IMAGES]: [],
    [RESOURCE_TYPE.MUSIC]: [],
    [RESOURCE_TYPE.VIDEOS]: [],
  };
  await Promise.all(
    updatedTypes.map(async (type) => {
      const fetcher = createFetcher(type, false, sessionToken);
      if (!fetcher) return;

      try {
        const { resources } = await fetcher.getResources();
        resources.forEach((clientResource) => {
          if (!clientResource) return;
          if (Array.isArray(newResources[type])) {
            (newResources[type] as typeof resources).push(clientResource);
          }
        });
      } catch (error) {
        console.error(`Failed to fetch resources for ${type}:`, error);
      }
    })
  );

  /**
   * Updates the local storage with the latest user metadata from the server.
   */
  localStorage.setItem("userMeta", JSON.stringify(serverMeta));

  /**
   * Updates only the resource types that were modified.
   */
  Object.entries(newResources).forEach(([resourceType, data]) => {
    if (
      updatedTypes.includes(resourceType as RESOURCE_TYPE) &&
      data.length > 0
    ) {
      localStorage.setItem(resourceType, JSON.stringify(data));
    }
  });
}
