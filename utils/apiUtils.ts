// utils/apiUtils.ts

import { RESOURCE_TYPE } from "@/types/client/client_model";
import { ResourceFetcherError } from "@/utils/ResourceFetcherError";

export async function handleApiResponse(
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
