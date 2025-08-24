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
import { Box, Button, Stack, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FieldInputs } from "./FieldInputs";
import { GeoMapEditorBox } from "./GeoMapEditorBox";
import { SearchBox } from "./SearchBox";
import { UploadProgress } from "./UploadProgress";

export interface EditGenericFormProps {
  fields: FieldConfig[];
  oldFormData: { [key: string]: string };
  handleSubmit: (
    data: { [key: string]: string },
    files: File[] | null,
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
    setCompletedCount: React.Dispatch<React.SetStateAction<number>>
  ) => Promise<void> | void;
  generateQueryParams?: (
    formData: Record<string, string>
  ) => Record<string, string>;
  handleSearch?: <T>(queryParams: Record<string, string>) => Promise<T>;
}

export function EditGenericForm({
  fields,
  oldFormData,
  handleSubmit,
  generateQueryParams,
  handleSearch,
}: EditGenericFormProps) {
  const [formData, setFormData] = useState<{ [key: string]: string }>(
    oldFormData
  );
  const [files, setFiles] = useState<File[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isFormEmpty, setIsFormEmpty] = useState(true);
  const hasGeo =
    fields.some((f) => f.fieldName === "latitude") &&
    fields.some((f) => f.fieldName === "longitude");

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

    setIsFormEmpty(
      fields.every(
        ({ fieldName }) =>
          !newFormData[fieldName] || newFormData[fieldName] === ""
      ) &&
        (!files || files.length === 0)
    );
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await handleSubmit(formData, files, setIsSubmitting, setCompletedCount);
  }

  function onSelect(result: Record<string, string>) {
    console.log("onSelect:", result);
    const filteredResult = result;
    // 下記、期待どおりの動きをしないので、見直し
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

  useEffect(() => {
    setFormData(oldFormData);
  }, [oldFormData]);

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
      <Stack
        mb={4}
        alignItems="flex-start"
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <VStack alignItems="flex-start" gap={2}>
          {generateQueryParams && handleSearch && (
            <SearchBox
              formData={formData}
              fields={fields}
              generateQueryParams={generateQueryParams}
              handleSearch={handleSearch}
              onSelect={onSelect}
              disabled={isSubmitting}
            />
          )}
          <Box>
            <form onSubmit={handleFormSubmit}>
              <Stack gap="8" maxW="sm" css={{ "--field-label-width": "192px" }}>
                <FieldInputs
                  fields={fields}
                  formData={formData}
                  onChange={handleChange}
                />
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
          </Box>
        </VStack>
        {hasGeo && (
          <GeoMapEditorBox
            lat={parseFloat(formData.latitude)}
            lng={parseFloat(formData.longitude)}
            onUpdateLocation={(lat, lng, address) => {
              setFormData((prev) => ({
                ...prev,
                latitude: lat.toString(),
                longitude: lng.toString(),
                ...(address && { address }),
              }));
            }}
          />
        )}
      </Stack>
    </div>
  );
}
