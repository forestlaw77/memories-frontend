/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module ContentList
 * @description
 * This module provides a dynamic component that displays a list of contents for a specific resource,
 * handling data fetching, loading states, and error display.
 */

"use client";

import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ErrorMessage from "@/components/common/ErrorMessage";
import { GC_TIME_STANDARD, STALE_TIME_SHORT } from "@/config/time";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
//import { createFetcher } from "@/libs/api/resource_fetcher";
import { fetchResourceById, fetchThumbnailBlob } from "@/libs/api/resources";
import { recordAccess } from "@/libs/services/recordAccess";
import { createFetcher } from "@/services/api/createFetcher";
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

// Dynamically import content list components for each resource type using lazy loading.
const ListBook = lazy(() => import("@/components/resource/book/ListBook"));
const ListDocument = lazy(
  () => import("@/components/resource/document/ListDocument")
);
const ListDefault = lazy(
  () => import("@/components/resource/default/ListDefault")
);
const ListMusic = lazy(() => import("@/components/resource/music/ListMusic"));

/**
 * A map to associate resource types with their corresponding list components.
 * This allows for dynamic component rendering based on the URL parameters.
 */
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

/**
 * A client-side component for displaying a list of contents within a resource.
 *
 * This component fetches a resource and its thumbnail, and then dynamically renders
 * the appropriate list component based on the resource type. It manages data fetching
 * states, including loading and error handling, and records the resource access.
 *
 * @returns {JSX.Element} A React component that displays the content list.
 */
export default function ContentList() {
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const resourceId = params.resourceId as string;

  const { authToken, enableCache } = useFetcherParams();

  // Select the appropriate list component based on the resource type.
  const ContentListComponent = contentListMap[resourceType];
  const isContentListComponentAvailable = !!ContentListComponent;

  // Memoize the fetcher instance to prevent unnecessary re-creations.
  const fetcher = useMemo(
    () => createFetcher(resourceType, enableCache, authToken),
    [resourceType, enableCache, authToken]
  );

  // Use react-query to manage data fetching and caching for the resource.
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
    gcTime: GC_TIME_STANDARD,
    staleTime: STALE_TIME_SHORT,
  });

  // Memoize the list of contents to avoid re-calculation.
  const contents = useMemo(() => {
    if (!resourceData) return null;
    return resourceData.basicMeta.contents || null;
  }, [resourceData]);

  // Use react-query to fetch the thumbnail blob.
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
    gcTime: GC_TIME_STANDARD,
  });

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Create and revoke a URL for the thumbnail blob.
  useEffect(() => {
    if (thumbnailBlob) {
      const url = URL.createObjectURL(thumbnailBlob);
      setThumbnailUrl(url);

      // Cleanup function to release the previous URL.
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setThumbnailUrl(null);
    }
  }, [thumbnailBlob]);

  // Determine if the access should be recorded.
  const shouldRecordAccess = useMemo(
    () => contents && contents.length > 0,
    [contents]
  );

  // Record the resource access when the content list becomes available.
  useEffect(() => {
    if (shouldRecordAccess) {
      recordAccess(resourceType, resourceId);
    }
  }, [shouldRecordAccess, resourceType, resourceId]);

  // Determine the error message to display based on various conditions.
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

  // A combined loading state for a smoother user experience.
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
