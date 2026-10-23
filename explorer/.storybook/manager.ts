import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  layoutCustomisations: {
    showPanel: (state, defaultValue) => state.storyId === "start-here-overview--explore" ? false : defaultValue,
  },
  sidebar: { collapsedRoots: ["inputs", "navigation", "overlays", "feedback", "data", "interactions", "motion", "effects", "blocks", "templates", "native"] },
  theme: create({
    base: "dark",
    brandTitle: "Fleet UI · component explorer",
    brandUrl: "https://github.com/sass-maker/ui-library",
    brandTarget: "_blank",
    colorPrimary: "#91a7ff",
    colorSecondary: "#91a7ff",
    appBg: "#111113",
    appContentBg: "#19191c",
    appPreviewBg: "#111113",
    appBorderColor: "#303036",
    textColor: "#eeeeef",
    textMutedColor: "#a1a1aa",
  }),
});
