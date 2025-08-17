import { GlobalSettingsContextType } from "@/contexts/globalSettingsTypes";
import {
  ImageFitMode,
  MapZoomMode,
  SortStrategy,
  ViewMode,
} from "@/types/client/view_preferences";

export const mockGlobalSettingsValue: GlobalSettingsContextType = {
  settings: {
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
  },
  dispatch: () => {},
};
