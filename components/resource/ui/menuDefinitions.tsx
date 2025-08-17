/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import {
  AiOutlineEdit,
  FaMap,
  FaRandom,
  MdAdd,
  MdAddBox,
  MdCenterFocusStrong,
  MdFitScreen,
  MdNewReleases,
  MdOutlineAspectRatio,
  MdShuffle,
  PiSlideshowBold,
  RiGalleryView2,
} from "@/assets/icons";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import {
  ImageFitMode,
  SortStrategy,
  ViewMode,
} from "@/types/client/view_preferences";
import { JSX } from "react";

export type MenuItemMeta = { label: string | null; icon: JSX.Element };
export type MenuMap<T extends string | number> = Record<T, MenuItemMeta>;

const commonActions = {
  add: { label: "Add", icon: <MdAdd /> },
  bulkAdd: { label: "Bulk Add", icon: <MdAddBox /> },
  bulkEdit: { label: "Bulk Edit", icon: <AiOutlineEdit /> },
  //delete: { label: "Delete", icon: <MdDelete /> },
};

const commonViewModes = {
  [ViewMode.Grid]: { label: "Grid View", icon: <RiGalleryView2 /> },
  [ViewMode.Map]: { label: "Map View", icon: <FaMap /> },
  [ViewMode.Slide]: { label: "Slide View", icon: <PiSlideshowBold /> },
  [ViewMode.Trajectory]: { label: null, icon: <></> },
};

const commonImageFitModes = {
  [ImageFitMode.Cover]: { label: "Cover", icon: <MdOutlineAspectRatio /> },
  [ImageFitMode.Contain]: { label: "Contain", icon: <MdFitScreen /> },
};

const commonSortStrategies = {
  [SortStrategy.Newest]: { label: "Newest", icon: <MdNewReleases /> },
  [SortStrategy.Shuffle]: { label: "Shuffle", icon: <MdShuffle /> },
  [SortStrategy.Center]: {
    label: "Center Order",
    icon: <MdCenterFocusStrong />,
  },
  [SortStrategy.CenterRandom]: { label: "CN Random", icon: <FaRandom /> },
  [SortStrategy.RecordedAsc]: { label: "Recorded", icon: <MdNewReleases /> },
};

export const actionLabelMapsByResourceType: Record<
  RESOURCE_TYPE,
  Record<string, { label: string; icon: JSX.Element }>
> = {
  [RESOURCE_TYPE.BOOKS]: commonActions,
  [RESOURCE_TYPE.DOCUMENTS]: commonActions,
  [RESOURCE_TYPE.IMAGES]: commonActions,
  [RESOURCE_TYPE.MUSIC]: commonActions,
  [RESOURCE_TYPE.VIDEOS]: commonActions,
};

export const viewModeLabelMapsByResourceType: Record<
  RESOURCE_TYPE,
  MenuMap<ViewMode>
> = {
  [RESOURCE_TYPE.BOOKS]: commonViewModes,
  [RESOURCE_TYPE.DOCUMENTS]: commonViewModes,
  [RESOURCE_TYPE.IMAGES]: {
    ...commonViewModes,
    [ViewMode.Trajectory]: { label: "Trajectory View", icon: <FaMap /> },
  },
  [RESOURCE_TYPE.MUSIC]: commonViewModes,
  [RESOURCE_TYPE.VIDEOS]: commonViewModes,
};

export const imageFitModeLabelMapsByResourceType: Record<
  RESOURCE_TYPE,
  MenuMap<ImageFitMode>
> = {
  [RESOURCE_TYPE.BOOKS]: commonImageFitModes,
  [RESOURCE_TYPE.DOCUMENTS]: commonImageFitModes,
  [RESOURCE_TYPE.IMAGES]: commonImageFitModes,
  [RESOURCE_TYPE.MUSIC]: commonImageFitModes,
  [RESOURCE_TYPE.VIDEOS]: commonImageFitModes,
};

export const sortLabelMapsByResourceType: Record<
  RESOURCE_TYPE,
  MenuMap<SortStrategy>
> = {
  [RESOURCE_TYPE.BOOKS]: commonSortStrategies,
  [RESOURCE_TYPE.DOCUMENTS]: commonSortStrategies,
  [RESOURCE_TYPE.IMAGES]: commonSortStrategies,
  [RESOURCE_TYPE.MUSIC]: commonSortStrategies,
  [RESOURCE_TYPE.VIDEOS]: commonSortStrategies,
};

export function getMenuMeta<T extends string>(
  map: Record<string, Record<T, MenuItemMeta>>,
  type: string,
  key: T
) {
  return map[type]?.[key] ?? { label: null, icon: <></> };
}
