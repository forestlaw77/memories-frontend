/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module AudioSettings
 */

"use client";

import { MdClose } from "@/assets/icons";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { BgmTrack } from "@/contexts/globalSettingsTypes";
import {
  Box,
  Text as ChakraText,
  Field,
  Flex,
  Heading,
  HStack,
  IconButton,
  Slider,
  Switch,
} from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";

export type AudioSettingsProps = {};

/**
 * `AudioSettings` displays and manages global audio preferences,
 * including background music (BGM) enablement, volume control, and playlist management.
 *
 * This component reads from and dispatches updates to `GlobalSettingsContext`.
 *
 * @component
 * @example
 * ```tsx
 * <AudioSettings />
 * ```
 * @returns JSX.Element
 */
export default function AudioSettings(props: AudioSettingsProps) {
  const { settings, dispatch } = useGlobalSettings();

  return (
    <>
      <Heading size="sm">Audio</Heading>
      <Box
        border="2px"
        shadow={useColorModeValue("sm", "md")}
        borderRadius="md"
        borderColor={useColorModeValue("gray.300", "gray.600")}
        bgColor={useColorModeValue("gray.50", "gray.800")}
      >
        {/* Toggle BGM */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap">Enable BGM</Field.Label>
          <Switch.Root
            checked={settings.enableBGM}
            onCheckedChange={(e) =>
              dispatch({ type: "enableBGM", value: e.checked })
            }
          >
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
        </Field.Root>

        {/* BGM Volume Slider */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap">BGM Volume</Field.Label>
          <Slider.Root
            minW="250px"
            size="sm"
            defaultValue={[settings.bgmVolume * 100.0]}
            onValueChange={(e) =>
              dispatch({ type: "bgmVolume", value: Number(e.value) / 100.0 })
            }
          >
            <HStack justify="space-between">
              <Slider.Label>Volume</Slider.Label>
              <Slider.ValueText />
            </HStack>
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs rounded="l1" />
            </Slider.Control>
          </Slider.Root>
        </Field.Root>

        {/* BGM Playlist Display and Removal */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap">BGM Playlist</Field.Label>
          <Box>
            {settings.bgmPlaylist?.map((track: BgmTrack, idx) => (
              <Flex key={idx} align="center" justify="space-between">
                <Box>
                  <ChakraText fontSize="sm">{track.title}</ChakraText>
                  <ChakraText fontSize="sm" color="gray.500">
                    {track.album}
                  </ChakraText>
                </Box>
                <IconButton
                  size="xs"
                  aria-label="Remove"
                  onClick={() => {
                    const updated = settings.bgmPlaylist!.filter(
                      (_, i) => i !== idx
                    );
                    dispatch({ type: "bgmPlaylist", value: updated });
                  }}
                >
                  <MdClose />
                </IconButton>
              </Flex>
            ))}
          </Box>
        </Field.Root>
      </Box>
    </>
  );
}
