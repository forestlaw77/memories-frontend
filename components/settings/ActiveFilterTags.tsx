// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import {
  defaultInitialSettings,
  GlobalSettingsAction,
  GlobalSettingsState,
  useGlobalSettings,
} from "@/contexts/GlobalSettingsContext";
import { HStack, IconButton, Tag } from "@chakra-ui/react";
import { MdClose } from "react-icons/md";
import { getActiveFilterCount } from "./FilterAccordionSection";

type StringKeysOnly = {
  [K in keyof GlobalSettingsState]: GlobalSettingsState[K] extends string
    ? K
    : never;
}[keyof GlobalSettingsState];

export function ActiveFilterTags({
  setPage,
}: {
  setPage: (page: number) => void;
}) {
  const { settings, dispatch } = useGlobalSettings();
  const filters: {
    label: string;
    value: string | undefined;
    key: keyof GlobalSettingsState;
  }[] = [
    {
      label: "Keyword",
      value: settings.searchQuery,
      key: "searchQuery" as keyof GlobalSettingsState,
    },
    {
      label: "Country",
      value: settings.filterCountry,
      key: "filterCountry" as keyof GlobalSettingsState,
    },
    {
      label: "Genre",
      value: settings.filterGenre,
      key: "filterGenre" as keyof GlobalSettingsState,
    },
    {
      label: "From",
      value: settings.filterDateFrom,
      key: "filterDateFrom" as keyof GlobalSettingsState,
    },
    {
      label: "To",
      value: settings.filterDateTo,
      key: "filterDateTo" as keyof GlobalSettingsState,
    },
  ].filter(
    (f) => f.value && f.value !== (defaultInitialSettings[f.key] as string)
  );

  function dispatchSetting<K extends keyof GlobalSettingsState>(
    key: K,
    value: GlobalSettingsState[K]
  ) {
    dispatch({ type: key, value } as GlobalSettingsAction);
  }

  function clearAllFilters() {
    filters.forEach((f) =>
      dispatchSetting(
        f.key,
        defaultInitialSettings[f.key] as GlobalSettingsState[typeof f.key]
      )
    );
  }

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
