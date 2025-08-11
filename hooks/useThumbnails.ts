// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { Fetcher } from "@/libs/api/resource_fetcher";
import {
  ImageContentMeta,
  ImageDetailMeta,
  ResourceMeta,
} from "@/types/client/client_model";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

async function fetchThumbnailAndCreateUrl(
  fetcher: Fetcher,
  resourceId: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    const blob = await fetcher.getThumbnail({ resourceId, signal });
    if (blob) {
      return URL.createObjectURL(blob);
    }
  } catch (e: any) {
    if (e.name !== "AbortError") {
      console.warn("Thumbnail fetch failed for:", resourceId, e);
    }
  }
  throw new Error(`Failed to load thumbnail for ${resourceId}`);
}

export function useThumbnailQuery(resourceId: string, fetcher: Fetcher) {
  const queryClient = useQueryClient();

  const thumbnailQuery = useQuery({
    queryKey: ["thumbnail", resourceId],
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      fetchThumbnailAndCreateUrl(fetcher, resourceId, signal),
    enabled: !!fetcher && !!resourceId,
    staleTime: Infinity, // サムネイルは頻繁に変わらないため、無期限にキャッシュ
    gcTime: 1000 * 60 * 5, // 5分間はガーベジコレクションの対象とする
    meta: {
      resourceId: resourceId,
      type: "image-thumbnail",
    },
  });

  // Blob URL のクリーンアップ
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "removed") {
        const query = event.query;
        if (query.meta?.type !== "image-thumbnail") return;

        const resourceId = query.queryKey[1] as string;
        const thumbnailUrl = query.state.data as string | undefined;
        if (process.env.NODE_ENV === "development") {
          if (thumbnailUrl && typeof thumbnailUrl !== "string") {
            console.error(
              `Unexpected thumbnailUrl type for ${resourceId}: ${typeof thumbnailUrl}`
            );
            return;
          }
        }
        if (
          typeof thumbnailUrl === "string" &&
          thumbnailUrl.startsWith("blob:")
        ) {
          URL.revokeObjectURL(thumbnailUrl);
          // console.log(`Revoked Blob URL for ${resourceId}: ${thumbnailUrl}`); // DEBUG
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  // const thumbnailURL = useMemo(() => {
  //   if (thumbnailQuery.data) return thumbnailQuery.data;
  //   else return "/images/no-thumbnail.png";
  // }, [resourceId]);

  console.log("ThumbnailUrl:", thumbnailQuery.data);

  return {
    thumbnailUrl: thumbnailQuery.data,
    isSuccess: thumbnailQuery.isSuccess,
  };
}

export function useThumbnails(
  viewResources: ResourceMeta<ImageContentMeta, ImageDetailMeta>[],
  fetcher: Fetcher
) {
  const queryClient = useQueryClient();

  const thumbnailQueries = useQueries({
    queries: viewResources.map((resource) => {
      const resourceId = resource.basicMeta.resourceId;
      return {
        queryKey: ["thumbnailBlob", resourceId],
        queryFn: ({ signal }: { signal?: AbortSignal }) =>
          fetchThumbnailAndCreateUrl(fetcher, resourceId, signal),
        enabled: !!fetcher && !!resourceId,
        staleTime: Infinity, // サムネイルは頻繁に変わらないため、無期限にキャッシュ
        cacheTime: 1000 * 60 * 5, // 5分間はキャッシュを保持
        gcTime: 1000 * 60 * 5, // 5分間はガーベジコレクションの対象とする
        meta: {
          resourceId: resourceId,
          type: "image-thumbnail",
        },
      };
    }),
  });

  // Blob URL のクリーンアップ
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "removed") {
        const query = event.query;
        if (query.meta?.type !== "image-thumbnail") return;

        const resourceId = query.queryKey[1] as string;
        const thumbnailUrl = query.state.data as string | undefined;
        if (process.env.NODE_ENV === "development") {
          if (thumbnailUrl && typeof thumbnailUrl !== "string") {
            console.error(
              `Unexpected thumbnailUrl type for ${resourceId}: ${typeof thumbnailUrl}`
            );
            return;
          }
        }
        if (
          typeof thumbnailUrl === "string" &&
          thumbnailUrl.startsWith("blob:")
        ) {
          URL.revokeObjectURL(thumbnailUrl);
          // console.log(`Revoked Blob URL for ${resourceId}: ${thumbnailUrl}`); // DEBUG
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  const thumbnails = useMemo(() => {
    const result: { [key: string]: string } = {};
    thumbnailQueries.forEach((query, index) => {
      const resourceId = viewResources[index]?.basicMeta.resourceId;
      if (query.data && resourceId) {
        result[resourceId] = query.data;
      } else if (resourceId && query.isError) {
        result[resourceId] = "/images/no-thumbnail.png";
      }
    });
    return result;
  }, [thumbnailQueries, viewResources]);

  const isLoading = thumbnailQueries.some((query) => query.isLoading);

  return { thumbnails, isLoading };
}
