import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { AlertBanner } from "./alert-banner";

const meta = {
  title: "Feedback/AlertBanner",
  component: AlertBanner,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Inline alert for page-level notices. Prefer AlertBanner for persistent status; use toasts for transient feedback.",
      },
    },
  },
  args: {
    title: "Production deployment requires approval",
    description: "A reviewer must approve before this release can ship.",
    onDismiss: fn(),
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["success", "error", "warning", "info", "neutral"],
    },
    dismissible: { control: "boolean" },
  },
} satisfies Meta<typeof AlertBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warning: Story = {
  args: { tone: "warning" },
};

export const Success: Story = {
  args: {
    tone: "success",
    title: "Changes saved",
    description: "Your organization settings were updated.",
  },
};

export const Error: Story = {
  args: {
    tone: "error",
    title: "Deployment failed",
    description: "The build exited with a non-zero status.",
  },
};

export const Info: Story = {
  args: {
    tone: "info",
    title: "Maintenance window",
    description: "Scheduled for Sunday 02:00–04:00 UTC.",
  },
};

export const Dismissible: Story = {
  args: {
    tone: "info",
    dismissible: true,
  },
};
