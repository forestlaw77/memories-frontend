// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { fetchResourceById, fetchThumbnailBlob } from "@/libs/api/resources";
import { recordAccess } from "@/libs/services/recordAccess";
import {
  BaseContentMeta,
  BaseDetailMeta,
  ContentListComponentProps,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import { Box, HStack, Spinner, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

const ListBook = lazy(() => import("@/components/resource/book/ListBook"));
const ListDocument = lazy(
  () => import("@/components/resource/document/ListDocument")
);
const ListDefault = lazy(
  () => import("@/components/resource/default/ListDefault")
);
const ListMusic = lazy(() => import("@/components/resource/music/ListMusic"));

const contentListMap: Record<
  string,
  React.ComponentType<ContentListComponentProps<any>>
> = {
  books: ListBook,
  documents: ListDocument,
  images: ListDefault,
  music: ListMusic,
  videos: ListDefault,
};

export default function ContentList() {
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const resourceId = params.resourceId as string;

  const { authToken, enableCache } = useFetcherParams();

  const ContentListComponent = contentListMap[resourceType];
  const isContentListComponentAvailable = !!ContentListComponent;

  const fetcher = useMemo(
    () => createFetcher(resourceType, enableCache, authToken),
    [resourceType, enableCache, authToken]
  );

  const {
    data: resourceData,
    isLoading: isLoadingResource,
    isError: isErrorResource,
    error: resourceError,
  } = useQuery<ResourceMeta<BaseContentMeta, BaseDetailMeta>, Error>({
    queryKey: ["resource", resourceType, resourceId],
    queryFn: async () =>
      fetchResourceById(resourceType, resourceId, authToken as string),
    enabled:
      !!authToken &&
      !!resourceType &&
      !!resourceId &&
      isContentListComponentAvailable,
    gcTime: 1000 * 60 * 10, // 10分間キャッシュ保持
    staleTime: 1000 * 60 * 5, // 5分間は stale と見なさない
  });

  const contents = useMemo(() => {
    if (!resourceData) return null;
    return resourceData.basicMeta.contents || null;
  }, [resourceData]);

  const {
    data: thumbnailBlob,
    isLoading: isLoadingThumbnail,
    isError: isErrorThumbnail,
    error: thumbnailError,
  } = useQuery<Blob | null | undefined, Error>({
    queryKey: ["thumbnailBlob", resourceType, resourceId],
    queryFn: () =>
      fetchThumbnailBlob(resourceType, resourceId, authToken as string),
    enabled: !!fetcher && !!resourceId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 24時間キャッシュ保持
  });

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (thumbnailBlob) {
      const url = URL.createObjectURL(thumbnailBlob);
      setThumbnailUrl(url);

      // クリーンアップ関数で以前の URL を解放
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setThumbnailUrl(null);
    }
  }, [thumbnailBlob]);

  const shouldRecordAccess = useMemo(
    () => contents && contents.length > 0,
    [contents]
  );

  useEffect(() => {
    if (shouldRecordAccess) {
      recordAccess(resourceType, resourceId);
    }
  }, [shouldRecordAccess, resourceType, resourceId]);

  const displayError = useMemo(() => {
    if (!isContentListComponentAvailable) {
      return `⚠ No list component available for resource type: ${resourceType}.`;
    }
    if (isErrorResource) {
      return `❌ Failed to load resource: ${
        resourceError.message || `Unknown error for ${resourceType}.`
      }`;
    }
    if (isErrorThumbnail) {
      console.warn("Failed to load thumbnail:", thumbnailError);
      return `⚠ Thumbnail for ${resourceType} failed to load.`;
    }
    return null;
  }, [
    isContentListComponentAvailable,
    resourceType,
    isErrorResource,
    resourceError,
    isErrorThumbnail,
    thumbnailError,
  ]);

  const isLoadingCombined =
    isLoadingResource || isLoadingThumbnail || (resourceData && !contents);

  return (
    <Box p={6}>
      <DynamicBreadcrumb />
      {displayError ? (
        <ErrorMessage message={displayError} />
      ) : isLoadingCombined ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4} fontSize="lg">
            Loading content list...
          </Text>
        </Box>
      ) : (
        <HStack>
          <Suspense fallback={<Spinner />}>
            <ErrorBoundary>
              {contents && (
                <ContentListComponent
                  resourceType={resourceType}
                  resourceId={resourceId}
                  thumbnailUrl={thumbnailUrl}
                  contents={contents}
                />
              )}
            </ErrorBoundary>
          </Suspense>
        </HStack>
      )}
    </Box>
  );
}
