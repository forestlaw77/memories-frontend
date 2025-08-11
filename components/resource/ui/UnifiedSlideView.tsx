// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import ResourceControls from "@/components/resource/ui/ResourceControls";
import { useOnAction } from "@/hooks/useOnAction";
import { useResourceView } from "@/hooks/useResourceView";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
} from "@/types/client/client_model";
import { Box, Button, Spinner, Text } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import ResourcePagination from "./ResourcePagination";
import ResourceSlideshow from "./ResourceSlideshow";

export default function UnifiedSlideView() {
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;

  const {
    allResources,
    isLoadingAllResources,
    processedResources,
    isErrorAllResources,
    allResourcesError,
    viewResources,
    setPage,
    pageSize,
    thumbnails,
    isLoadingThumbnails,
    fetcher,
  } = useResourceView<BaseContentMeta, BaseDetailMeta>({ resourceType });

  const onAction = useOnAction({
    resourceType,
  });

  const isLoadingCombined = isLoadingAllResources || isLoadingThumbnails;

  if (!resourceType) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" color="red.500">
          Error: Invalid resource type specified.
        </Text>
      </Box>
    );
  }

  if (isErrorAllResources) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" color="red.500">
          Failed to load resources:{" "}
          {allResourcesError?.message || "Unknown error."}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <DynamicBreadcrumb />
      <ResourceControls
        resourceType={resourceType}
        allResources={processedResources}
        setPage={(page) => setPage(page)}
        count={0}
        onAction={onAction}
      />
      {isLoadingCombined ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4} fontSize="lg">
            Loading resources...
          </Text>
        </Box>
      ) : (
        <>
          {processedResources?.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="xl" color="gray.500">
                No resources found for '{resourceType}'.
              </Text>
              <Button
                mt={4}
                colorPalette="blue"
                onClick={() => onAction("add")}
              >
                Add New {resourceType.slice(0, -1) || "Resource"}
              </Button>
            </Box>
          ) : (
            <Box>
              <ResourcePagination
                totalCount={processedResources?.length ?? 0}
                pageSize={pageSize}
                setPage={setPage}
              />
              <ResourceSlideshow
                resources={viewResources}
                resourceType={resourceType}
                thumbnails={thumbnails}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
