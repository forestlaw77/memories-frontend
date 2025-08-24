/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { FieldConfig } from "@/types/formDataMap";
import { parseSalesDate } from "@/utils/external/forRakutenAPI";
import {
  Button,
  Text as ChakraText,
  Field,
  HStack,
  Input,
  Spinner,
  Stack,
  Switch,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FieldInputs } from "./FieldInputs";
import { SearchSelection } from "./SearchSelection";
import { UploadProgress } from "./UploadProgress";

interface GenericFormProps {
  fields: FieldConfig[];
  handleSearch: <T>(queryParams: Record<string, string>) => Promise<T>;
  handleSubmit: (
    data: Record<string, string>,
    files: File[] | null,
    filePaths: string[] | null,
    options: { shouldStoreFile: boolean },
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
    setCompletedCount: React.Dispatch<React.SetStateAction<number>>
  ) => void;
  generateQueryParams: (
    formData: Record<string, string>
  ) => Record<string, string>;
}

export function AddGenericForm({
  fields,
  handleSearch,
  handleSubmit,
  generateQueryParams,
}: GenericFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[] | null>(null);
  const [filePaths, setFilePaths] = useState<string[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isFormEmpty, setIsFormEmpty] = useState(true);
  const [isFileEmpty, setIsFileEmpty] = useState(true);
  const [isSearchDisabled, setIsSearchDisabled] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [searchResults, setSearchResults] = useState<Record<string, string>[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldStoreFile, setShouldStoreFile] = useState(true);

  async function handleSearchClick() {
    try {
      setIsSearching(true);
      setHasSearched(true);
      const queryParams = generateQueryParams(formData);
      const results = await handleSearch<Record<string, string>[]>(queryParams);
      const normalizedResults = Array.isArray(results) ? results : [results];
      setSearchResults(normalizedResults);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }

  function onSelect(result: Record<string, string>) {
    console.log("onSelect:", result);
    const filteredResult = result;
    // const filteredResult = Object.fromEntries(
    //   Object.entries(result).filter(([key]) => key in formData) // `formData` にあるキーだけ残す
    // );
    console.log("filteredResult:", filteredResult);

    setFormData({
      ...formData,
      ...result,
      publishedAt: parseSalesDate(result.publishedAt),
    });
  }

  function handleScanSuccess(barcodeText: string) {
    setFormData({ ...formData, barcodeText });
    setShowScanner(false);
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const newFormData = {
      ...formData,
      [event.target.name]: event.target.value,
    };
    setFormData(newFormData);
    const isSearchDisabled = fields
      .filter((field) => field.isSearchable)
      .every(
        (searchField) =>
          !newFormData[searchField.fieldName] ||
          newFormData[searchField.fieldName] === ""
      );
    setIsSearchDisabled(isSearchDisabled);

    setIsFormEmpty(Object.values(newFormData).every((value) => value === ""));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files
      ? Array.from(event.target.files)
      : null;
    const filePaths = selectedFiles?.map((file) => file.name); // file.webkitRelativePath
    setFiles(selectedFiles);
    setFilePaths(filePaths ?? null);
    setIsFileEmpty(selectedFiles ? false : true);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    handleSubmit(
      formData,
      files,
      filePaths,
      { shouldStoreFile },
      setIsSubmitting,
      setCompletedCount
    );
  }

  useEffect(() => {
    if (files && Math.round(completedCount / files.length) == 1) {
      setFiles([]);
      setCompletedCount(0);

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  }, [isSubmitting]);

  return (
    <div>
      <form>
        <ChakraText fontSize="sm" color="gray.500">
          Fields marked with (*) are used for searching.
        </ChakraText>
        <HStack>
          <Button
            colorPalette="blue"
            variant="surface"
            onClick={handleSearchClick}
            disabled={isSubmitting || isSearchDisabled}
          >
            Search
          </Button>
          <ChakraText fontSize="xs" color="gray.400">
            If you want to fill a field by searching, enter (*) the filled
            field.
          </ChakraText>
        </HStack>
      </form>
      {isSearching && <Spinner />}
      {hasSearched && !isSearching && searchResults.length === 0 && (
        <ChakraText color="red">Couldn't Find it</ChakraText>
      )}
      <form onSubmit={handleFormSubmit}>
        <Stack gap="8" maxW="xl" css={{ "--field-label-width": "192px" }}>
          <FieldInputs
            fields={fields}
            formData={formData}
            onChange={handleChange}
            barcodeSupport={{
              enabled: true,
              showScanner,
              setShowScanner,
              onScanSuccess: handleScanSuccess,
            }}
          />
          <Field.Root orientation="horizontal">
            <Field.Label>STORE FILE?</Field.Label>
            <Switch.Root
              checked={shouldStoreFile}
              onCheckedChange={(e) => setShouldStoreFile(e.checked)}
            >
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Root>
          </Field.Root>
          <Field.Root orientation="horizontal">
            <Field.Label>FILE</Field.Label>
            <Input type="file" multiple onChange={handleFileChange} />
          </Field.Root>
          <UploadProgress files={files} completedCount={completedCount} />
          <Button
            type="submit"
            colorScheme="blue"
            disabled={isSubmitting || isFormEmpty}
          >
            {isSubmitting ? "Registering..." : "Registration"}
          </Button>
        </Stack>
      </form>
      {searchResults.length > 0 && (
        <Stack>
          <SearchSelection results={searchResults} onSelect={onSelect} />
        </Stack>
      )}
    </div>
  );
}
