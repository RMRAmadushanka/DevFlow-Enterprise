import { create } from "storybook/theming";

/**
 * Storybook manager chrome theme — mirrors DevFlow dark-first branding.
 * Story canvas themes (light/dark) are controlled via addon-themes + `.dark`.
 */
export const devflowStorybookTheme = create({
  base: "dark",
  brandTitle: "DevFlow Design System",
  brandUrl: "/",
  brandTarget: "_self",

  colorPrimary: "#6366f1",
  colorSecondary: "#38bdf8",

  appBg: "#08090b",
  appContentBg: "#0f1013",
  appPreviewBg: "#0f1013",
  appBorderColor: "#212227",
  appBorderRadius: 8,

  textColor: "#f2f3f5",
  textMutedColor: "#9a9ea6",

  barTextColor: "#a1a5ad",
  barSelectedColor: "#818cf8",
  barBg: "#131418",

  inputBg: "#191a1f",
  inputBorder: "#26272e",
  inputTextColor: "#f2f3f5",
  inputBorderRadius: 8,
});
