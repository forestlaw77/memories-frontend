// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { FieldConfig } from "@/types/formDataMap";
import {
  Button,
  Text as ChakraText,
  Field,
  HStack,
  Input,
  Spinner,
  Stack,
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
    setFiles(selectedFiles);
    setIsFileEmpty(selectedFiles ? false : true);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    handleSubmit(formData, files, setIsSubmitting, setCompletedCount);
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
// <div>
//   <form>
//     <Text fontSize="sm" color="gray.500">
//       Fields marked with (*) are used for searching.
//     </Text>
//     <HStack>
//       <Button
//         colorPalette="blue"
//         variant="surface"
//         onClick={handleSearchClick}
//         disabled={isSubmitting || isSearchDisabled}
//       >
//         Search
//       </Button>
//       <Text fontSize="xs" color="gray.400">
//         If you want to fill a field by searching, enter (*) the filled
//         field.
//       </Text>
//     </HStack>
//   </form>
//   {isSearching && <Spinner />}
//   {hasSearched && !isSearching && searchResults.length === 0 && (
//     <Text color="red">Couldn't Find it</Text>
//   )}

//   <form onSubmit={handleFormSubmit}>
//     <Stack gap="8" maxW="sm" css={{ "--field-label-width": "192px" }}>
//       {fields.map(
//         ({
//           fieldName,
//           label,
//           type,
//           isSearchable,
//           placeholder,
//           options,
//         }) => (
//           <Field.Root key={fieldName} orientation="horizontal">
//             <Field.Label>
//               {label}
//               <Text color="red">{isSearchable && "(*)"}</Text>
//             </Field.Label>
//             {type === "textarea" ? (
//               <Textarea
//                 name={fieldName}
//                 placeholder={placeholder}
//                 value={formData[fieldName] || ""}
//                 onChange={handleChange}
//               />
//             ) : type === "barcode" ? (
//               <>
//                 <Input
//                   type="text"
//                   name={fieldName}
//                   placeholder={placeholder}
//                   value={formData[fieldName] || ""}
//                   onChange={handleChange}
//                 />
//                 <Button
//                   colorPalette="blue"
//                   variant="surface"
//                   onClick={() => setShowScanner(true)}
//                 >
//                   Scan
//                 </Button>
//               </>
//             ) : (
//               <Input
//                 type={type}
//                 name={fieldName}
//                 placeholder={placeholder}
//                 value={formData[fieldName] || ""}
//                 onChange={handleChange}
//               />
//             )}
//           </Field.Root>
//         )
//       )}
//       <Field.Root orientation="horizontal">
//         <Field.Label>FILE</Field.Label>
//         <Input type="file" multiple onChange={handleFileChange} />
//       </Field.Root>
//       {files && files.length > 0 && (
//         <Progress.Root
//           value={(completedCount / files.length) * 100}
//           variant="outline"
//           size="lg"
//           colorPalette="black"
//           striped
//           animated
//         >
//           <Progress.Track>
//             <Progress.Range />
//           </Progress.Track>
//           <Progress.ValueText>
//             {Math.round((completedCount / files.length) * 100)}%
//           </Progress.ValueText>
//         </Progress.Root>
//       )}

//       {showScanner && (
//         <div>
//           <BarcodeScanner onScanSuccess={handleScanSuccess} />
//           <Button colorScheme="red" onClick={() => setShowScanner(false)}>
//             Cancel
//           </Button>
//         </div>
//       )}
//       {/* {extraComponents} */}
//       <Button
//         type="submit"
//         colorPalette="blue"
//         variant="surface"
//         disabled={isSubmitting || (isFormEmpty && isFileEmpty)}
//       >
//         {isSubmitting ? "Registering..." : "Registration"}
//       </Button>
//     </Stack>
//   </form>
//   {searchResults.length > 0 && (
//     <Stack>
//       <SearchSelection results={searchResults} onSelect={onSelect} />
//     </Stack>
//   )}
// </div>

function parseSalesDate(salesDate: string): string {
  // 「頃」「以降」などの不要な文字を削除
  const cleanedDate = salesDate.replace(/(頃|以降|上旬|中旬|下旬)/g, "");

  // 「YYYY年MM月DD日」のフォーマットに一致する場合
  if (/^\d{4}年\d{2}月\d{2}日$/.test(cleanedDate)) {
    return cleanedDate.replace(/年|月/g, "-").replace(/日/, "");
  }

  // 「YYYY年MM月」の場合 → `YYYY-MM-01` とする
  if (/^\d{4}年\d{2}月$/.test(cleanedDate)) {
    return cleanedDate.replace(/年/, "-").replace(/月/, "-01");
  }

  // 「YYYY年」の場合 → `YYYY-01-01` とする
  if (/^\d{4}年$/.test(cleanedDate)) {
    return cleanedDate.replace(/年/, "-01-01");
  }

  // 不明なフォーマットなら空文字を返す
  return "";
}
