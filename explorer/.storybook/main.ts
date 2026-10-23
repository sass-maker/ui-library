import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { exampleSourcePlugin } from "../scripts/example-source.ts";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  staticDirs: ["../../site/public"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  core: { disableTelemetry: true },
  docs: { defaultName: "Guide" },
  async viteFinal(config) {
    config.base = "./";
    config.plugins = [...(config.plugins ?? []), tailwindcss(), exampleSourcePlugin()];
    return config;
  },
};

export default config;
