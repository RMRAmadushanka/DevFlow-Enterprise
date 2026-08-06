import * as React from "react";
import type { Decorator } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";

import { TooltipProvider } from "../src/components/ui/tooltip";

/**
 * Light / dark toggle using the same `.dark` class strategy as next-themes
 * and `globals.css` (`@custom-variant dark (&:is(.dark *))`).
 */
export const withTheme: Decorator = withThemeByClassName({
  themes: {
    light: "",
    dark: "dark",
  },
  defaultTheme: "dark",
  parentSelector: "html",
});

/** Shared providers required by many DevFlow primitives. */
export const withProviders: Decorator = (Story) => (
  <TooltipProvider>
    <div className="min-h-screen bg-background p-6 text-foreground antialiased">
      <Story />
    </div>
  </TooltipProvider>
);

export const decorators: Decorator[] = [withTheme, withProviders];
