/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This Storybook file is licensed under the same terms as the component:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 *
 * @module PreferencesDrawer.stories
 * @description
 * Storybook stories for the `PreferencesDrawer` component.
 * Demonstrates drawer behavior and preferences form integration.
 */

import PreferencesDrawer from "@/components/settings/PreferencesDrawer";
import { MockGlobalSettingsProvider } from "@/mocks/contexts/MockGlobalSettingsProvider";
import { Button, ChakraProvider, defaultSystem } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

const meta: Meta<typeof PreferencesDrawer> = {
  component: PreferencesDrawer,
  title: "Settings/PreferencesDrawer",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof PreferencesDrawer>;

/**
 * A basic story showing the drawer in an open state.
 */
export const Open: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <ChakraProvider value={defaultSystem}>
        <MockGlobalSettingsProvider>
          <PreferencesDrawer
            isOpen={isOpen}
            onOpenChange={() => setIsOpen((prev) => !prev)}
          />
        </MockGlobalSettingsProvider>
      </ChakraProvider>
    );
  },
  name: "Open Drawer",
};

/**
 * A story showing the drawer initially closed, with a toggle button.
 */
export const Toggleable: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <ChakraProvider value={defaultSystem}>
        <MockGlobalSettingsProvider>
          <Button onClick={() => setIsOpen(true)}>Open Preferences</Button>
          <PreferencesDrawer
            isOpen={isOpen}
            onOpenChange={() => setIsOpen(false)}
          />
        </MockGlobalSettingsProvider>
      </ChakraProvider>
    );
  },
  name: "Toggleable Drawer",
};
