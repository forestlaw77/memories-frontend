/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GC_TIME_STANDARD, STALE_TIME_SHORT } from "@/config/time";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { fetchAllResources } from "@/libs/api/resources";
import { createFetcher } from "@/services/api/createFetcher";
import {
  BaseContentMeta,
  BaseDetailMeta,
  MusicDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import { SortStrategy } from "@/types/client/view_preferences";
import { BoundingBox } from "@/types/maps";
import { useFilteredByBBoxResources } from "./useFilteredByBBoxResources";
import { useThumbnails } from "./useThumbnails";

interface UseResourceViewParams {
  resourceType: RESOURCE_TYPE;
  country?: string;
  state?: string;
  sortStrategy?: SortStrategy;
}

interface ResourceViewResult<
  TContent extends BaseContentMeta,
  TDetail extends BaseDetailMeta
> {
  allResources: ResourceMeta<TContent, TDetail>[] | undefined;
  processedResources: ResourceMeta<TContent, TDetail>[] | undefined;
  isLoadingAllResources: boolean;
  isErrorAllResources: boolean;
  allResourcesError: Error | null;
  viewResources: ResourceMeta<TContent, TDetail>[];
  setPage: (page: number) => void;
  pageSize: number;
  thumbnails: { [key: string]: string };
  isLoadingThumbnails: boolean;
  fetcher: ReturnType<typeof createFetcher>;
  handleBoundingBoxChange: (bbox: BoundingBox) => void;
  currentBbox: BoundingBox | null; // 現在のbboxの状態を公開
}

export function useResourceView<
  TContent extends BaseContentMeta = BaseContentMeta,
  TDetail extends BaseDetailMeta = BaseDetailMeta
>({
  resourceType,
  country,
  state,
  sortStrategy,
}: UseResourceViewParams): ResourceViewResult<TContent, TDetail> {
  const { settings, updateSetting } = useGlobalSettings();
  const [requestedPage, setRequestedPage] = useState(settings.currentPage || 1);
  const { authToken, enableCache } = useFetcherParams();
  const pageSize = settings.itemPerPage || 20;
  const currentPage = settings.currentPage || 1;
  const [bbox, setBbox] = useState<BoundingBox | null>(null);

  const fetcher = useMemo(
    () => createFetcher(resourceType, enableCache, authToken),
    [resourceType, enableCache, authToken]
  );

  const {
    data: allResources,
    isLoading: isLoadingAllResources,
    isError: isErrorAllResources,
    error: allResourcesError,
  } = useQuery({
    queryKey: ["allResources", resourceType],
    queryFn: () =>
      fetchAllResources<TContent, TDetail>(resourceType, authToken!),
    enabled: !!authToken && !!resourceType,
    staleTime: STALE_TIME_SHORT,
    gcTime: GC_TIME_STANDARD,
  });

  /**
   * Filter: Normal -> Filtered
   */

  const FilteredResources = useMemo(() => {
    if (!allResources) {
      return [];
    }

    const hasFilter =
      country ||
      state ||
      settings.filterCountry ||
      settings.filterDateFrom ||
      settings.filterDateTo ||
      (resourceType === RESOURCE_TYPE.MUSIC && settings.filterGenre);

    if (!hasFilter) {
      return allResources;
    }

    const filterCountry = country || settings.filterCountry;
    const filterState = state;
    const filterGenre = settings.filterGenre.toLocaleLowerCase();
    const filterDateFrom = settings.filterDateFrom
      ? new Date(settings.filterDateFrom)
      : undefined;
    const filterDateTo = settings.filterDateTo
      ? new Date(settings.filterDateTo)
      : undefined;

    return allResources.filter((resource) => {
      const detailMeta = resource.detailMeta;
      if (!detailMeta) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `resource(${resource.basicMeta.resourceId}) has not detail metadata.`
          );
        }
        return false;
      }
      // if (
      //   detailMeta.latitude === null ||
      //   detailMeta.longitude === null ||
      //   isNaN(detailMeta.latitude) ||
      //   isNaN(detailMeta.longitude)
      // ) {
      //   return false;
      // }

      // region filter
      if (filterCountry) {
        const country = detailMeta.country || "Unknown";
        const state = detailMeta.state || "Unknown";
        if (filterCountry !== country) return false;

        if (filterState) {
          if (filterState !== state) return false;
        }
      }

      // date filter
      const recordedDateTime = detailMeta.recordedDateTime;
      if ((filterDateFrom || filterDateTo) && !recordedDateTime) {
        if (process.env.NODE_ENV === "development") {
          console.log(detailMeta?.title);
        }
        return false;
      }
      if (
        filterDateFrom &&
        recordedDateTime &&
        recordedDateTime < filterDateFrom
      ) {
        return false;
      }
      if (filterDateTo && recordedDateTime && recordedDateTime > filterDateTo) {
        return false;
      }

      // RESOURCE_TYPE specific filters
      switch (resourceType) {
        case RESOURCE_TYPE.BOOKS:
          break;
        case RESOURCE_TYPE.DOCUMENTS:
          break;
        case RESOURCE_TYPE.IMAGES:
          break;
        case RESOURCE_TYPE.MUSIC:
          const musicDetailMeta = detailMeta as MusicDetailMeta;
          const genre = musicDetailMeta.genre
            ? musicDetailMeta.genre.toLowerCase()
            : undefined;
          if (filterGenre && genre !== filterGenre) return false;
          break;
        case RESOURCE_TYPE.VIDEOS:
          break;
      }

      return true;
    });
  }, [
    allResources,
    settings.filterCountry,
    settings.filterDateFrom,
    settings.filterDateTo,
    settings.filterGenre,
  ]);

  // bbox filter
  const filteredByBBox = useFilteredByBBoxResources(FilteredResources, bbox);

  /**
   * Search: Filtered -> Filter and searched
   */
  const filteredAndSearchedResources = useMemo(() => {
    const searchQuery = settings.searchQuery;
    if (!searchQuery) return filteredByBBox;

    return filteredByBBox.filter((resource) => {
      const detailMeta = resource.detailMeta;
      if (!detailMeta) return false;
      const title = detailMeta.title;
      const description = detailMeta.description;

      if (title && title.toLowerCase().includes(searchQuery.toLowerCase()))
        return true;
      if (
        description &&
        description.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return true;
      return false;
    });
  }, [filteredByBBox, settings.searchQuery]);

  /**
   * Sort: Filter and Searched -> Filter and Searched and Sorted
   */
  const processedResources = useMemo(() => {
    if (!filteredAndSearchedResources) {
      return [];
    }
    const finalSortStrategy: string = sortStrategy
      ? sortStrategy
      : settings.sortStrategy ?? SortStrategy.Newest;
    switch (finalSortStrategy) {
      case SortStrategy.Newest:
        return [...filteredAndSearchedResources].sort((a, b) => {
          const dateA = a.basicMeta.createdAt?.getTime();
          const dateB = b.basicMeta.createdAt?.getTime();
          if (dateB === undefined && dateA !== undefined) {
            return -1;
          }
          if (dateA === undefined && dateB !== undefined) {
            return 1;
          }
          return (dateB ?? 0) - (dateA ?? 0);
        });
      case SortStrategy.Shuffle:
        return [...filteredAndSearchedResources].sort(
          () => Math.random() - 0.5
        );
      case SortStrategy.RecordedAsc:
        return [...filteredAndSearchedResources].sort((a, b) => {
          const dateA = a.detailMeta?.recordedDateTime?.getTime?.();
          const dateB = b.detailMeta?.recordedDateTime?.getTime?.();
          if (dateB === undefined && dateA !== undefined) {
            return -1;
          }
          if (dateA === undefined && dateB !== undefined) {
            return 1;
          }
          return (dateA ?? 0) - (dateB ?? 0);
        });
      default:
        return filteredAndSearchedResources;
    }
  }, [filteredAndSearchedResources, settings.sortStrategy]);

  const currentResources = useMemo(() => {
    return processedResources?.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [processedResources, currentPage, pageSize]);

  const nextResources = useMemo(() => {
    return processedResources?.slice(
      (requestedPage - 1) * pageSize,
      requestedPage * pageSize
    );
  }, [processedResources, requestedPage, pageSize]);

  const { thumbnails, isLoading: isLoadingThumbnails } = useThumbnails(
    nextResources,
    fetcher
  );

  useEffect(() => {
    // nextResourcesのサムネイルが全てロードされたらcurrentPageを更新
    if (!isLoadingThumbnails && requestedPage !== currentPage) {
      //setCurrentPage(requestedPage);
      updateSetting("currentPage", requestedPage);
      // dispatch({
      //   type: "currentPage",
      //   value: requestedPage,
      // });
    }
  }, [isLoadingThumbnails, requestedPage, updateSetting]); // currentPage

  // バウンディングボックスの変更ハンドラ
  const handleBoundingBoxChange = useCallback((newBBox: BoundingBox) => {
    setBbox(newBBox); // bboxを更新
    updateSetting("currentPage", 1);
  }, []);

  return {
    allResources,
    processedResources,
    isLoadingAllResources,
    isErrorAllResources,
    allResourcesError,
    viewResources: currentResources,
    setPage: setRequestedPage,
    pageSize,
    thumbnails,
    isLoadingThumbnails,
    fetcher,
    handleBoundingBoxChange,
    currentBbox: bbox,
  };
}
