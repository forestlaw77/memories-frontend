/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module ActiveFilterTags
 */

"use client";

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import {
  GlobalSettingsAction,
  GlobalSettingsState,
} from "@/contexts/globalSettingsTypes";
import { defaultInitialSettings } from "@/contexts/globalSettingsUtils";
import { HStack, IconButton, Tag } from "@chakra-ui/react";
import { MdClose } from "react-icons/md";
import { getActiveFilterCount } from "./FilterAccordionSection";

export type ActiveFilterTagsProps = {
  setPage: (page: number) => void;
};

/**
 * `ActiveFilterTags` displays a list of currently active filters as removable tags.
 * Each tag represents a filter field (e.g. keyword, country, genre) and allows the user
 * to clear it individually or reset all filters at once.
 *
 * This component is context-aware and interacts with `GlobalSettingsContext` to update state.
 *
 * @param setPage - A callback to reset pagination when filters are cleared
 * @component
 * @example
 * ```tsx
 * <ActiveFilterTags setPage-{setPage} />
 * ```
 * @returns JSX.Element
 */
export default function ActiveFilterTags({ setPage }: ActiveFilterTagsProps) {
  const { settings, dispatch } = useGlobalSettings();

  /**
   * Mapping of filter keys to their display labels.
   * Only includes keys relevant to filtering UI.
   */
  const filterConfig = {
    searchQuery: "Keyword",
    filterCountry: "Country",
    filterGenre: "Genre",
    filterDateFrom: "From",
    filterDateTo: "To",
  } satisfies Partial<Record<keyof GlobalSettingsState, string>>;

  /**
   * Constructs an array of active filters based on current settings.
   * Filters are included only if their value differs from the default.
   */
  const filters = (
    Object.entries(filterConfig) as Array<[keyof GlobalSettingsState, string]>
  )
    .map(([key, label]) => ({
      label,
      value: settings[key] as string | undefined,
      key,
    }))
    .filter(
      (f) => f.value && f.value !== (defaultInitialSettings[f.key] as string)
    );

  /**
   * Dispatches a setting update to the global context.
   * Ensures type-safe updates for individual filter keys.
   *
   * @param key - The setting key to update
   * @param value - The new value to assign
   */
  function dispatchSetting<K extends keyof GlobalSettingsState>(
    key: K,
    value: GlobalSettingsState[K]
  ) {
    dispatch({ type: key, value } as GlobalSettingsAction);
  }

  /**
   * Clears all active filters by resetting them to their default values.
   * Also resets pagination to the first page.
   */
  function clearAllFilters() {
    filters.forEach((f) =>
      dispatchSetting(
        f.key,
        defaultInitialSettings[f.key] as GlobalSettingsState[typeof f.key]
      )
    );
  }

  /** Number of active filters, used to conditionally render "Clear All" */
  const tagCount = getActiveFilterCount(settings);

  return (
    <HStack gap={2} wrap="wrap" mt={2}>
      {filters.map((filter) => (
        <Tag.Root
          key={filter.key}
          size="md"
          borderRadius="full"
          variant="subtle"
          colorPalette="yellow"
        >
          <Tag.Label>
            {filter.label}: {filter.value}
          </Tag.Label>
          <IconButton
            aria-label="Remove filter"
            size="xs"
            onClick={() => {
              dispatchSetting(filter.key, defaultInitialSettings[filter.key]);
              setPage(1);
            }}
            ml={2}
            variant="ghost"
          >
            <MdClose />
          </IconButton>
        </Tag.Root>
      ))}
      {tagCount > 0 && (
        <Tag.Root>
          <IconButton
            aria-label="Remove filter"
            size="xs"
            onClick={() => {
              clearAllFilters();
              setPage(1);
            }}
            variant="ghost"
          >
            <Tag.Label>Clear All</Tag.Label>
          </IconButton>
        </Tag.Root>
      )}
    </HStack>
  );
}
