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
