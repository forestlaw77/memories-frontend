/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module EditResource
 * @description
 * This module provides a client-side component for editing the metadata of a single resource,
 * including its details and thumbnail.
 */

"use client";

import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import { toaster } from "@/components/common/toaster";
import EditThumbnail from "@/components/EditThumbnail";
import { ResourceEditPanel } from "@/components/form/ResourceEditPanel";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import useEditHandleSubmit from "@/hooks/useEditHandleSubmit";
import useGenerateQueryParams from "@/hooks/useGenerateQueryParams";
import useHandleSearch from "@/hooks/useHandleSearch";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { fetchResourceById } from "@/libs/api/resources";
import {
  BaseContentMeta,
  BaseDetailMeta,
  ImageDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import { formatDateTime } from "@/utils/date/formatDateTime";
import { Box, HStack, Spinner } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * A client-side component for editing a single resource.
 *
 * This component fetches a specific resource and its thumbnail, displays them for editing,
 * and handles updates to both the resource's metadata and its thumbnail rotation.
 * It uses `react-query` for data fetching and mutation management, and custom hooks
 * for form submission and search functionality.
 *
 * @returns {JSX.Element} The React component for the resource editing page.
 */
export default function EditResource() {
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const resourceId = params.resourceId as string;
  const { authToken, enableCache } = useFetcherParams();

  // Memoize the fetcher instance to avoid re-creation
  const fetcher = useMemo(
    () => createFetcher(resourceType, enableCache, authToken),
    [resourceType, enableCache, authToken]
  );

  // Use react-query to fetch resource data
  const {
    data: resource,
    isLoading: isLoadingResource,
    isError: isErrorResource,
    error: resourceError,
  } = useQuery<ResourceMeta<BaseContentMeta, BaseDetailMeta>, Error>({
    queryKey: ["resource", resourceType, resourceId],
    queryFn: async () =>
      fetchResourceById(resourceType, resourceId, authToken as string),
    enabled: !!authToken && !!resourceType && !!resourceId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // Use react-query to fetch the thumbnail blob
  const {
    data: thumbnailBlob,
    isLoading: isLoadingThumbnail,
    isError: isErrorThumbnail,
    error: thumbnailError,
  } = useQuery<Blob | null | undefined, Error>({
    queryKey: ["thumbnailBlob", resourceType, resourceId],
    queryFn: async () => {
      const blob = await fetcher?.getThumbnail({ resourceId });
      return blob;
    },
    enabled: !!fetcher && !!resourceId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 5,
  });

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Create and revoke a URL for the thumbnail blob
  useEffect(() => {
    if (thumbnailBlob) {
      const url = URL.createObjectURL(thumbnailBlob);
      setThumbnailUrl(url);

      // Cleanup function to release the previous URL
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setThumbnailUrl(null);
    }
  }, [thumbnailBlob]);

  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  // Initialize form data with resource detail metadata
  useEffect(() => {
    if (resource && resource.detailMeta) {
      const filteredData: { [key: string]: string } = {};
      Object.entries(resource.detailMeta).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          filteredData[key] = formatDateTime(value);
        }
      });
      setFormData(filteredData);
    }
  }, [resource]);

  const handleSubmit = useEditHandleSubmit(resourceType, {
    mode: "single",
    resourceId,
  });
  const handleSearch = useHandleSearch(resourceType);
  const generateQueryParams = useGenerateQueryParams(resourceType);

  // Show toasts for various loading and error states
  useEffect(() => {
    if (isErrorResource) {
      toaster.create({
        description:
          resourceError?.message || `Failed to load ${resourceType} resource.`,
        type: "error",
      });
    } else if (isErrorThumbnail) {
      toaster.create({
        description:
          thumbnailError?.message ||
          `Failed to load thumbnail for ${resourceType}.`,
        type: "error",
      });
    } else if (!isLoadingResource && !resource) {
      toaster.create({
        description: `Resource with ID ${resourceId} not found.`,
        type: "error",
      });
    }
  }, [
    isErrorResource,
    resourceError,
    isErrorThumbnail,
    thumbnailError,
    resource,
    resourceType,
    resourceId,
    isLoadingResource,
  ]);

  const isLoadingCombined = isLoadingResource || isLoadingThumbnail;

  const queryClient = useQueryClient();

  // Mutation for rotating the resource's thumbnail
  const updateThumbnailMutation = useMutation({
    mutationFn: async (angle: number) => {
      if (!fetcher) throw new Error("Fetcher not initialized.");
      await fetcher.updateThumbnail(resourceId, angle);
    },
    onSuccess: () => {
      toaster.create({
        description: "Updated thumbnail.",
        type: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["thumbnailBlob", resourceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["imageData", resourceId, 1],
      });
    },
    onError: (error) => {
      toaster.create({
        description: `Thumbnail update failed: ${error.message}`,
        type: "error",
      });
    },
  });

  /**
   * Converts a numeric EXIF orientation value to an angle in degrees.
   * @param {number} orientation - The numeric EXIF orientation value.
   * @returns {number} The corresponding angle in degrees (0, 90, 180, or 270).
   */
  function orientationToAngle(orientation: number): number {
    switch (orientation) {
      case 3:
        return 180;
      case 6:
      case 7:
        return 90;
      case 5:
      case 8:
        return 270;
      default:
        return 0; // 1, 2, 4
    }
  }

  /**
   * Converts an angle in degrees to a numeric EXIF orientation value.
   * @param {number} angle - The angle in degrees (e.g., 90, 180, 270).
   * @returns {number} The corresponding numeric EXIF orientation value.
   */
  function angleToOrientation(angle: number): number {
    switch (angle % 360) {
      case 90:
        return 6;
      case 180:
        return 3;
      case 270:
        return 8;
      default:
        return 1;
    }
  }

  // Mutation for updating the content's EXIF orientation for image resources
  const updateContentMutation = useMutation({
    mutationFn: async (angle: number) => {
      if (!fetcher) throw new Error("Fetcher not initialized.");
      const currentOrientation =
        (resource?.detailMeta as ImageDetailMeta)?.orientation ?? 1;
      const currentAngle = orientationToAngle(currentOrientation);
      const targetAngle = (currentAngle + angle + 360) % 360;
      const orientationValue = angleToOrientation(targetAngle);
      await fetcher.updateContentExif(resourceId, 1, {
        "Orientation#": orientationValue,
      });
    },
    onSuccess: () => {
      toaster.create({
        description: "Updated original Image.",
        type: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["thumbnailBlob", resourceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["imageData", resourceId, 1],
      });
    },
    onError: (error) => {
      toaster.create({
        description: `Original image update failed: ${error.message}`,
        type: "error",
      });
    },
  });

  /**
   * Handles the rotation application logic for both thumbnail and content.
   * For images, it updates the original content's EXIF data. For other types,
   * it rotates the thumbnail.
   * @param {number} angle - The angle to rotate by (e.g., 90, 180, 270).
   */
  function onApplyRotation(angle: number) {
    if (resourceType != RESOURCE_TYPE.IMAGES) {
      return updateThumbnailMutation.mutate(angle);
    } else {
      // For images, rotate the main content (contentId 1)
      return updateContentMutation.mutate(angle);
    }
  }

  const canRenderForm = handleSearch && generateQueryParams;

  return (
    <Box p={6}>
      <DynamicBreadcrumb />

      {isLoadingCombined ? (
        <Spinner size="xl" display="block" mx="auto" my={8} />
      ) : (
        <>
          <h1>{resourceType.toUpperCase()} metadata editing.</h1>
          <HStack alignItems="flex-start" gap={8} mt={6}>
            <EditThumbnail
              imageSrc={thumbnailUrl}
              onApplyRotation={async (angle) => onApplyRotation(angle)}
              isLoading={updateThumbnailMutation.isPending}
            />
            {canRenderForm && (
              <Box flexGrow={1}>
                <ResourceEditPanel
                  mode="single"
                  resourceType={resourceType}
                  resourceId={resourceId}
                  defaultValues={formData}
                  handleSubmit={handleSubmit}
                  generateQueryParams={generateQueryParams}
                  handleSearch={handleSearch}
                  isSubmitting={false}
                />
              </Box>
            )}
          </HStack>
        </>
      )}
    </Box>
  );
}
