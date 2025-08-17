/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { toaster } from "@/components/common/toaster";
import { Tooltip } from "@/components/common/tooltip";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { Flex, HStack, IconButton, Spinner, Text } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdPause, MdPlayArrow, MdSkipNext } from "react-icons/md";

type Fetcher = ReturnType<typeof createFetcher>;

export default function BGMControlPanel() {
  const { settings } = useGlobalSettings();
  const { authToken, enableCache } = useFetcherParams();
  const fetcher = useMemo<Fetcher>(
    () => createFetcher(RESOURCE_TYPE.MUSIC, enableCache, authToken),
    [enableCache, authToken]
  );
  const playlist = settings.bgmPlaylist ?? [];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTrack = playlist[currentIndex];
  const { resolvedTheme } = useTheme();
  const borderColor = resolvedTheme === "dark" ? "gray.700" : "gray.200";
  const bgColor = resolvedTheme === "dark" ? "gray.800" : "gray.50";

  const queryClient = useQueryClient();

  const {
    data: audioBlob,
    isLoading,
    isError,
    error,
  } = useQuery<Blob, Error>({
    queryKey: [
      "musicTrackBlob",
      currentTrack?.resourceId,
      currentTrack?.contentId,
    ],
    queryFn: async () => {
      if (!currentTrack) throw new Error("No track selected.");
      if (!fetcher) throw new Error("Fetcher not initialized.");

      const blob = await fetcher.getContent(
        currentTrack.resourceId,
        currentTrack.contentId,
        { binary: true, format: "mp3" },
        RESPONSE_TYPE.BLOB
      );
      if (!blob) throw new Error("Failed to get audio blob.");
      return blob;
    },

    enabled: !!currentTrack && settings.enableBGM && playlist.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (isError) {
      console.error("Failed to load track:", error);
      toaster.create({
        title: "Failed to load music",
        description: "Please try again later.",
        type: "error",
        duration: 10000,
        closable: true,
      });
      setIsPlaying(false); // ロード失敗時は再生を停止状態にする
    }
  }, [isError, error]);

  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioBlob instanceof Blob) {
      setActiveUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return URL.createObjectURL(audioBlob);
      });
    } else {
      setActiveUrl(null);
    }

    return () => {
      setActiveUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return null;
      });
    };
  }, [audioBlob]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Cannot play:", err);
          setIsPlaying(false);
          toaster.create({
            title: "Playback Blocked",
            description: "Please click the play button again.",
            type: "info",
            duration: 3000,
            closable: true,
          });
        });
    }
  }, [isPlaying, activeUrl]);

  const skipToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  }, [playlist.length]);

  useEffect(() => {
    if (playlist.length > 0 && currentIndex >= playlist.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, playlist.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (activeUrl) {
      audio.src = activeUrl;
      audio.volume = settings.bgmVolume ?? 0.5;

      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn("Autoplay failed after src update:", err);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
    }
  }, [activeUrl, settings.bgmVolume, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      skipToNext();
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [skipToNext]);

  if (!settings.enableBGM || playlist.length === 0) return null;

  return (
    <Flex
      align="center"
      px={4}
      py={2}
      borderTop="1px solid"
      bg={bgColor}
      borderColor={borderColor}
      fontSize="sm"
    >
      <audio ref={audioRef} preload="auto" />
      <IconButton
        onClick={togglePlay}
        aria-label="Play/Pause"
        size="sm"
        variant="ghost"
        mr={2}
        disabled={isLoading || !audioBlob}
      >
        {isPlaying ? <MdPause /> : <MdPlayArrow />}
      </IconButton>
      <Tooltip showArrow content="Next">
        <IconButton
          onClick={skipToNext}
          aria-label="Next"
          size="sm"
          variant="ghost"
          mr={2}
          disabled={isLoading || playlist.length <= 1}
        >
          <MdSkipNext />
        </IconButton>
      </Tooltip>
      <HStack gap={2} align="center">
        <Text fontWeight="medium">{currentTrack?.title ?? "No Title"}</Text>
        {isLoading && <Spinner size="sm" />}
      </HStack>
    </Flex>
  );
}
