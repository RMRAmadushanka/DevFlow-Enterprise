import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Plus } from "lucide-react";

import { Button } from "./button";

/**
 * Primary interactive control for actions across DevFlow.
 *
 * Prefer semantic variants (`default`, `outline`, `destructive`) over
 * one-off styling. Always pair icon-only buttons with an accessible name.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Base action button. Supports variants, sizes, disabled state, and icons. Use Controls to explore props; Actions logs clicks.",
      },
    },
  },
  args: {
    children: "Button",
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
      description: "Visual style of the button",
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
      description: "Padding and typography scale",
    },
    disabled: {
      control: "boolean",
      description: "Disables pointer and keyboard activation",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
};

export const Link: Story = {
  args: { variant: "link", children: "Learn more" },
};

export const Small: Story = {
  args: { size: "sm", children: "Small" },
};

export const Large: Story = {
  args: { size: "lg", children: "Large" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus data-icon="inline-start" />
        Create project
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    size: "icon",
    "aria-label": "Add",
    children: <Plus />,
  },
};
