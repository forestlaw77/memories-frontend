import DisplaySettings from "@/components/settings/DisplaySettings";
import type { Meta, StoryObj } from "@storybook/nextjs";

// ✅ Storybook メタ定義
const meta: Meta<typeof DisplaySettings> = {
  title: "Settings/DisplaySettings",
  tags: ["autodocs"],
  component: DisplaySettings,
};

export default meta;
type Story = StoryObj<typeof DisplaySettings>;

export const Default: Story = {};
