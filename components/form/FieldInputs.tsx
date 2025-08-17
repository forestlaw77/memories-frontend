// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { resolveCountryCode } from "@/libs/maps/country_name_to_iso";
import { FieldConfig } from "@/types/formDataMap";
import {
  Button,
  Field,
  Input,
  NativeSelect,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
// import BarcodeScanner from "react-qr-barcode-scanner";

interface FieldInputsProps {
  fields: FieldConfig[];
  formData: Record<string, string>;
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  barcodeSupport?: {
    enabled: boolean;
    showScanner: boolean;
    setShowScanner: (value: boolean) => void;
    onScanSuccess: (code: string) => void;
  };
}

export function FieldInputs({
  fields,
  formData,
  onChange,
  barcodeSupport,
}: FieldInputsProps) {
  return (
    <Stack gap={6}>
      {fields.map(
        ({ fieldName, label, type, isSearchable, placeholder, options }) => (
          <Field.Root key={fieldName} orientation="horizontal">
            <Field.Label>
              {label}
              {isSearchable && (
                <Text as="span" color="red">
                  (*)
                </Text>
              )}
            </Field.Label>
            {type === "textarea" ? (
              <Textarea
                name={fieldName}
                placeholder={placeholder}
                value={formData[fieldName] || ""}
                onChange={onChange}
              />
            ) : type === "barcode" ? (
              <>
                <Input
                  type="text"
                  name={fieldName}
                  placeholder={placeholder}
                  value={formData[fieldName] || ""}
                  onChange={onChange}
                />
                <Button
                  colorPalette="blue"
                  variant="surface"
                  onClick={() => barcodeSupport?.setShowScanner(true)}
                >
                  Scan
                </Button>
              </>
            ) : type === "select" ? (
              <NativeSelect.Root>
                <NativeSelect.Field
                  name={fieldName}
                  placeholder={placeholder}
                  value={resolveCountryCode(formData[fieldName]) || undefined}
                  onChange={onChange}
                >
                  {options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            ) : (
              <Input
                type={type}
                name={fieldName}
                placeholder={placeholder}
                value={formData[fieldName] || ""}
                onChange={onChange}
              />
            )}
          </Field.Root>
        )
      )}
      {barcodeSupport?.showScanner && (
        <div>
          {/*  <BarcodeScanner onScanSuccess={barcodeSupport?.onScanSuccess} /> */}
          <Button
            colorPalette="red"
            onClick={() => barcodeSupport?.setShowScanner(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </Stack>
  );
}
