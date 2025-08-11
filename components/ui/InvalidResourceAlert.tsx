// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { Alert } from "@chakra-ui/react";

export default function InvalidResourceAlert({
  resourceType,
}: {
  resourceType: string;
}) {
  console.error(`Invalid resourceType: ${resourceType}`);

  return (
    <Alert.Root status="warning">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Unsupported resource type: {resourceType}</Alert.Title>
      </Alert.Content>
    </Alert.Root>
  );
}
