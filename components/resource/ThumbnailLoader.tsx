/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { useThumbnailQuery } from "@/hooks/useThumbnails";
import { useThumbnailStore } from "@/hooks/useThumbnailStore";
import { createFetcher } from "@/services/api/createFetcher";
//import { createFetcher } from "@/libs/api/resource_fetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { useEffect, useMemo } from "react";

export default function ThumbnailLoader({
  resourceType,
  resourceId,
}: {
  resourceType: RESOURCE_TYPE;
  resourceId: string;
}): null {
  const { authToken, enableCache } = useFetcherParams();
  const fetcher = useMemo(
    () => createFetcher(resourceType, enableCache, authToken),
    [resourceType, authToken]
  );
  const { thumbnailUrl, isSuccess } = useThumbnailQuery(resourceId, fetcher);
  const preloadThumbnails = useThumbnailStore((s) => s.preloadThumbnails);

  useEffect(() => {
    if (isSuccess && thumbnailUrl) {
      preloadThumbnails({ [resourceId]: thumbnailUrl });
    }
  }, [isSuccess, thumbnailUrl, resourceId, preloadThumbnails]);

  return null; // 表示は別コンポーネントで
}
