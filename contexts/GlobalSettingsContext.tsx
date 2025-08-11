// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { RESOURCE_TYPE } from "@/types/client/client_model";
import {
  ImageFitMode,
  MapZoomMode,
  SortStrategy,
  ViewMode,
} from "@/types/client/view_preferences";
import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useReducer,
} from "react";

interface BgmTrack {
  album: string;
  title: string;
  resourceId: string;
  contentId: number;
}

export interface GlobalSettingsState {
  enableCache: boolean;
  theme: string;
  itemPerPage: number;
  enableBGM: boolean;
  bgmTrack?: {
    album: string;
    title: string;
    resourceId: string;
    contentId: number;
  };
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
  fixedZoomLevel?: number; // 例: 16
  includeNearby?: boolean; // auto時の挙動制御
}

export type GlobalSettingsAction = {
  [K in keyof GlobalSettingsState]: {
    type: K;
    value: GlobalSettingsState[K];
  };
}[keyof GlobalSettingsState];

interface GlobalSettingsContextProps {
  settings: GlobalSettingsState;
  dispatch: Dispatch<GlobalSettingsAction>;
}

const GlobalSettingsContext = createContext<
  GlobalSettingsContextProps | undefined
>(undefined);

export const useGlobalSettings = () => {
  const context = useContext(GlobalSettingsContext);
  if (!context) {
    throw new Error(
      "useGlobalSettings must be used within a GlobalSettingsProvider"
    );
  }
  const { settings, dispatch } = context;

  function updateSetting<K extends keyof GlobalSettingsState>(
    key: K,
    value: GlobalSettingsState[K]
  ) {
    dispatch({ type: key, value } as GlobalSettingsAction);
  }

  return { settings, dispatch, updateSetting };
};

// サーバーサイドでの初期値として使用するデフォルト設定を定義
// localStorage が使えない環境（SSR時）のために必要
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

const settingsReducer = (
  state: GlobalSettingsState,
  action: GlobalSettingsAction
): GlobalSettingsState => {
  // Although theoretically unnecessary due to 'action: GlobalSettingsAction'
  // it forces TypeScript to narrow the type and removes the 'undefined' warning.
  if (action === null || action === undefined) {
    // This case should ideally never be reached if `dispatch` is called correctly.
    // However, it satisfies the strict TypeScript check.
    if (process.env.NODE_ENV === "development") {
      console.error("Reducer received an undefined or null action.");
    }
    return state;
  }

  const updatedState = { ...state, [action.type]: action.value };

  // クライアントサイドでのみ localStorage に保存
  if (typeof window !== "undefined") {
    try {
      persistSetting(action.type, action.value);
    } catch (e) {
      console.warn(`Failed to persist setting [${action.type}]`, e);
    }
  }

  return updatedState;
};

export const GlobalSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // useReducer の初期値を defaultInitialSettings に設定
  // これにより、SSR 時にはこのデフォルト値が使用される
  const [settings, dispatch] = useReducer(
    settingsReducer,
    undefined, // 初期値は undefined に設定
    (
      initialArg // 初期値を設定する関数を提供
    ) => {
      if (typeof window === "undefined") {
        // SSR時は defaultInitialSettings を使用
        return defaultInitialSettings;
      }
      // クライアントサイドでは、localStorage から設定をロードする
      return loadSettingsFromLocalStorage();
    }
  );

  return (
    <GlobalSettingsContext.Provider value={{ settings, dispatch }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

// export const GlobalSettingsProvider = ({ children, onInit }: { children: ReactNode; onInit?: (settings: GlobalSettingsState) => void }) => {
//   const [settings, dispatch] = useReducer(...);
//   useEffect(() => {
//     if (onInit) onInit(settings);
//   }, []);
//   ...
// };

function loadSettingsFromLocalStorage(): GlobalSettingsState {
  function safeParseJson<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined || raw === "") return fallback;
      return JSON.parse(raw);
    } catch {
      console.warn(
        `Failed to parse JSON for key "${key}". Using fallback.`
        //raw
      );
      return fallback;
    }
  }

  function safeParseNumber(key: string, fallback: number): number {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined || raw === "") return fallback;
      const num = Number(raw);
      return isNaN(num) ? fallback : num;
    } catch {
      console.warn(
        `Failed to parse number for key "${key}". Using fallback.`
        //raw
      );
      return fallback;
    }
  }

  function safeGetString(key: string, fallback: string): string {
    const raw = localStorage.getItem(key);
    return raw === null || raw === undefined || raw === "" ? fallback : raw;
  }

  // Enum (SortStrategy, ViewMode, ImageFitMode) の検証を強化
  const getEnumParsed = <T extends string>(
    key: string,
    fallback: T,
    enumObject: { [key: string]: T }
  ): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined || raw === "") return fallback;
      if (Object.values(enumObject).includes(raw as T)) {
        return raw as T;
      }
      return fallback;
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
  };
}

function persistSetting<K extends keyof GlobalSettingsState>(
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
