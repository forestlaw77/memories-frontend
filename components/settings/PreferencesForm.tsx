/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module PreferencesForm
 * @description
 * A form component that aggregates all user-configurable settings.
 * Includes general, audio, security, display, and resource filter settings.
 */

"use client";

import { Stack } from "@chakra-ui/react";
import AudioSettings from "./AudioSettings";
import DisplaySettings from "./DisplaySettings";
import GeneralSettings from "./GeneralSettings";
import ResourceFilterSettings from "./ResourceFilterSettings";
import SecuritySettings from "./SecuritySettings";

export type PreferencesFormProps = {};

/**
 * Renders a vertical stack of settings components.
 * Each section is modular and self-contained.
 *
 * @returns JSX.Element
 * @todo Implement preload settings (boolean toggle or select)
 * @todo Implement default filter settings for search
 */
export default function PreferencesForm(props: PreferencesFormProps) {
  return (
    <Stack gap="6" maxW="sm" css={{ "--field-label-width": "128px" }}>
      <GeneralSettings />
      <AudioSettings />
      <SecuritySettings />
      <DisplaySettings />
      <ResourceFilterSettings />
    </Stack>
  );
}
