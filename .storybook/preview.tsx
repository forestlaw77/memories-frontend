import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import type { Preview } from "@storybook/nextjs-vite";
import { MockGlobalSettingsProvider } from "../mocks/contexts/MockGlobalSettingsProvider";

export const decorators = [
  (Story) => (
    <ChakraProvider value={defaultSystem}>
      <MockGlobalSettingsProvider>
        <Story />
      </MockGlobalSettingsProvider>
    </ChakraProvider>
  ),
];

const preview: Preview = {
  decorators: decorators,
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
