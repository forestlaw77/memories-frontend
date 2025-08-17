import PreferencesForm from "@/components/settings/PreferencesForm";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof PreferencesForm> = {
  title: "Settings/PreferencesForm",
  tags: ["autodocs"],
  component: PreferencesForm,
};

export default meta;

export const Default: StoryObj<typeof PreferencesForm> = {
  name: "Default",
  args: {},
};
