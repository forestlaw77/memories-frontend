// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { Toaster } from "@/components/common/toaster";
import {
  ContentListComponentProps,
  MusicContentMeta,
} from "@/types/client/client_model";
import { parseTrackNumber } from "@/utils/media/parseTrackNumber";
import { Box, Image, Stack } from "@chakra-ui/react";
import { useMemo } from "react";
import AudioVisualizer from "./AudioVisualizer";
import { MusicPlayerControls } from "./MusicPlayerControls";
import { MusicPlayerProvider } from "./MusicPlayerProvider";
import { MusicTrackList } from "./MusicTrackList";

export default function ListMusic({
  thumbnailUrl,
  contents,
}: ContentListComponentProps<MusicContentMeta>) {
  const sortedContents = useMemo(() => {
    return contents
      .slice()
      .sort(
        (a, b) =>
          parseTrackNumber(a.trackNumber ?? "0 of 0") -
          parseTrackNumber(b.trackNumber ?? "0 of 0")
      );
  }, [contents]);

  return (
    <MusicPlayerProvider contents={sortedContents}>
      <Toaster />
      <div>
        <Stack direction={{ base: "column", md: "row" }} align="flex-start">
          <Box flexShrink={0}>
            <Box position="relative">
              <Image
                width={400}
                height={400}
                src={thumbnailUrl || "/FallBackImages/forMusic.png"}
                alt={"Unknown"}
                fit="cover"
              />
              <Box
                position="absolute"
                bottom="0"
                left="0"
                width="100%"
                zIndex="1"
              >
                <AudioVisualizer />
              </Box>
            </Box>
            <MusicPlayerControls />
          </Box>
          <Box flexGrow={1}>
            <MusicTrackList />
          </Box>
        </Stack>
      </div>
    </MusicPlayerProvider>
  );
}
