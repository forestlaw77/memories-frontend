// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

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
export default function EditResource() {
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const resourceId = params.resourceId as string;
  const { authToken, enableCache } = useFetcherParams();

  const fetcher = useMemo(
    () => createFetcher(resourceType, enableCache, authToken),
    [resourceType, enableCache, authToken]
  );

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

  const [formData, setFormData] = useState<{ [key: string]: string }>({});
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

  function onApplyRotation(angle: number) {
    if (resourceType != RESOURCE_TYPE.IMAGES) {
      return updateThumbnailMutation.mutate(angle);
    } else {
      // 画像の場合は、代表コンテンツ(contentId 1 の画像を回転させる)
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
