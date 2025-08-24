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

import { toaster } from "@/components/common/toaster";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { MusicPlayerContext } from "@/contexts/MusicPlayerContext";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import { createFetcher } from "@/services/api/createFetcher";
//import { createFetcher } from "@/libs/api/resource_fetcher";
import { MusicContentMeta, RESOURCE_TYPE } from "@/types/client/client_model";
import { shuffleArray } from "@/utils/array/shuffleArray";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface MusicPlayerProviderProps {
  contents: MusicContentMeta[];
  children: React.ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({
  contents,
  children,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentPlaybackIndex, setCurrentPlaybackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [loop, setLoop] = useState<"none" | "one" | "all">("none");
  const [effectType, setEffectType] = useState("bar");
  const params = useParams();
  const { authToken, enableCache } = useFetcherParams();
  const fetcher = useMemo(
    () => createFetcher(RESOURCE_TYPE.MUSIC, enableCache, authToken),
    [enableCache, authToken]
  );
  const resourceId = params.resourceId as string;

  const originalOrder = useMemo(
    () => contents.map((_, index) => index),
    [contents]
  );

  const shuffledPlayOrder = useMemo(() => {
    return shuffle ? shuffleArray(originalOrder) : originalOrder;
  }, [shuffle, originalOrder]);

  useEffect(() => {
    if (!audioRef.current) return;
    return () => {
      if (audioRef.current && audioRef.current.src.startsWith("blob:")) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  // useEffect(() => {
  //   const currentAudioRef = audioRef.current;
  //   return () => {
  //     if (currentAudioRef?.src.startsWith("blob:")) {
  //       URL.revokeObjectURL(currentAudioRef.src);
  //     }
  //   };
  // }, []);

  const {
    data: audioBlob,
    isLoading,
    isError,
    error,
  } = useQuery<Blob, Error>({
    queryKey: [
      "audioContent",
      resourceId,
      contents[currentPlaybackIndex]?.contentId,
    ],
    queryFn: async () => {
      if (!fetcher) throw new Error("Fetcher is not available.");

      const query: Record<string, string | boolean> = { binary: true };
      if (contents[currentPlaybackIndex]?.fileType === "M4A") {
        query.format = "mp3";
      }

      const blob = await fetcher.getContent(
        resourceId,
        contents[currentPlaybackIndex]?.contentId,
        query,
        RESPONSE_TYPE.BLOB
      );

      if (!blob) throw new Error("Failed to fetch audio content.");

      return blob;
    },
    enabled:
      !!fetcher &&
      isPlaying &&
      currentPlaybackIndex !== -1 &&
      !!contents[currentPlaybackIndex].contentId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const audioUrl = useMemo(
    () => (audioBlob ? URL.createObjectURL(audioBlob) : null),
    [audioBlob]
  );

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        if (error.name === "AbortError") {
          console.info("Audio play was interrupted by a new load - expected.");
          return;
        } else {
          console.error("Failed to play audio:", error);
          setIsPlaying(false);
          toaster.create({
            description: "Failed to play audio",
            type: "error",
          });
        }
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isError) {
      toaster.create({
        description: error?.message || "Failed to retrieve or play audio data",
        type: "error",
      });
      console.error("Error retrieving audio data:", error);
      setIsPlaying(false);
      return;
    }

    if (isLoading) return;

    if (audioUrl) {
      if (audioUrl && audioRef.current) {
        const audio = audioRef.current;
        if (audio.src.startsWith("blob:")) {
          URL.revokeObjectURL(audio.src); // 古いオブジェクトURLは解放
        }

        if (audioRef.current) {
          const audio = audioRef.current;
          audio.pause();
          audio.src = audioUrl;
          audio.load();
        }

        const handleCanPlay = () => {
          audio.play().catch((error) => {
            // NotAllowedError など一時的な再生失敗だけはログだけにして抑制
            if (error.name === "NotAllowedError") {
              console.warn(
                "Autoplay was blocked temporarily, but audio will retry."
              );
            } else if (error.name === "AbortError") {
              console.info(
                "Audio play was interrupted by a new load - expected."
              );
            } else {
              console.error("Play failed:", error);
              toaster.create({
                description: "Failed to play audio",
                type: "error",
              });
              setIsPlaying(false);
            }
          });
          audio.removeEventListener("canplay", handleCanPlay);
        };

        audio.addEventListener("canplay", handleCanPlay);
      }
    } else {
      setIsPlaying(false);
    }
  }, [audioUrl, isLoading, isError]);

  const playNextTrack = useCallback(() => {
    setCurrentPlaybackIndex((prevIndex) => {
      if (prevIndex === -1) {
        setIsPlaying(true);
        return 0;
      }
      if (loop === "one") return prevIndex;

      const nextIndex = prevIndex + 1;

      if (nextIndex >= shuffledPlayOrder.length) {
        if (loop === "all") {
          setIsPlaying(true);
          return 0;
        } else {
          setIsPlaying(false);
          return -1;
        }
      }

      setIsPlaying(true);
      return nextIndex;
    });
  }, [loop, shuffledPlayOrder.length]);

  const playPreviousTrack = useCallback(() => {
    setCurrentPlaybackIndex((prevIndex) => {
      if (prevIndex <= 0)
        return loop === "all" ? shuffledPlayOrder.length - 1 : -1;
      return prevIndex - 1;
    });
    setIsPlaying(true);
  }, [loop, shuffledPlayOrder.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
    if (currentPlaybackIndex === -1 && shuffledPlayOrder.length > 0) {
      setCurrentPlaybackIndex(0);
    }
  }, [currentPlaybackIndex, shuffledPlayOrder.length]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (!isPlaying) {
      audioRef.current.pause();
      console.log("Audio playback stopped.");
    }
  }, [isPlaying]);

  const contextValue = {
    currentPlaybackIndex,
    isPlaying,
    shuffle,
    loop,
    shuffledPlayOrder,
    contents,
    audioRef,
    togglePlayPause,
    playNextTrack,
    playPreviousTrack,
    setShuffle,
    setLoop,
    setCurrentPlaybackIndex,
    setIsPlaying,
    effectType,
    setEffectType,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
