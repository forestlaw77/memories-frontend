/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module ThumbnailInjection
 * @description This module provides a utility function to extract and pre-load thumbnail data from a React Query cache into a Zustand store.
 */

import { useThumbnailStore } from "@/hooks/useThumbnailStore";
import { QueryClient } from "@tanstack/react-query";

/**
 * Injects thumbnail URLs from the React Query cache into the thumbnail store.
 *
 * This function iterates through all queries with the `["thumbnail"]` key in the
 * provided `queryClient`'s cache. It extracts the `resourceId` and the thumbnail `url`
 * from each query's state. If a thumbnail is found and is not already present in the
 * `useThumbnailStore`, it is added to a list to be preloaded. Finally, it calls the
 * `preloadThumbnails` action to update the store with the newly found thumbnails.
 *
 * @param {QueryClient} queryClient - The instance of the React Query client to inspect.
 * @example
 * ```typescript
 * import { queryClient } from './queryClient';
 * import { injectThumbnailsToStore } from './thumbnail-utility';
 *
 * // Call this function after fetching data to pre-populate the store.
 * injectThumbnailsToStore(queryClient);
 * ```
 */
export function injectThumbnailsToStore(queryClient: QueryClient) {
  const { thumbnails, preloadThumbnails } = useThumbnailStore.getState();

  const allThumbnailQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: ["thumbnail"] });

  const newThumbnails: Record<string, string> = {};

  allThumbnailQueries.forEach((query) => {
    const resourceId = query.queryKey[1] as string;
    const url = query.state.data as string;
    if (url && !thumbnails[resourceId]) {
      newThumbnails[resourceId] = url;
    }
  });

  preloadThumbnails(newThumbnails);
}
