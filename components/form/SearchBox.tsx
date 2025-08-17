/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { FieldConfig } from "@/types/formDataMap";
import { Button, HStack, Spinner, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { SearchSelection } from "./SearchSelection";

interface SearchBoxProps {
  formData: { [key: string]: string };
  fields: FieldConfig[];
  generateQueryParams: (data: Record<string, string>) => Record<string, string>;
  handleSearch: <T>(queryParams: Record<string, string>) => Promise<T>;
  onSelect: (result: Record<string, string>) => void;
  disabled?: boolean;
}

export function SearchBox({
  formData,
  fields,
  generateQueryParams,
  handleSearch,
  onSelect,
  disabled = false,
}: SearchBoxProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string>[]>([]);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const query = generateQueryParams(formData);
      const result = await handleSearch<Record<string, string>[]>(query);
      setResults(Array.isArray(result) ? result : [result]);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isSearchDisabled = fields
    .filter((f) => f.isSearchable)
    .every((f) => !formData[f.fieldName]?.trim());

  return (
    <Stack gap={3} mb={4}>
      <HStack>
        <Button
          variant="surface"
          colorPalette="blue"
          onClick={handleClick}
          disabled={disabled || isSearchDisabled}
        >
          Search
        </Button>
        <Text fontSize="sm" color="gray.500">
          Enter fields marked (*) to trigger lookup.
        </Text>
      </HStack>
      {isLoading && <Spinner size="sm" />}
      {results.length > 0 && (
        <SearchSelection results={results} onSelect={onSelect} />
      )}
    </Stack>
  );
}
