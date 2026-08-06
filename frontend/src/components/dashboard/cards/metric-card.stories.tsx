import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FolderKanban } from "lucide-react";

import { MetricCard } from "./metric-card";

const meta = {
  title: "Dashboard/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "KPI tile for dashboards. Pass pre-formatted values; do not fetch data inside the card.",
      },
    },
  },
  args: {
    title: "Active Projects",
    value: 24,
    change: 12,
    changeLabel: "Compared to last month",
    icon: <FolderKanban />,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "danger"],
    },
    loading: { control: "boolean" },
    change: { control: "number" },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = {
  args: { variant: "success", change: 8 },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Open incidents",
    value: 3,
    change: 1,
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    title: "Failed deploys",
    value: 5,
    change: -2,
    trend: "down",
  },
};

export const Loading: Story = {
  args: { loading: true },
};
