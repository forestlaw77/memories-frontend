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
import { fetchResourceById } from "@/libs/api/resources";
import { recordAccess } from "@/libs/services/recordAccess";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
  ViewComponentProps,
} from "@/types/client/client_model";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { lazy, Suspense, useEffect, useMemo } from "react";

const ViewBook = lazy(() => import("@/components/resource/book/ViewBook"));
const ViewDocument = lazy(
  () => import("@/components/resource/document/ViewDocument")
);
const ViewImage = lazy(() => import("@/components/resource/image/ViewImage"));
const PlayMusic = lazy(() => import("@/components/resource/music/PlayMusic"));
const PlayVideo = lazy(() => import("@/components/resource/video/PlayVideo"));

const resourceViewMap: Record<
  string,
  React.ComponentType<ViewComponentProps<any>>
> = {
  books: ViewBook,
  documents: ViewDocument,
  images: ViewImage,
  music: PlayMusic,
  videos: PlayVideo,
};

export default function ViewContent() {
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const resourceId = params.resourceId as string;
  const strContentId = params.contentId as string;
  const contentId = Number(strContentId);
  const { authToken } = useFetcherParams();

  const ViewComponent = resourceViewMap[resourceType];
  const isViewComponentAvailable = !!ViewComponent;

  const fetcher = useMemo(
    () => createFetcher(resourceType, false, authToken),
    [resourceType, authToken]
  );

  const {
    data: resourceData,
    isLoading: isLoadingResource,
    isError: isErrorResource,
    error: resourceError,
  } = useQuery<ResourceMeta<BaseContentMeta, BaseDetailMeta>, Error>({
    queryKey: ["resource", resourceType, resourceId],
    queryFn: () =>
      fetchResourceById(resourceType, resourceId, authToken as string),
    enabled:
      !!authToken && !!resourceType && !!resourceId && isViewComponentAvailable,
    gcTime: 1000 * 60 * 10,
    staleTime: 1000 * 60 * 5,
  });

  const contentMeta = useMemo(() => {
    if (!resourceData) return null;
    return (
      resourceData.basicMeta.contents.find((c) => c.contentId === contentId) ||
      null
    );
  }, [resourceData, contentId]);

  const shouldRecordAccess = useMemo(() => !!contentMeta, [contentMeta]);

  useEffect(() => {
    if (shouldRecordAccess) {
      recordAccess(resourceType, resourceId, contentId);
    }
  }, [shouldRecordAccess, resourceType, resourceId, contentId]);

  const displayError = useMemo(() => {
    if (!isViewComponentAvailable) {
      return `⚠ Viewer unavailable for resource type: ${resourceType}.`;
    }
    if (isErrorResource) {
      return `❌ Resource loading failed: ${
        resourceError?.message || `Unknown error for ${resourceType}.`
      }`;
    }
    if (!isLoadingResource && resourceData && !contentMeta) {
      return `❓ Content ID ${contentId} not found in resource ${resourceId}.`;
    }
    return null;
  }, [
    isViewComponentAvailable,
    resourceType,
    isErrorResource,
    resourceError,
    isLoadingResource,
    resourceData,
    contentMeta,
    contentId,
    resourceId,
  ]);

  const isLoadingCombined =
    isLoadingResource || (!contentMeta && !displayError);

  return (
    <Box p={6}>
      <DynamicBreadcrumb />
      {displayError ? (
        <ErrorMessage message={displayError} />
      ) : isLoadingCombined ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4} fontSize="lg">
            Loading content...
          </Text>
        </Box>
      ) : (
        <Suspense
          fallback={
            <Box textAlign="center" py={10}>
              <Spinner size="xl" />
              <Text mt={4} fontSize="lg">
                Loading viewer...
              </Text>
            </Box>
          }
        >
          <ErrorBoundary>
            {contentMeta && (
              <ViewComponent
                contentMeta={contentMeta}
                resourceId={resourceId}
                contentId={contentId}
                fetcher={fetcher}
              />
            )}
          </ErrorBoundary>
        </Suspense>
      )}
    </Box>
  );
}
