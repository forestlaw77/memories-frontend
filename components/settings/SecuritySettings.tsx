// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { MAX_AGE } from "@/config/settings";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { Box, Field, Heading, NumberInput } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";

export default function SecuritySettings() {
  const { settings, dispatch } = useGlobalSettings();
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
          <Field.Label whiteSpace="nowrap"> Auto Logout (minutes) </Field.Label>
          <NumberInput.Root
            value={String(settings.logoutAfterMinutes)}
            min={5}
            max={MAX_AGE / 60}
            onValueChange={(e) =>
              dispatch({ type: "logoutAfterMinutes", value: Number(e.value) })
            }
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>

        {/* 警告表示タイミング */}
        <Field.Root orientation="horizontal">
          <Field.Label whiteSpace="nowrap">
            Warning Before Logout (min)
          </Field.Label>
          <NumberInput.Root
            value={String(settings.warningBeforeMinutes)}
            min={1}
            max={settings.logoutAfterMinutes}
            onValueChange={(e) =>
              dispatch({
                type: "warningBeforeMinutes",
                value: Number(e.value),
              })
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
