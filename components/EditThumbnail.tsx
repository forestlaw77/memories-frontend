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

import { useThumbnailRotation } from "@/hooks/useThumbnailRotation";
import {
  Box,
  Button,
  Image as ChakraImage,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { AiOutlineRotateLeft, AiOutlineRotateRight } from "react-icons/ai";
import { toaster } from "./common/toaster";

export default function EditThumbnail({
  imageSrc,
  onApplyRotation,
  isLoading,
}: {
  imageSrc: string | null;
  onApplyRotation: (angle: number) => Promise<void>;
  isLoading: boolean;
}) {
  const { rotatedUrl, rotationAngle, hasPendingChange, rotate, reset } =
    useThumbnailRotation(imageSrc);

  const handleRotate = async (direction: "left" | "right") => {
    try {
      await rotate(direction);
    } catch (error) {
      toaster.create({
        description: `Updated Image rotation failed: ${error}`,
        type: "error",
      });
    }
  };

  const handleApply = async () => {
    if (hasPendingChange) {
      await onApplyRotation(rotationAngle);
      //reset();
    }
  };

  return (
    <Box>
      <HStack mt={2}>
        <IconButton
          aria-label="回転 左"
          onClick={() => handleRotate("left")}
          colorPalette="blue"
          variant="surface"
        >
          <AiOutlineRotateLeft />
        </IconButton>
        <IconButton
          aria-label="回転 右"
          onClick={() => handleRotate("right")}
          colorPalette="blue"
          variant="surface"
        >
          <AiOutlineRotateRight />
        </IconButton>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={!hasPendingChange || isLoading}
          loading={isLoading}
          loadingText="Applying..."
          colorPalette="blue"
          variant="surface"
        >
          Apply Rotation
        </Button>
      </HStack>

      <ChakraImage src={rotatedUrl ?? "/file.svg"} alt="thumbnail" />
    </Box>
  );
}
