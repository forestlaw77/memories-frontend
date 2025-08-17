/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import BulkDeleteAlert from "@/components/BulkDeleteAlert";
import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import BulkEditDrawer from "@/components/form/BulkEditDrawer";
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
import { useEffect, useState } from "react";
import ResourceGrid from "./ResourceGrid";
import ResourcePagination from "./ResourcePagination";

export default function UnifiedGridView() {
  console.debug("UnifiedGridView");
  const params = useParams();
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setSelectedCount(selectedIds.length);
  }, [selectedIds]);

  const {
    allResources,
    processedResources,
    isLoadingAllResources,
    isErrorAllResources,
    allResourcesError,
    viewResources,
    setPage,
    pageSize,
    thumbnails,
    isLoadingThumbnails,
    fetcher,
  } = useResourceView<BaseContentMeta, BaseDetailMeta>({ resourceType });

  function selectedToggle(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((otherId) => otherId != id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function selectAllToggle() {
    if (selectedIds.length === viewResources.length) {
      // 全て選択されている場合は、全解除
      setSelectedIds([]);
    } else {
      // 全て選択されていない場合は、viewResourcesのすべてのIDを選択
      const allResourceIds = viewResources.map(
        (resource) => resource.basicMeta.resourceId
      );
      setSelectedIds(allResourceIds);
    }
  }

  const onAction = useOnAction({
    resourceType,
    setIsEditOpen,
    setIsDeleteOpen,
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
        count={selectedCount}
        onAction={onAction}
      />
      <BulkEditDrawer
        isOpen={isEditOpen}
        onOpenChange={() => setIsEditOpen(false)}
        resourceType={resourceType}
        selectedIds={selectedIds}
      />
      <BulkDeleteAlert
        isOpen={isDeleteOpen}
        resourceType={resourceType}
        selectedIds={selectedIds}
        onOpenChange={() => setIsDeleteOpen(false)}
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
                totalCount={processedResources?.length || 0}
                pageSize={pageSize}
                setPage={setPage}
              />
              <ResourceGrid
                resources={viewResources}
                resourceType={resourceType}
                thumbnails={thumbnails}
                selectedIds={selectedIds}
                onToggle={selectedToggle}
                selectAllToggle={selectAllToggle}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
