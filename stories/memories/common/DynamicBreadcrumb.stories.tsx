import type { DynamicBreadcrumbProps } from "@/components/common/DynamicBreadcrumb";
import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import type { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta<DynamicBreadcrumbProps> = {
  component: DynamicBreadcrumb,
  title: "Components/common/DynamicBreadcrumb",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<DynamicBreadcrumbProps>;

// export const Default: Story = {
//   render: () => <DynamicBreadcrumb />,
// };

export const WithMockedPath: Story = {
  render: () => (
    <DynamicBreadcrumb
      pathname="/resources/memories"
      searchParams={new URLSearchParams({ page: "2", sort: "recent" })}
    />
  ),
};

export const WithBackLinkOverride: Story = {
  render: () => (
    <DynamicBreadcrumb
      pathname="/settings/audio"
      searchParams={new URLSearchParams()}
      backLinkOverride="/settings"
    />
  ),
};
