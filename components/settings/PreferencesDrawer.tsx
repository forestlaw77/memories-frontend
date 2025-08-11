// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { CloseButton, Drawer, Portal } from "@chakra-ui/react";
import { MdSettings } from "react-icons/md";
import PreferencesForm from "./PreferencesForm";

export function PreferencesDrawer({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      placement="end"
    >
      <Portal>
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <MdSettings style={{ marginRight: "8px" }} />
              Preferences
            </Drawer.Header>
            <Drawer.Body>
              <PreferencesForm />
            </Drawer.Body>
            <Drawer.Footer></Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
