/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module ViewContent
 * @description
 * This module dynamically renders a viewer component for a specific resource content,
 * handling data fetching, loading states, and error display.
 */

"use client";

import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ErrorMessage from "@/components/common/ErrorMessage";
import { GC_TIME_STANDARD, STALE_TIME_SHORT } from "@/config/time";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { fetchResourceById } from "@/libs/api/resources";
import { recordAccess } from "@/libs/services/recordAccess";
import { createFetcher } from "@/services/api/createFetcher";
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

// Dynamically import viewer components for each resource type using lazy loading.
const ViewBook = lazy(() => import("@/components/resource/book/ViewBook"));
const ViewDocument = lazy(
  () => import("@/components/resource/document/ViewDocument")
);
const ViewImage = lazy(() => import("@/components/resource/image/ViewImage"));
const PlayMusic = lazy(() => import("@/components/resource/music/PlayMusic"));
const PlayVideo = lazy(() => import("@/components/resource/video/PlayVideo"));

/**
 * A map to associate resource types with their corresponding React components.
 * This allows for dynamic component rendering based on the URL parameters.
 */
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

export type ViewContentProps = {};

/**
 * A client-side component for viewing specific resource content.
 *
 * This component fetches a resource by its ID and a specific content item within it.
 * It handles various states including loading, errors, and missing content.
 * It also dynamically renders the appropriate viewer component (e.g., for images,
 * videos, or books) and records the content access for analytics.
 *
 * @returns {JSX.Element} A React component for viewing content.
 */
export default function ViewContent(props: ViewContentProps) {
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const resourceId = params.resourceId as string;
  const strContentId = params.contentId as string;
  const contentId = Number(strContentId);
  const { authToken } = useFetcherParams();

  // Select the appropriate viewer component based on the resource type.
  const ViewComponent = resourceViewMap[resourceType];
  const isViewComponentAvailable = !!ViewComponent;

  // Memoize the fetcher instance to prevent unnecessary re-creations.
  const fetcher = useMemo(
    () => createFetcher(resourceType, false, authToken),
    [resourceType, authToken]
  );

  // Use react-query to manage data fetching and caching for the resource.
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
    gcTime: GC_TIME_STANDARD,
    staleTime: STALE_TIME_SHORT,
  });

  // Memoize the specific content metadata to avoid re-calculating it.
  const contentMeta = useMemo(() => {
    if (!resourceData) return null;
    return (
      resourceData.basicMeta.contents.find((c) => c.contentId === contentId) ||
      null
    );
  }, [resourceData, contentId]);

  // Determine if the access should be recorded based on whether the content metadata is available.
  const shouldRecordAccess = useMemo(() => !!contentMeta, [contentMeta]);

  // Record the content access when the content metadata becomes available.
  useEffect(() => {
    if (shouldRecordAccess) {
      recordAccess(resourceType, resourceId, contentId);
    }
  }, [shouldRecordAccess, resourceType, resourceId, contentId]);

  // Determine the error message to display based on various conditions.
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

  // A combined loading state for a smoother user experience.
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
