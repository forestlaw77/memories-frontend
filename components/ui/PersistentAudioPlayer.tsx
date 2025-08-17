/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";

import { useEffect, useMemo, useRef } from "react";

function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { authToken, enableCache } = useFetcherParams();
  const fetcher = useMemo(
    () => createFetcher(RESOURCE_TYPE.MUSIC, enableCache, authToken),
    [enableCache, authToken]
  );
  const { settings } = useGlobalSettings();
  const bgmTrack = settings?.bgmTrack;

  useEffect(() => {
    async function fetchBgmTrack() {
      if (!bgmTrack || !bgmTrack.resourceId) {
        console.warn("BGM track is not set or invalid.");
        return null;
      }
      try {
        const blob = await fetcher?.getContent(
          bgmTrack.resourceId,
          bgmTrack.contentId,
          { format: "mp3" },
          RESPONSE_TYPE.BLOB
        );

        if (blob && audioRef.current) {
          const url = URL.createObjectURL(blob);
          const audio = audioRef.current;
          audio.src = url;

          const tryPlay = () => {
            audio.play().catch(() => {
              console.warn("Auto-play failed (still needs user gesture)");
            });
          };

          audio.addEventListener("canplaythrough", tryPlay, { once: true });
        } else {
          console.error("Failed to fetch BGM track.");
        }
      } catch (error) {
        console.error("Error fetching BGM track:", error);
      }
    }
    fetchBgmTrack();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          // Clean up the object URL to release memory
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current.src = ""; // Clear the source to release memory
      }
    };
  }, [fetcher]);

  // useEffect(() => {
  //   const audio = audioRef.current;
  //   audio?.play().catch(() => {
  //     console.log("Plays after user action");
  //   });
  // }, []);

  return (
    <audio
      ref={audioRef}
      loop
      autoPlay
      onCanPlay={() => {
        audioRef.current?.play().catch(() => {
          console.warn("Play failed — user action might be required");
        });
      }}
    />
  );
}

export default function PersistentAudioPlayer() {
  const { settings } = useGlobalSettings();
  return <div>{settings.enableBGM && <BgmPlayer />}</div>;
}
