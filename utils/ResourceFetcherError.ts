import { RESOURCE_TYPE } from "@/types/client/client_model";

export class ResourceFetcherError extends Error {
  constructor(
    public resourceType: RESOURCE_TYPE,
    message: string,
    public originalError?: unknown
  ) {
    super(`[ResourceFetcher] Error (${resourceType}): ${message}`);
  }
}
