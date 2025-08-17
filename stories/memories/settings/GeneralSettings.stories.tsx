import GeneralSettings from "@/components/settings/GeneralSettings";
import type { Meta, StoryObj } from "@storybook/nextjs";

// ✅ Storybook メタ定義
const meta: Meta<typeof GeneralSettings> = {
  title: "Settings/GeneralSettings",
  tags: ["autodocs"],
  component: GeneralSettings,
};

export default meta;
type Story = StoryObj<typeof GeneralSettings>;

export const Default: Story = {};
