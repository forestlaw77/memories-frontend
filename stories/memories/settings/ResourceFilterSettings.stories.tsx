import ResourceFilterSettings from "@/components/settings/ResourceFilterSettings";
import type { Meta, StoryObj } from "@storybook/nextjs";

// ✅ Storybook メタ定義
const meta: Meta<typeof ResourceFilterSettings> = {
  title: "Settings/ResourceFilterSettings",
  tags: ["autodocs"],
  component: ResourceFilterSettings,
};

export default meta;
type Story = StoryObj<typeof ResourceFilterSettings>;

export const Default: Story = {};
