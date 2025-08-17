/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { Box, Progress } from "@chakra-ui/react";

interface UploadProgressProps {
  files: File[] | null;
  completedCount: number;
}

export function UploadProgress({ files, completedCount }: UploadProgressProps) {
  if (!files || files.length === 0) return null;

  const progress = Math.round((completedCount / files.length) * 100);

  return (
    <Box>
      <Progress.Root
        value={progress}
        variant="outline"
        size="lg"
        colorPalette="black"
        striped
        animated
      >
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
        <Progress.ValueText>{progress}%</Progress.ValueText>
      </Progress.Root>
    </Box>
  );
}
