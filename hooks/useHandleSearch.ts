/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { RESOURCE_TYPE } from "@/types/client/client_model";

class SearchError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "SearchError";
  }
}

export default function useHandleSearch(resourceType: RESOURCE_TYPE | null) {
  if (!resourceType) {
    return null;
  }
  return async function handleSearch<T = unknown>(
    queryParams: Record<string, string>
  ): Promise<T> {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const paramsString = params.toString();

    const url = `/api/v1/${resourceType}${
      paramsString ? `?${paramsString}` : ""
    }`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new SearchError(
          `Search failed for ${resourceType}: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new SearchError(
          `Network request failed during search for ${resourceType}: ${error.message}`,
          503
        );
      }
      if (!(error instanceof SearchError)) {
        console.error(`Unexpected error during search for ${resourceType}:`, {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw new SearchError(
          `Unexpected error occurred during search for ${resourceType}`,
          500
        );
      }
      throw error;
    }
  };
}
