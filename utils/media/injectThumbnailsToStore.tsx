// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { useThumbnailStore } from "@/hooks/useThumbnailStore";
import { QueryClient } from "@tanstack/react-query";

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
