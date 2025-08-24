/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module ResourceFilterSettings
 * @description
 * A settings form section for configuring resource filters such as keyword, country, genre, and date range.
 * This component reads and updates the global application state for these filter values.
 * 
 * @todo Add validation for date range (from <= to)
 * @todo Add "Clear Filters" button for quick reset
 * @todo Support multi-select for genre filtering

 */

"use client";

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import {
  countryOptions,
  genreOptions,
} from "@/features/settings/filters/constants";
import {
  Box,
  Button,
  Field,
  Heading,
  HStack,
  Input,
  NativeSelect,
  Stack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useColorModeValue } from "../ui/color-mode";

/**
 * Props for `ResourceFilterSettings`.
 * Currently unused, but reserved for future extensibility.
 * Future extensions may include `onChange` or `onReset` callbacks.
 */
export type ResourceFilterSettingsProps = {};

/**
 * A React component that provides a user interface for filtering resources.
 *
 * This component includes input fields and select menus for filtering by
 * keyword, country, genre, and a specific date range. It synchronizes its
 * state with the global settings context, allowing for a consistent filter
 * state across the application.
 *
 * @param {ResourceFilterSettingsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered resource filter settings UI.
 *
 * @example
 * ```tsx
 * <ResourceFilterSettings />
 * ```
 */
export default function ResourceFilterSettings(
  props: ResourceFilterSettingsProps
) {
  const { settings, updateSetting } = useGlobalSettings();
  const [searchQuery, setSearchQuery] = useState(settings.searchQuery);
  const [localDateFrom, setLocalDateFrom] = useState(settings.filterDateFrom);
  const [localDateTo, setLocalDateTo] = useState(settings.filterDateTo);

  // Sync local input state with global context when external changes occur
  useEffect(() => {
    setSearchQuery(settings.searchQuery);
  }, [settings.searchQuery]);

  useEffect(() => {
    setLocalDateFrom(settings.filterDateFrom);
  }, [settings.filterDateFrom]);

  useEffect(() => {
    setLocalDateTo(settings.filterDateTo);
  }, [settings.filterDateTo]);

  /**
   * Updates the global search query setting when input loses focus or Enter is pressed.
   * Triggers a context update without resetting pagination.
   *
   * @example
   * ```ts
   * <Input onBlur={searchQueryHandleBlur} />
   * ```
   */
  const searchQueryHandleBlur = useCallback(() => {
    updateSetting("searchQuery", searchQuery);
  }, [searchQuery]);

  return (
    <>
      <Heading size="sm">Resource Filter</Heading>
      <Box
        border="2px"
        shadow={useColorModeValue("sm", "md")}
        borderRadius="md"
        borderColor={useColorModeValue("gray.300", "gray.600")}
        bgColor={useColorModeValue("gray.50", "gray.800")}
      >
        {/* Resource Filter */}
        <Field.Root>
          <Field.Label whiteSpace="nowrap">Keyword</Field.Label>
          <Input
            type="text"
            value={settings.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={searchQueryHandleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchQueryHandleBlur();
            }}
            placeholder="Enter a title and description"
          />
        </Field.Root>
        <Field.Root>
          <Field.Label whiteSpace="nowrap">Country</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={settings.filterCountry}
              onChange={(e) => updateSetting("filterCountry", e.target.value)}
            >
              {countryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label whiteSpace="nowrap">Genre</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={settings.filterGenre}
              onChange={(e) => updateSetting("filterGenre", e.target.value)}
            >
              {genreOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label whiteSpace="nowrap">Date Range</Field.Label>
          <Stack>
            <HStack gap={2}>
              <Input
                type="datetime-local"
                value={localDateFrom ?? ""}
                onChange={(e) => setLocalDateFrom(e.target.value)}
              />
              <Input
                type="datetime-local"
                value={localDateTo ?? ""}
                onChange={(e) => setLocalDateTo(e.target.value)}
              />
              <Button
                alignSelf="start"
                size="sm"
                mt={2}
                onClick={() => {
                  updateSetting("filterDateFrom", localDateFrom);
                  updateSetting("filterDateTo", localDateTo);
                }}
              >
                Apply
              </Button>
            </HStack>
          </Stack>
        </Field.Root>
      </Box>
    </>
  );
}
