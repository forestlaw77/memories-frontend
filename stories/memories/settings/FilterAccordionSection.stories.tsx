import FilterAccordionSection from "@/components/settings/FilterAccordionSection";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof FilterAccordionSection> = {
  title: "Settings/FilterAccordionSection",
  tags: ["autodocs"],
  component: FilterAccordionSection,
};

export default meta;
export const Default: StoryObj<typeof FilterAccordionSection> = {
  name: "Default",
  args: {},
};
