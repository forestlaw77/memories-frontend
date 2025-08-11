// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { useColorModeValue } from "@/components/ui/color-mode";
import { Box, Text as ChakraText } from "@chakra-ui/react";

export function SessionCountdownBanner({ minutes }: { minutes: number }) {
  return (
    <Box
      // position="fixed"
      // bottom="4"
      // right="4"
      bg={useColorModeValue("yellow.100", "gray.800")}
      px="4"
      py="2"
      rounded="md"
      shadow="md"
      zIndex={1000}
    >
      <ChakraText fontSize="sm">
        Session remaining: {minutes} minutes
      </ChakraText>
    </Box>
  );
}
