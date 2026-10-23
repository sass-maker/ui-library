import type { Preview } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useEffect, useLayoutEffect } from "react";
import { TooltipProvider } from "@saas-maker/ui/components/tooltip";
import { ReducedMotionProvider } from "@saas-maker/ui/lib/use-reduced-motion";
import { initMotion } from "@saas-maker/motion";
import { motionTiming } from "@saas-maker/ui/lib/motion";
import { ExampleShell } from "../stories/example-shell";
import "./preview.css";

function ThemeFrame({ children, theme, mode, reduced, motionKey }: {
  children: React.ReactNode; theme: string; mode: string; reduced: boolean; motionKey: string;
}) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.themeChanging = "true";
    root.dataset.theme = theme;
    root.dataset.mode = mode;
    root.dataset.motion = reduced ? "reduced" : "user";
    root.style.colorScheme = mode;
    void root.offsetHeight;
    const frame = requestAnimationFrame(() => { delete root.dataset.themeChanging; });
    return () => { cancelAnimationFrame(frame); delete root.dataset.themeChanging; };
  }, [theme, mode, reduced]);
  useEffect(() => initMotion(), [motionKey, theme, mode, reduced]);
  return <ReducedMotionProvider reduced={reduced ? true : undefined}>
    <MotionConfig reducedMotion={reduced ? "always" : "user"} transition={motionTiming.layout}>
      <TooltipProvider><div data-theme={theme} data-mode={mode} className="fleet-story-frame">{children}</div></TooltipProvider>
    </MotionConfig>
  </ReducedMotionProvider>;
}

const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: { theme: "base", mode: "dark", motion: "user" },
  globalTypes: {
    theme: { description: "Fleet theme", toolbar: { icon: "paintbrush", dynamicTitle: true, items: ["base", "paper", "hearth", "signal", "gallery", "ink"].map(value => ({ value, title: value })) } },
    mode: { description: "Color mode", toolbar: { icon: "circlehollow", dynamicTitle: true, items: [{ value: "light", title: "Light" }, { value: "dark", title: "Dark" }] } },
    motion: { description: "Motion preference", toolbar: { icon: "play", dynamicTitle: true, items: [{ value: "user", title: "System motion" }, { value: "reduced", title: "Reduced motion" }] } },
  },
  decorators: [(Story, context) => {
    const description = context.parameters.docs?.description?.component;
    const importPath = typeof description === "string" ? description.match(/@saas-maker\/ui\/[a-z/-]+/)?.[0] : undefined;
    return <ThemeFrame motionKey={context.id} theme={context.globals.theme} mode={context.globals.mode} reduced={context.globals.motion === "reduced"}>
      <ExampleShell title={context.title} name={context.name} description={description} importPath={importPath}><Story /></ExampleShell>
    </ThemeFrame>;
  }],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    docs: { codePanel: true, toc: true, source: { type: "dynamic" } },
    options: { storySort: { order: ["Start here", "Foundations", "Atoms", "Molecules", "Organisms", "Templates", "Native"] } },
    viewport: { options: {
      phone: { name: "Phone · 390", styles: { width: "390px", height: "844px" } },
      tablet: { name: "Tablet · 768", styles: { width: "768px", height: "1024px" } },
      desktop: { name: "Desktop · 1440", styles: { width: "1440px", height: "900px" } },
    } },
    a11y: { test: "error" },
  },
};
export default preview;
