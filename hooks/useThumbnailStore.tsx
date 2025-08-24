/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { create } from "zustand";

type ThumbnailStore = {
  thumbnails: Record<string, string>; // Blob URL
  preloadThumbnails: (initials: Record<string, string>) => void;
  getThumbnail: (resourceId: string) => string;
};

export const useThumbnailStore = create<ThumbnailStore>((set, get) => ({
  thumbnails: {},
  preloadThumbnails: (initials) => {
    set((state) => ({
      thumbnails: { ...state.thumbnails, ...initials },
    }));
  },
  getThumbnail: (resourceId) => {
    const thumbnailUrl = get().thumbnails[resourceId];
    return thumbnailUrl ? thumbnailUrl : "/images/no-thumbnail.png";
  },
}));
