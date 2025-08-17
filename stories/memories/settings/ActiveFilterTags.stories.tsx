import ActiveFilterTags from "@/components/settings/ActiveFilterTags";
import { GlobalSettingsContextType } from "@/contexts/globalSettingsTypes";
import { MockGlobalSettingsProvider } from "@/mocks/contexts/MockGlobalSettingsProvider";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<typeof ActiveFilterTags> = {
  title: "Settings/ActiveFilterTags",
  component: ActiveFilterTags,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ChakraProvider value={defaultSystem}>
        <Story />
      </ChakraProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ActiveFilterTags>;

const mockSettings: GlobalSettingsContextType["settings"] = {
  searchQuery: "sunset",
  filterCountry: "Japan",
  filterGenre: "Nature",
  filterDateFrom: "2023-01-01",
  filterDateTo: "2023-12-31",
  // 他の設定は省略またはデフォルト
} as const;

export const Default: Story = {
  render: () => (
    <MockGlobalSettingsProvider
      override={{
        settings: mockSettings,
        dispatch: console.log, // jest.fn()
      }}
    >
      <ActiveFilterTags setPage={(page) => console.log("Set page:", page)} />
    </MockGlobalSettingsProvider>
  ),
};
