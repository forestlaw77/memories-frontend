// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { RESPONSE_TYPE } from "@/libs/api/resource_api";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { useEffect, useMemo, useRef, useState } from "react";

export default function BGMPlaylistPlayer() {
  const { settings } = useGlobalSettings();
  const { authToken, enableCache } = useFetcherParams();
  const fetcher = useMemo(
    () => createFetcher(RESOURCE_TYPE.MUSIC, enableCache, authToken),
    [enableCache, authToken]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const playlist = settings.bgmPlaylist ?? [];

  // 🔁 次のトラックへ
  const nextTrack = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  // // 🎚 フェードユーティリティ
  // const fadeVolume = (
  //   audio: HTMLAudioElement,
  //   from: number,
  //   to: number,
  //   duration: number
  // ) => {
  //   const steps = 20;
  //   const step = (to - from) / steps;
  //   const interval = duration / steps;
  //   let current = from;

  //   const timer = setInterval(() => {
  //     current += step;
  //     audio.volume = Math.max(0, Math.min(1, current));
  //     if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
  //       audio.volume = to;
  //       clearInterval(timer);
  //     }
  //   }, interval);
  // };

  // 🎧 曲のロード＆再生
  useEffect(() => {
    const loadAndPlay = async () => {
      const track = playlist[currentIndex];
      if (!track || !fetcher || !audioRef.current) return;

      try {
        const blob = await fetcher.getContent(
          track.resourceId,
          track.contentId,
          { binary: true, format: "mp3" },
          RESPONSE_TYPE.BLOB
        );
        if (blob) {
          if (activeUrl) {
            URL.revokeObjectURL(activeUrl);
          }
          const url = URL.createObjectURL(blob);
          setActiveUrl(url);
          const audio = audioRef.current;
          audio.src = url;
          audio.volume = 0;
          audio.play().then(() => {
            setIsPlaying(true);
            //fadeVolume(audio, 0, 1, 2000); // ⬆️ fade in
          });
        }
      } catch (error) {
        console.error("Track load error:", error);
      }
    };

    if (settings.enableBGM && playlist.length > 0) {
      loadAndPlay();
    }

    return () => {
      audioRef.current?.pause();
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [currentIndex, fetcher, settings.enableBGM]);

  // ⏭ 曲が終わったらフェードアウトしてから次へ
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => nextTrack();

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, playlist]);

  return (
    <>
      {settings.enableBGM && playlist.length > 0 && (
        <audio ref={audioRef} loop={false} preload="auto" />
      )}
    </>
  );
}
