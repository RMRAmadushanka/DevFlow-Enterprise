import type { Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";
import { decorators } from "./decorators";
import { devflowStorybookTheme } from "./theme";

const preview: Preview = {
  decorators,
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    actions: {
      argTypesRegex: "^on[A-Z].*",
    },
    layout: "centered",
    docs: {
      theme: devflowStorybookTheme,
      toc: true,
    },
    options: {
      storySort: {
        order: [
          "Foundation",
          "UI",
          "Forms",
          "Data Display",
          "Feedback",
          "Navigation",
          "Dashboard",
          "Layout",
          "*",
        ],
      },
    },
    a11y: {
      // Surface violations in the Accessibility panel; promote to "error" in CI later.
      test: "todo",
    },
    backgrounds: {
      disable: true,
    },
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  initialGlobals: {
    theme: "dark",
  },
};

export default preview;
