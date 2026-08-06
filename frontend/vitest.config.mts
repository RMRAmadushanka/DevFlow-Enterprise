import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const rootDir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));

/**
 * Two Vitest projects:
 * - `unit` — default `npm test` (jsdom + RTL)
 * - `storybook` — optional browser tests via `npm run test:storybook`
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          css: false,
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["node_modules", ".next", "**/*.stories.*"],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(rootDir, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
