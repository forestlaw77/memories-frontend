/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { MusicContentMeta } from "@/types/client/client_model";
import { createContext, useContext } from "react";

// Contextの型定義
interface MusicPlayerContextType {
  currentPlaybackIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  loop: "none" | "one" | "all";
  shuffledPlayOrder: number[];
  contents: MusicContentMeta[];
  audioRef: React.RefObject<HTMLAudioElement | null>;
  togglePlayPause: () => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  setShuffle: (shuffle: boolean) => void;
  setLoop: (loop: "none" | "one" | "all") => void;
  setCurrentPlaybackIndex: (index: number) => void; // トラックリストから再生するために必要
  setIsPlaying: (playing: boolean) => void; // トラックリストから再生するために必要
  effectType: string;
  setEffectType: (effectType: string) => void;
}

// Contextの作成
export const MusicPlayerContext = createContext<
  MusicPlayerContextType | undefined
>(undefined);

// カスタムフックでContextを使用
export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};
