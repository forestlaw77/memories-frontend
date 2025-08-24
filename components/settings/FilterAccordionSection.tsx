/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module FilterAccordionSection
 * @description
 * Accordion-based UI for advanced filtering of memory entries.
 * Supports country, genre, keyword, and date range filters.
 * Integrates with GlobalSettingsContext and Chakra UI components.
 */

"use client";

import { FaFilter } from "@/assets/icons";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { GlobalSettingsState } from "@/contexts/globalSettingsTypes";
import {
  defaultInitialSettings,
  defaultInitialSettings as globalInitialState,
} from "@/contexts/globalSettingsUtils";
import {
  countryOptions,
  genreOptions,
} from "@/features/settings/filters/constants";
import {
  Accordion,
  Box,
  Button,
  Text as ChakraText,
  createListCollection,
  Field,
  HStack,
  Input,
  Portal,
  Select,
  Span,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";

const filterKeys: Array<keyof GlobalSettingsState> = [
  "searchQuery",
  "filterCountry",
  "filterGenre",
  "filterDateFrom",
  "filterDateTo",
];

/**
 * Props for `FilterAccordionSection`.
 *
 * @property setPage - Callback to reset pagination when filters change.
 */
export type FilterAccordionSectionProps = {
  setPage: (page: number) => void;
};

/**
 * A React component that renders a collapsible accordion for data filtering.
 *
 * This component manages filter inputs for search queries, country, genre, and
 * date ranges. It reads and writes the filter state to the global settings context.
 * When a filter is applied, it calls the `setPage` prop to reset the pagination.
 *
 * @param {FilterAccordionSectionProps} props - The props for the component.
 * @returns {JSX.Element} The rendered filter accordion UI.
 *
 * @example
 * ```tsx
 * <FilterAccordionSection setPage={handlePageReset} />
 * ```
 */
export default function FilterAccordionSection({
  setPage,
}: FilterAccordionSectionProps) {
  const { settings, updateSetting } = useGlobalSettings();
  const [searchQuery, setSearchQuery] = useState(settings.searchQuery);
  const [localDateFrom, setLocalDateFrom] = useState(settings.filterDateFrom);
  const [localDateTo, setLocalDateTo] = useState(settings.filterDateTo);

  // Sync local state with global context when search query changes
  useEffect(() => {
    setSearchQuery(settings.searchQuery);
  }, [settings.searchQuery]);

  useEffect(() => {
    setLocalDateFrom(settings.filterDateFrom);
  }, [settings.filterDateFrom]);

  useEffect(() => {
    setLocalDateTo(settings.filterDateTo);
  }, [settings.filterDateTo]);

  const searchQueryHandleBlur = useCallback(() => {
    updateSetting("searchQuery", searchQuery);
    setPage(1);
  }, [searchQuery, setPage]);

  const countryFilterItems = useMemo(
    () =>
      createListCollection({
        items: countryOptions,
      }),
    []
  );

  const genreFilterItems = useMemo(
    () =>
      createListCollection({
        items: genreOptions,
      }),
    []
  );

  /**
   * Clears all active filters by resetting them to their default values.
   * Also resets pagination to the first page.
   *
   * This function updates the global settings context for each filter key.
   *
   * @example
   * ```ts
   * clearAllFilters(); // Resets all filters and pagination
   * ```
   */

  function clearAllFilters() {
    filterKeys.forEach((k) => {
      updateSetting(k, defaultInitialSettings[k]);
    });
  }

  const filterCount = useMemo(() => getActiveFilterCount(settings), [settings]);

  return (
    <Accordion.Root
      collapsible
      defaultValue={[]}
      transition="all 0.3s ease-in-out"
    >
      <Accordion.Item value="advanced-filters">
        <Accordion.ItemTrigger>
          <Span display="inline-flex" alignItems="center" gap="2">
            <FaFilter /> Filter Detail
            {filterCount > 0 && (
              <ChakraText as="span" color="gray.500" fontSize="sm" ml={2}>
                （Applying {filterCount} Items）
              </ChakraText>
            )}
          </Span>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>

        <Accordion.ItemContent>
          <Accordion.ItemBody>
            <HStack gap={4} wrap="wrap">
              {/* Filter by Country Select */}
              <Box>
                <Select.Root
                  maxW="200px"
                  value={[settings.filterCountry ?? ""]}
                  onValueChange={(detail) => {
                    updateSetting("filterCountry", detail.value[0]);
                    setPage(1);
                  }}
                  collection={countryFilterItems}
                >
                  <Select.HiddenSelect />
                  <Select.Label>Filter by Country</Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select Country" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {countryFilterItems.items.map((country) => (
                          <Select.Item item={country} key={country.value}>
                            {country.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>
              {/* Search Input */}
              <Box>
                <Field.Root>
                  <Field.Label>Filter by Keyword</Field.Label>
                  <Input
                    type="text"
                    placeholder={`Enter a title and description`}
                    value={settings.searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={searchQueryHandleBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") searchQueryHandleBlur();
                    }}
                    width="200px"
                  />
                </Field.Root>
              </Box>
              {/* Genre Filter Select */}
              <Box>
                <Select.Root
                  maxW="200px"
                  value={[settings.filterGenre || ""]}
                  onValueChange={(detail) => {
                    updateSetting("filterGenre", detail.value[0]);
                    setPage(1);
                  }}
                  collection={genreFilterItems}
                >
                  <Select.HiddenSelect />
                  <Select.Label>Filter by Genre</Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select Genre" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {genreFilterItems.items.map((genre) => (
                          <Select.Item item={genre} key={genre.value}>
                            {genre.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>
              {/* Date Filter */}
              <Box>
                <Field.Root>
                  <Field.Label>Filter by Date Range</Field.Label>
                  <HStack gap={2}>
                    <Input
                      type="datetime-local"
                      value={settings.filterDateFrom ?? ""}
                      onChange={(e) => setLocalDateFrom(e.target.value)}
                      aria-label="Filter from date"
                    />
                    <Input
                      type="datetime-local"
                      value={settings.filterDateTo ?? ""}
                      onChange={(e) => setLocalDateTo(e.target.value)}
                      aria-label="Filter to date"
                    />
                    <Button
                      alignSelf="start"
                      size="sm"
                      mt={2}
                      onClick={() => {
                        updateSetting("filterDateFrom", localDateFrom);
                        updateSetting("filterDateTo", localDateTo);
                        setPage(1);
                      }}
                    >
                      Apply
                    </Button>
                  </HStack>
                </Field.Root>
              </Box>
              {filterCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorPalette="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllFilters();
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </HStack>
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
}

/**
 * Calculates the number of active filters by comparing current settings
 * against the default initial state.
 *
 * Used to conditionally render UI elements like "Clear Filters" or tag count.
 *
 * @param settings - The current global settings state
 * @returns Number of filters that differ from their default values
 *
 * @example
 * ```ts
 * const count = getActiveFilterCount(settings);
 * if (count > 0) showClearButton();
 * ```
 */
export function getActiveFilterCount(settings: GlobalSettingsState): number {
  let count = 0;

  filterKeys.forEach((key) => {
    const settingValue = settings[key];
    const defaultValue = globalInitialState[key];

    if (settingValue !== defaultValue) {
      count++;
    }
  });
  return count;
}
