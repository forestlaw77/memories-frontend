/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { RESOURCE_TYPE } from "@/types/client/client_model";
import {
  ImageFitMode,
  MapZoomMode,
  SortStrategy,
  ViewMode,
} from "@/types/client/view_preferences";
import { Dispatch } from "react";
import { GlobalSettingsContext } from "./GlobalSettingsContext";

/**
 * Represents a single background music (BGM) track.
 */
export interface BgmTrack {
  album: string;
  title: string;
  resourceId: string;
  contentId: number;
}

/**
 * Defines the shape of the global application settings state.
 */
export interface GlobalSettingsState {
  enableCache: boolean;
  theme: string;
  itemPerPage: number;
  enableBGM: boolean;
  bgmTrack?: BgmTrack;
  bgmVolume: number;
  bgmPlaylist: BgmTrack[];
  logoutAfterMinutes: number;
  warningBeforeMinutes: number;
  sortStrategy: SortStrategy;
  searchQuery: string;
  filterCountry: string;
  filterState: string;
  filterGenre: string;
  filterDateFrom: string;
  filterDateTo: string;
  viewMode: ViewMode;
  currentPage: number;
  imageFitMode: ImageFitMode;
  filteredResourceIdsByType: { [key in RESOURCE_TYPE]?: string[] } | null;
  mapZoomMode: MapZoomMode;
  fixedZoomLevel?: number;
  includeNearby?: boolean;
}

/**
 * Represents a single action dispatched to the global settings reducer.
 * Each action updates one key in `GlobalSettingsState`.
 */
export type GlobalSettingsAction = {
  [K in keyof GlobalSettingsState]: {
    type: K;
    value: GlobalSettingsState[K];
  };
}[keyof GlobalSettingsState];

/**
 * Props provided by the `GlobalSettingsContext`.
 */
export interface GlobalSettingsContextProps {
  settings: GlobalSettingsState;
  dispatch: Dispatch<GlobalSettingsAction>;
}

/**
 * Type alias for the resolved context value of `GlobalSettingsContext`.
 */
export type GlobalSettingsContextType = React.ContextType<
  typeof GlobalSettingsContext
>;

/**
 * Utility type that extracts only string-based keys from `GlobalSettingsState`.
 * Useful for filtering operations or comparisons.
 */
type StringKeysOnly = {
  [K in keyof GlobalSettingsState]: GlobalSettingsState[K] extends string
    ? K
    : never;
}[keyof GlobalSettingsState];
