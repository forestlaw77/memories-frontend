/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { fetchAllResources } from "@/libs/api/resources";
import { sampleNearBBoxCenter, sortByBBoxCenter } from "@/libs/sortUtils";
import {
  ImageContentMeta,
  ImageDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import { SortStrategy } from "@/types/client/view_preferences";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useFilteredByBBoxResources } from "./useFilteredByBBoxResources";
import { useRegionFilteredResources } from "./useRegionFilteredResources";
import { useThumbnails } from "./useThumbnails";

interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

interface UseMapViewResourcesParams {
  resourceType: RESOURCE_TYPE;
  country?: string; // 国フィルタ
  state?: string; // 州フィルタ
}

interface MapViewResourceResult {
  allResources: ResourceMeta<ImageContentMeta, ImageDetailMeta>[] | undefined;
  isLoadingAllResources: boolean;
  isErrorAllResources: boolean;
  allResourcesError: Error | null;
  regionFilteredResources: ResourceMeta<ImageContentMeta, ImageDetailMeta>[]; // 初期フィルタ適用後
  filteredResources: ResourceMeta<ImageContentMeta, ImageDetailMeta>[]; // bboxフィルタ適用後
  viewResources: ResourceMeta<ImageContentMeta, ImageDetailMeta>[]; // ページネーション適用後
  totalCount: number;
  setPage: (page: number) => void;
  pageSize: number;
  thumbnails: { [key: string]: string };
  isLoadingThumbnails: boolean;
  fetcher: ReturnType<typeof createFetcher> | undefined;
  handleBoundingBoxChange: (bbox: BoundingBox) => void;
  currentBbox: BoundingBox | null; // 現在のbboxの状態を公開
}

export function useMapViewResources({
  resourceType,
  country,
  state,
}: UseMapViewResourcesParams): MapViewResourceResult {
  const [bbox, setBbox] = useState<BoundingBox | null>(null);
  const { settings, dispatch } = useGlobalSettings();
  const [page, setPage] = useState(settings.currentPage || 1);
  const { authToken, enableCache } = useFetcherParams();
  const pageSize = settings.itemPerPage;

  const fetcher = useMemo(
    () => createFetcher(resourceType, enableCache, authToken),
    [resourceType, enableCache, authToken]
  );

  const {
    data: allResources = [],
    isLoading: isLoadingAllResources,
    isError: isErrorAllResources,
    error: allResourcesError,
  } = useQuery<ResourceMeta<ImageContentMeta, ImageDetailMeta>[], Error>({
    queryKey: ["allResources", resourceType],
    queryFn: () => fetchAllResources(resourceType, authToken as string),
    enabled: !!resourceType && !!authToken,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  const regionFiltered = useRegionFilteredResources(
    allResources,
    country,
    state
  );
  const filteredByBBox = useFilteredByBBoxResources(regionFiltered, bbox);
  const totalCount = filteredByBBox.length;

  const sortedResources = useMemo(() => {
    switch (settings.sortStrategy) {
      case SortStrategy.Newest:
        return [...filteredByBBox].sort((a, b) => {
          const dateA = a.basicMeta?.createdAt?.getTime();
          const dateB = b.basicMeta?.createdAt?.getTime();
          if (dateB === undefined && dateA !== undefined) {
            return -1;
          }
          if (dateA === undefined && dateB !== undefined) {
            return 1;
          }
          return (dateB ?? 0) - (dateA ?? 0);
        });
      case SortStrategy.Shuffle:
        return [...filteredByBBox].sort(() => Math.random() - 0.5);
      case SortStrategy.Center:
        return bbox ? sortByBBoxCenter(filteredByBBox, bbox) : filteredByBBox;
      case SortStrategy.CenterRandom:
        return bbox
          ? sampleNearBBoxCenter(filteredByBBox, bbox, pageSize * 2)
          : filteredByBBox;
      case SortStrategy.RecordedAsc:
        return [...filteredByBBox].sort((a, b) => {
          const dateA = a.detailMeta?.recordedDateTime?.getTime?.();
          const dateB = b.detailMeta?.recordedDateTime?.getTime?.();
          if (dateB === undefined && dateA !== undefined) {
            return -1;
          }
          if (dateA === undefined && dateB !== undefined) {
            return 1;
          }
          return (dateB ?? 0) - (dateA ?? 0);
        });
      default:
        return filteredByBBox;
    }
  }, [filteredByBBox, bbox, settings.sortStrategy, pageSize]);

  const viewResources = useMemo(() => {
    return sortedResources.slice((page - 1) * pageSize, page * pageSize);
  }, [sortedResources, page, pageSize]);

  const { thumbnails, isLoading: isLoadingThumbnails } = useThumbnails(
    viewResources,
    fetcher
  );

  // バウンディングボックスの変更ハンドラ
  const handleBoundingBoxChange = useCallback((newBBox: BoundingBox) => {
    if (filteredByBBox.length === 0) {
      // bboxに一致するマーカーがないとき、地図をリセットしないよう制御
      return;
    }
    setBbox(newBBox); // bboxを更新
    setPage(1); // bboxが変わったらページをリセット
    dispatch({
      type: "currentPage",
      value: 1,
    });
  }, []);

  const router = useRouter();

  return {
    allResources,
    isLoadingAllResources,
    isErrorAllResources,
    allResourcesError,
    regionFilteredResources: regionFiltered,
    filteredResources: filteredByBBox,
    viewResources,
    totalCount,
    setPage: setPage,
    pageSize,
    thumbnails,
    isLoadingThumbnails,
    fetcher,
    handleBoundingBoxChange,
    currentBbox: bbox,
  };
}
