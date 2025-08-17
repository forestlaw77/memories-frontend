/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module DisplaySettings
 * @description
 * UI component for configuring display preferences such as view mode and image fit mode.
 * Integrates with GlobalSettingsContext and Chakra UI.
 */

"use client";

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { ImageFitMode, ViewMode } from "@/types/client/view_preferences";
import { Box, Field, Heading, NativeSelect } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { useColorModeValue } from "../ui/color-mode";

export type DisplaySettingsProps = {};

/**
 * `DisplaySettings` allows users to configure visual preferences
 * including view mode (map/grid/slide) and image fit behavior.
 *
 * Updates are dispatched to `GlobalSettingsContext` and theme is synced via `next-themes`.
 *
 * @returns JSX.Element
 */
export default function DisplaySettings(props: DisplaySettingsProps) {
  const { settings, dispatch } = useGlobalSettings();
  const { setTheme } = useTheme();

  return (
    <>
      <Heading size="sm">Display</Heading>
      <Box
        border="2px"
        shadow={useColorModeValue("sm", "md")}
        borderRadius="md"
        borderColor={useColorModeValue("gray.300", "gray.600")}
        bgColor={useColorModeValue("gray.50", "gray.800")}
      >
        {/* View mode selection */}
        <Field.Root>
          <Field.Label whiteSpace="nowrap">Select view mode</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={settings.viewMode}
              onChange={(e) => {
                dispatch({
                  type: "viewMode",
                  value: e.target.value as ViewMode,
                });
                setTheme(e.target.value);
              }}
            >
              <option value="map">Map View</option>
              <option value="grid">Grid View</option>
              <option value="slide">Slide View</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        {/* Image fit mode selection */}
        <Field.Root>
          <Field.Label whiteSpace="nowrap">Image Fit Mode</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={settings.imageFitMode}
              onChange={(e) =>
                dispatch({
                  type: "imageFitMode",
                  value: e.target.value as ImageFitMode,
                })
              }
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      </Box>
    </>
  );
}
