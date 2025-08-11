// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { useThumbnailStore } from "@/hooks/useThumbnailStore";
import { Box, Image as ChakraImage, Skeleton } from "@chakra-ui/react";

export default function TrajectorySlide({
  resourceId,
}: {
  resourceId: string;
}) {
  const { settings } = useGlobalSettings();
  const thumbnail = useThumbnailStore((s) => s.getThumbnail(resourceId));

  return (
    <Box>
      {thumbnail ? (
        <ChakraImage
          src={thumbnail}
          alt={`Thumbnail for ${resourceId}`}
          width={250}
          height={250}
          fit={settings.imageFitMode || "cover"}
        />
      ) : (
        <Skeleton loading={!!thumbnail} height="250px" width="250" />
      )}
    </Box>
  );
}
