/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import ErrorMessage from "@/components/common/ErrorMessage";
import MapWithBBox from "@/components/map/MapWithBBox";
import ResourceGrid from "@/components/resource/ui/ResourceGrid";
import ResourcePagination from "@/components/resource/ui/ResourcePagination";
import { useGroupedResourcesByRegion } from "@/hooks/useGroupedResourcesByRegion";
import { useOnAction } from "@/hooks/useOnAction";
import { useResourceView } from "@/hooks/useResourceView";
import { getStateCenter } from "@/libs/services/location_utils";
import {
  ImageContentMeta,
  ImageDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import { Box, Spinner, Stack } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BulkDeleteAlert from "../BulkDeleteAlert";
import BulkEditDrawer from "../form/BulkEditDrawer";
import ResourceControls from "../resource/ui/ResourceControls";
import GenericTableView from "./GenericTableView";

const initialZoom = {
  world: 1,
  country: 3,
  state: 5,
};

const detailPathMap = {
  world: (
    resourceType: string,
    country: string | undefined,
    state: string | undefined
  ) => `/${resourceType}/map/${country}`,
  country: (
    resourceType: string,
    country: string | undefined,
    state: string | undefined
  ) => `/${resourceType}/map/${country}/${state}`,
  state: (
    resourceType: string,
    country: string | undefined,
    state: string | undefined
  ) => `/${resourceType}/map/${country}/${state}`,
};

const keyToLocationMap = {
  world: (key: string) => ({
    country: key,
    state: undefined,
    city: undefined,
  }),
  country: (key: string, country: string | undefined) => ({
    country,
    state: key,
    city: undefined,
  }),
  state: (
    key: string,
    country: string | undefined,
    state: string | undefined
  ) => ({
    country,
    state,
    city: key,
  }),
};

export default function UnifiedRegionViewMap() {
  console.debug("UnifiedRegionViewMap");
  const params = useParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const resourceType = params.resourceType as RESOURCE_TYPE;
  const [hoveredId, setHoveredId] = useState<string>("");
  const [geoResourceIds, setGeoResourceIds] = useState<string[]>([]);

  const country = params.country
    ? decodeURIComponent(params.country as string)
    : undefined;
  const state = params.state
    ? decodeURIComponent(params.state as string)
    : undefined;
  const hasCountry = typeof params.country === "string";
  const hasState = typeof params.state === "string";

  // let regionType: "world" | "country" | "state";

  // if (!hasCountry) regionType = "world";
  // else if (!hasState) regionType = "country";
  // else regionType = "state";
  const regionType: "world" | "country" | "state" = !hasCountry
    ? "world"
    : !hasState
    ? "country"
    : "state";

  const {
    allResources, // 必要であれば利用
    processedResources,
    isLoadingAllResources,
    isErrorAllResources,
    allResourcesError,
    viewResources, // processedResourcesをページネーション用に加工したもの
    setPage,
    pageSize,
    thumbnails,
    isLoadingThumbnails,
    fetcher,
    handleBoundingBoxChange,
    currentBbox,
  } = useResourceView({ resourceType, country, state }); // country/stateで初期フィルタリング

  const groupedData = useGroupedResourcesByRegion(
    processedResources as ResourceMeta<ImageContentMeta, ImageDetailMeta>[],
    regionType,
    country,
    state
  );

  const isLoadingCombined = isLoadingAllResources || isLoadingThumbnails;

  const displayError = useMemo(() => {
    if (isErrorAllResources) {
      return allResourcesError?.message || "Failed to load resources.";
    }
    if (!resourceType) {
      return "Invalid resource type.";
    }
    return null;
  }, [isErrorAllResources, allResourcesError, resourceType]);

  useEffect(() => {
    setSelectedCount(selectedIds.length);
  }, [selectedIds]);

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

  return (
    <div>
      <DynamicBreadcrumb />
      {displayError ? (
        <ErrorMessage message={displayError} />
      ) : (
        <>
          <Stack direction={{ base: "column", md: "row" }}>
            <GenericTableView
              groupedData={groupedData}
              hoveredId={hoveredId}
              detailPath={(country, state, city) =>
                detailPathMap[regionType](resourceType, country, state)
              }
              resolveKeyToParams={(key) =>
                keyToLocationMap[regionType](key, country, state)
              }
            />
            <Box
              position="relative"
              width="33%"
              _before={{
                // padding-bottom hack
                content: `""`,
                display: "block",
                paddingBottom: "56.25%", // 16:9
              }}
            >
              <MapWithBBox
                //allResources={regionFiltered}
                allResources={processedResources ?? []}
                onBoundingBoxChange={handleBoundingBoxChange}
                initialCenter={getStateCenter(country, state)}
                initialZoom={initialZoom[regionType]}
                hoveredId={hoveredId}
                setGeoResourceIds={setGeoResourceIds}
              />
            </Box>

            {isLoadingCombined && (
              <Spinner size="xl" display="block" mx="auto" my={8} />
            )}
          </Stack>
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
          <ResourceControls
            resourceType={resourceType}
            allResources={allResources}
            setPage={setPage}
            count={selectedCount}
            onAction={onAction}
          />
          <ResourcePagination
            totalCount={processedResources?.length ?? 0}
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
            geoResourceIds={geoResourceIds}
            setHoveredId={setHoveredId}
          />
        </>
      )}
    </div>
  );
}
