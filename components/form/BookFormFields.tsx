// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { Button, Field, Input } from "@chakra-ui/react";
import { useState } from "react";
import BarcodeScanner from "./BarcodeScanner";

export default function BookFormFields({
  formData,
  setFormData,
}: {
  formData: { [key: string]: string };
  setFormData: (formData: { [key: string]: string }) => void;
}) {
  const [showScanner, setShowScanner] = useState(false);

  function handleScanSuccess(isbn: string) {
    setFormData({ ...formData, isbn });
    setShowScanner(false);
  }

  return (
    <>
      <Field.Root orientation="horizontal">
        <Field.Label>ISBN</Field.Label>
        <Input type="text" name="isbn" value={formData.isbn || ""} readOnly />
        <Button colorScheme="blue" onClick={() => setShowScanner(true)}>
          Scan
        </Button>
      </Field.Root>

      {showScanner && (
        <div>
          <BarcodeScanner onScanSuccess={handleScanSuccess} />
          <Button colorScheme="red" onClick={() => setShowScanner(false)}>
            Cancel
          </Button>
        </div>
      )}
    </>
  );
}
