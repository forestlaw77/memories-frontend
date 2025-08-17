import { ColorModeToggle } from "@/components/common/ColorModeToggle";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/nextjs";
import { ThemeProvider } from "next-themes";
import { JSX } from "react";

/**
 * Wraps the story in ChakraProvider and ThemeProvider to ensure theme context is available.
 */
function withProviders(Story: () => JSX.Element) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider attribute="class">
        <Story />
      </ThemeProvider>
    </ChakraProvider>
  );
}

const meta: Meta<typeof ColorModeToggle> = {
  title: "Components/common/ColorModeToggle",
  tags: ["autodocs"],
  component: ColorModeToggle,
  decorators: [withProviders],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof ColorModeToggle>;

/**
 * Default story showing the toggle button.
 */
export const Default: Story = {};
