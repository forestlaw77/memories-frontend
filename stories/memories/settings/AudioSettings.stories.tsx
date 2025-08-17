/**
 * @file AudioSettings.stories.tsx
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This Storybook file is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this file for commercial purposes under the MIT License.
 *
 * @module AudioSettingsStory
 * @description
 * Storybook stories for the `AudioSettings` component.
 * Demonstrates global audio preferences such as BGM toggle, volume control, and playlist display.
 */

import AudioSettings from "@/components/settings/AudioSettings";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof AudioSettings> = {
  title: "Settings/AudioSettings",
  tags: ["autodocs"],
  component: AudioSettings,
};

export default meta;
export const Default: StoryObj<typeof AudioSettings> = {
  name: "Default",
  args: {},
};
