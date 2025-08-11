// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { SortStrategy } from "@/types/client/view_preferences";
import {
  Box,
  Field,
  Heading,
  NativeSelect,
  NumberInput,
  Switch,
} from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useColorModeValue } from "../ui/color-mode";

export function GeneralSettings() {
  const { settings, updateSetting } = useGlobalSettings();
  const [itemPerPage, setItemPerPage] = useState(settings.itemPerPage);
  const { setTheme } = useTheme();

  useEffect(() => {
    setItemPerPage(settings.itemPerPage);
  }, [settings.itemPerPage]);

  const handleBlur = () => {
    const value = Number(itemPerPage);
    if (!isNaN(value) && value >= 10 && value <= 1000) {
      updateSetting("itemPerPage", value);
    }
  };

  return (
    <>
      <Heading size="sm">General</Heading>
      <Box
        border="2px"
        shadow={useColorModeValue("sm", "md")}
        borderRadius="md"
        borderColor={useColorModeValue("gray.300", "gray.600")}
        bgColor={useColorModeValue("gray.50", "gray.800")}
      >
        {/* テーマ設定 */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap"> Select Theme </Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={settings.theme}
              onChange={(e) => {
                updateSetting("theme", e.target.value);
                setTheme(e.target.value);
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">Follow System Setting</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        {/* Enable Caching */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap"> Enable Caching </Field.Label>
          <Switch.Root
            checked={settings.enableCache}
            onCheckedChange={(e) => updateSetting("enableCache", e.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
        </Field.Root>

        {/* ページごとのアイテム数 */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap">Item / Page</Field.Label>
          <NumberInput.Root
            width="200px"
            allowMouseWheel
            min={10}
            max={1000}
            value={String(itemPerPage)}
            onValueChange={(e) => setItemPerPage(Number(e.value))}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleBlur();
            }}
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>

        {/** 表示順序 */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap">Select display order</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={settings.sortStrategy}
              onChange={(e) =>
                updateSetting("sortStrategy", e.target.value as SortStrategy)
              }
            >
              <option value={SortStrategy.Newest}>Newest first</option>
              <option value={SortStrategy.Shuffle}>Shuffle from all</option>
              <option value={SortStrategy.Center}>Center order</option>
              <option value={SortStrategy.CenterRandom}>
                Random from the center
              </option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      </Box>
    </>
  );
}
