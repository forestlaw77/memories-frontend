import SecuritySettings from "@/components/settings/SecuritySettings";
import type { Meta, StoryObj } from "@storybook/nextjs";

// ✅ Storybook メタ定義
const meta: Meta<typeof SecuritySettings> = {
  title: "Settings/SecuritySettings",
  tags: ["autodocs"],
  component: SecuritySettings,
};

export default meta;
type Story = StoryObj<typeof SecuritySettings>;

export const Default: Story = {};
