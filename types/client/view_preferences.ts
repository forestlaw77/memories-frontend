/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

export enum SortStrategy {
  Newest = "newest",
  Center = "center",
  CenterRandom = "center-random",
  Shuffle = "shuffle",
  RecordedAsc = "Recorded",
}

export enum ImageFitMode {
  Cover = "cover",
  Contain = "contain",
}

export enum ViewMode {
  Grid = "grid",
  Map = "map",
  Slide = "slide",
  Trajectory = "trajectory",
}

export enum MapZoomMode {
  Auto = "auto",
  Fixed = "fixed",
  Free = "free",
}

// export interface ViewPreferences {
//   sortStrategy: SortStrategy;
// }
