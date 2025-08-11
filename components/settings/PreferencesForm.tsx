// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { Stack } from "@chakra-ui/react";
import AudioSettings from "./AudioSettings";
import DisplaySettings from "./DisplaySettings";
import { GeneralSettings } from "./GeneralSettings";
import ResourceFilterSettings from "./ResourceFilterSettings";
import SecuritySettings from "./SecuritySettings";

export default function PreferencesForm() {
  return (
    <Stack gap="6" maxW="sm" css={{ "--field-label-width": "128px" }}>
      <GeneralSettings />
      <AudioSettings />
      <SecuritySettings />
      <DisplaySettings />
      <ResourceFilterSettings />

      {/* TODO: プリロード設定の実装（booleanトグル or セレクト） */}
      {/* TODO: 検索のデフォルトフィルタ設定の実装 */}
    </Stack>
  );
}
