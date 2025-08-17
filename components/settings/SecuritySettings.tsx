/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module SecuritySettings
 */

"use client";

import { MAX_AGE } from "@/config/settings";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { Box, Field, Heading, NumberInput } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";

/**
 * Props for `SecuritySettings`.
 * Currently unused, but reserved for future extensibility.
 */
export type SecuritySettingsProps = {};

/**
 * SecuritySettings component allows users to configure auto logout behavior.
 *
 * It provides two numeric inputs:
 * - Auto Logout (minutes): how long the session lasts before automatic logout
 * - Warning Before Logout (minutes): when to show a warning before logout
 *
 * Values are constrained by MAX_AGE and current settings.
 *
 * @returns A styled Chakra UI box with two configurable fields.
 */
export default function SecuritySettings(props: SecuritySettingsProps) {
  const { settings, updateSetting } = useGlobalSettings();

  return (
    <>
      <Heading size="sm">Security</Heading>
      <Box
        border="2px"
        shadow={useColorModeValue("sm", "md")}
        borderRadius="md"
        borderColor={useColorModeValue("gray.300", "gray.600")}
        bgColor={useColorModeValue("gray.50", "gray.800")}
      >
        {/* Auto Logout */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap">Auto Logout (minutes)</Field.Label>
          <NumberInput.Root
            value={String(settings.logoutAfterMinutes)}
            min={5}
            max={MAX_AGE / 60}
            onValueChange={(e) =>
              updateSetting("logoutAfterMinutes", Number(e.value))
            }
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>

        {/* Warning Before Logout */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap">
            Warning Before Logout (min)
          </Field.Label>
          <NumberInput.Root
            value={String(settings.warningBeforeMinutes)}
            min={1}
            max={settings.logoutAfterMinutes}
            onValueChange={(e) =>
              updateSetting("warningBeforeMinutes", Number(e.value))
            }
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
      </Box>
    </>
  );
}
