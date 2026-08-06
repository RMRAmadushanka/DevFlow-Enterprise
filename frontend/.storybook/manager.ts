import { addons } from "storybook/manager-api";

import { devflowStorybookTheme } from "./theme";

addons.setConfig({
  theme: devflowStorybookTheme,
});
