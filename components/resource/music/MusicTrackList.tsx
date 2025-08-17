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
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { parseTrackNumber } from "@/utils/media/parseTrackNumber";
import { Button, Table } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";

export const MusicTrackList: React.FC = () => {
  const {
    currentPlaybackIndex,
    isPlaying,
    shuffledPlayOrder,
    contents,
    setCurrentPlaybackIndex,
    setIsPlaying,
  } = useMusicPlayer();
  const [hoveredTrackOriginalIndex, setHoveredTrackOriginalIndex] =
    useState<number>(-1);
  const params = useParams();
  const resourceId = params.resourceId as string;
  const { dispatch, settings } = useGlobalSettings();

  return (
    <div>
      <Table.Root size="sm" interactive striped>
        <Table.Header>
          <Table.Row>
            <Table.Cell>No</Table.Cell>
            <Table.Cell>Title</Table.Cell>
            <Table.Cell>Duration</Table.Cell>
            <Table.Cell>Playlist</Table.Cell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {contents.map((content, originalIndex) => {
            const currentPlayingOriginalIndex =
              currentPlaybackIndex !== -1
                ? shuffledPlayOrder[currentPlaybackIndex]
                : -1;

            const isCurrentPlaying =
              originalIndex === currentPlayingOriginalIndex;

            const trackNumber = parseTrackNumber(
              content.trackNumber ?? "0 of 0"
            ).toString();

            return (
              <Table.Row
                key={content.contentId}
                onMouseEnter={() => setHoveredTrackOriginalIndex(originalIndex)}
                onMouseLeave={() => setHoveredTrackOriginalIndex(-1)}
                bg={isCurrentPlaying ? "blue.100" : undefined}
              >
                <Table.Cell
                  onClick={() => {
                    if (content.fileType === "M4P") {
                      toaster.create({
                        description: "M4P files cannot be played.",
                        type: "error",
                      });
                      console.warn("M4P files cannot be played.");
                      return;
                    }

                    const newPlaybackIndex = shuffledPlayOrder.findIndex(
                      (idx) => idx === originalIndex
                    );

                    if (newPlaybackIndex !== -1) {
                      if (
                        currentPlaybackIndex === newPlaybackIndex &&
                        isPlaying
                      ) {
                        setIsPlaying(false);
                      } else {
                        setCurrentPlaybackIndex(newPlaybackIndex);
                        setIsPlaying(true);
                      }
                    } else {
                      // シャッフルリストにない場合はエラー、または最初から再生
                      setCurrentPlaybackIndex(0);
                      setIsPlaying(true);
                    }
                  }}
                  cursor="pointer"
                >
                  {isCurrentPlaying && isPlaying ? (
                    <MdPause />
                  ) : hoveredTrackOriginalIndex === originalIndex ? (
                    <MdPlayArrow />
                  ) : (
                    trackNumber
                  )}
                </Table.Cell>

                <Table.Cell>{content.title}</Table.Cell>
                <Table.Cell>{content.duration}</Table.Cell>
                <Table.Cell>
                  {settings.bgmPlaylist?.some(
                    (track) =>
                      track.contentId === content.contentId &&
                      track.resourceId === resourceId
                  ) ? (
                    <Button size="sm" variant="outline" disabled>
                      ✔ Added
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (content.fileType === "M4P") {
                          toaster.create({
                            description: "M4P files cannot be set as BGM.",
                            type: "error",
                          });
                          return;
                        }

                        const existing = settings.bgmPlaylist ?? [];
                        const newTrack = {
                          album: content.album ?? "",
                          title: content.title ?? "",
                          resourceId,
                          contentId: content.contentId,
                        };

                        dispatch({
                          type: "bgmPlaylist",
                          value: [...existing, newTrack],
                        });

                        toaster.create({
                          description: `Added "${content.title}" to BGM playlist.`,
                          type: "success",
                        });
                      }}
                    >
                      + Add
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </div>
  );
};
