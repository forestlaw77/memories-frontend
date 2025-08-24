/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import {
  ImageFitMode,
  MapZoomMode,
  SortStrategy,
  ViewMode,
} from "@/types/client/view_preferences";
import { GlobalSettingsState } from "./globalSettingsTypes";

/**
 * Default initial settings used during SSR or when localStorage is unavailable.
 */
export const defaultInitialSettings: GlobalSettingsState = {
  enableCache: true,
  theme: "light",
  itemPerPage: 10,
  enableBGM: true,
  bgmTrack: undefined,
  bgmVolume: 0.5,
  bgmPlaylist: [],
  logoutAfterMinutes: 30,
  warningBeforeMinutes: 5,
  sortStrategy: SortStrategy.Newest,
  searchQuery: "",
  filterCountry: "",
  filterState: "",
  filterGenre: "",
  filterDateFrom: "",
  filterDateTo: "",
  viewMode: ViewMode.Grid,
  currentPage: 1,
  imageFitMode: ImageFitMode.Cover,
  filteredResourceIdsByType: null,
  mapZoomMode: MapZoomMode.Auto,
  fixedZoomLevel: 16,
  includeNearby: true,
};

/**
 * Loads global settings from localStorage with fallback to defaults.
 */
export function loadSettingsFromLocalStorage(): GlobalSettingsState {
  function safeParseJson<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      console.warn(`Failed to parse JSON for key "${key}". Using fallback.`);
      return fallback;
    }
  }

  function safeParseNumber(key: string, fallback: number): number {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const num = Number(raw);
      return isNaN(num) ? fallback : num;
    } catch {
      console.warn(`Failed to parse number for key "${key}". Using fallback.`);
      return fallback;
    }
  }

  function safeGetString(key: string, fallback: string): string {
    const raw = localStorage.getItem(key);
    return !raw ? fallback : raw;
  }

  const getEnumParsed = <T extends string>(
    key: string,
    fallback: T,
    enumObject: { [key: string]: T }
  ): T => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return Object.values(enumObject).includes(raw as T)
        ? (raw as T)
        : fallback;
    } catch {
      return fallback;
    }
  };

  return {
    enableCache: safeParseJson(
      "enableCache",
      defaultInitialSettings.enableCache
    ),
    theme: safeGetString("theme", defaultInitialSettings.theme),
    itemPerPage: safeParseNumber(
      "itemPerPage",
      defaultInitialSettings.itemPerPage
    ),
    enableBGM: safeParseJson("enableBGM", defaultInitialSettings.enableBGM),
    bgmVolume: safeParseNumber("bgmVolume", defaultInitialSettings.bgmVolume),
    bgmTrack: safeParseJson("bgmTrack", defaultInitialSettings.bgmTrack),
    bgmPlaylist: safeParseJson(
      "bgmPlaylist",
      defaultInitialSettings.bgmPlaylist
    ),
    logoutAfterMinutes: safeParseNumber(
      "logoutAfterMinutes",
      defaultInitialSettings.logoutAfterMinutes
    ),
    warningBeforeMinutes: safeParseNumber(
      "warningBeforeMinutes",
      defaultInitialSettings.warningBeforeMinutes
    ),
    sortStrategy: getEnumParsed(
      "sortStrategy",
      defaultInitialSettings.sortStrategy,
      SortStrategy
    ),
    searchQuery: safeGetString(
      "searchQuery",
      defaultInitialSettings.searchQuery
    ),
    filterCountry: safeGetString(
      "filterCountry",
      defaultInitialSettings.filterCountry
    ),
    filterState: safeGetString(
      "filterState",
      defaultInitialSettings.filterState
    ),
    filterGenre: safeGetString(
      "filterGenre",
      defaultInitialSettings.filterGenre
    ),
    filterDateFrom: safeGetString(
      "filterDateFrom",
      defaultInitialSettings.filterDateFrom
    ),
    filterDateTo: safeGetString(
      "filterDateTo",
      defaultInitialSettings.filterDateTo
    ),
    viewMode: getEnumParsed(
      "viewMode",
      defaultInitialSettings.viewMode,
      ViewMode
    ),
    currentPage: safeParseNumber(
      "currentPage",
      defaultInitialSettings.currentPage
    ),
    imageFitMode: getEnumParsed(
      "imageFitMode",
      defaultInitialSettings.imageFitMode,
      ImageFitMode
    ),
    filteredResourceIdsByType: safeParseJson(
      "filteredResourceIdsByType",
      defaultInitialSettings.filteredResourceIdsByType
    ),
    mapZoomMode: getEnumParsed(
      "mapZoomMode",
      defaultInitialSettings.mapZoomMode,
      MapZoomMode
    ),
    fixedZoomLevel: defaultInitialSettings.fixedZoomLevel,
    includeNearby: defaultInitialSettings.includeNearby,
  };
}

/**
 * Persists a single setting to localStorage.
 * Automatically stringifies non-string values.
 *
 * @param key - The setting key to persist
 * @param value - The value to store
 */
export function persistSetting<K extends keyof GlobalSettingsState>(
  key: K,
  value: GlobalSettingsState[K]
) {
  if (value === undefined || value === null || value === "") {
    localStorage.removeItem(key);
  } else if (typeof value === "string") {
    localStorage.setItem(key, value);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
