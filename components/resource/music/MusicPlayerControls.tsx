/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { HStack, IconButton, NativeSelect } from "@chakra-ui/react";
import React from "react";
import { BsRepeat, BsRepeat1 } from "react-icons/bs";
import {
  MdPause,
  MdPlayArrow,
  MdShuffle,
  MdSkipNext,
  MdSkipPrevious,
} from "react-icons/md";

export const MusicPlayerControls: React.FC = () => {
  const {
    isPlaying,
    shuffle,
    loop,
    togglePlayPause,
    playNextTrack,
    playPreviousTrack,
    setShuffle,
    setLoop,
    audioRef, // audioRefもcontextから取得
    effectType,
    setEffectType,
  } = useMusicPlayer();
  return (
    <>
      <HStack mt={4} justifyContent="center">
        <NativeSelect.Root>
          <NativeSelect.Field
            value={effectType}
            onChange={(e) => setEffectType(e.target.value)}
          >
            <option value="bar">Bar Effect</option>
            <option value="wave">Wave Effect</option>
          </NativeSelect.Field>
        </NativeSelect.Root>

        <IconButton
          aria-label="シャッフル"
          variant={shuffle ? "solid" : "outline"}
          onClick={() => setShuffle(!shuffle)}
        >
          <MdShuffle />
        </IconButton>
        <IconButton
          aria-label="リピート"
          variant={loop !== "none" ? "solid" : "outline"}
          onClick={() =>
            setLoop(loop === "none" ? "one" : loop === "one" ? "all" : "none")
          }
        >
          {loop === "one" ? <BsRepeat1 /> : <BsRepeat />}
        </IconButton>
        <IconButton
          aria-label="前の曲"
          variant="outline"
          onClick={playPreviousTrack}
        >
          <MdSkipPrevious />
        </IconButton>
        <IconButton
          aria-label={isPlaying ? "一時停止" : "再生"}
          variant="outline"
          onClick={togglePlayPause}
        >
          {isPlaying ? <MdPause /> : <MdPlayArrow />}
        </IconButton>
        <IconButton
          aria-label="次の曲"
          variant="outline"
          onClick={playNextTrack}
        >
          <MdSkipNext />
        </IconButton>
      </HStack>
      {/* 音楽プレイヤー本体 */}
      <audio ref={audioRef} onEnded={playNextTrack} />
    </>
  );
};
