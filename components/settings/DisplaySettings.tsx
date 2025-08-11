// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { ImageFitMode, ViewMode } from "@/types/client/view_preferences";
import { Box, Field, Heading, NativeSelect } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { useColorModeValue } from "../ui/color-mode";

export default function DisplaySettings() {
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
        {/* ディスプレイモードの設定 */}
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
        {/* 画像のフィットモード */}
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
