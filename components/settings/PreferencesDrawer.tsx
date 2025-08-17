/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module PreferencesDrawer
 * @description
 * A drawer component that displays the `PreferencesForm` UI.
 * Used to configure global application settings in a side panel.
 */

"use client";

import { CloseButton, Drawer, Portal } from "@chakra-ui/react";
import { MdSettings } from "react-icons/md";
import PreferencesForm from "./PreferencesForm";

export type PreferencesDrawerProps = {
  isOpen: boolean;
  onOpenChange: () => void;
};

/**
 * Renders a side drawer containing the preferences form.
 * Controlled via `isOpen` and `onOpenChange` props.
 *
 * @param isOpen - Whether the drawer is currently open
 * @param onOpenChange - Callback to toggle drawer visibility
 * @returns JSX.Element
 */
export default function PreferencesDrawer({
  isOpen,
  onOpenChange,
}: PreferencesDrawerProps) {
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
