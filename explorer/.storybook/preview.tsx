import type { Preview } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { TooltipProvider } from "@saas-maker/ui/components/tooltip";
import { ReducedMotionProvider } from "@saas-maker/ui/lib/use-reduced-motion";
import "./preview.css";

function ThemeFrame({ children, theme, mode, reduced }: {
  children: React.ReactNode; theme: string; mode: string; reduced: boolean;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.mode = mode;
    root.dataset.motion = reduced ? "reduced" : "user";
    root.style.colorScheme = mode;
  }, [theme, mode, reduced]);
  return (
    <ReducedMotionProvider reduced={reduced ? true : undefined}>
      <MotionConfig reducedMotion={reduced ? "always" : "user"}>
        <TooltipProvider>
          <div data-theme={theme} data-mode={mode} className="fleet-story-frame">{children}</div>
        </TooltipProvider>
      </MotionConfig>
    </ReducedMotionProvider>
  );
}

const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: { theme: "base", mode: "dark", motion: "user" },
  globalTypes: {
    theme: { description: "Fleet theme", toolbar: { icon: "paintbrush", dynamicTitle: true, items: ["base", "paper", "hearth", "signal", "gallery", "ink"].map(value => ({ value, title: value })) } },
    mode: { description: "Color mode", toolbar: { icon: "circlehollow", dynamicTitle: true, items: [{ value: "light", title: "Light" }, { value: "dark", title: "Dark" }] } },
    motion: { description: "Motion preference", toolbar: { icon: "play", dynamicTitle: true, items: [{ value: "user", title: "System motion" }, { value: "reduced", title: "Reduced motion" }] } },
  },
  decorators: [(Story, context) => <ThemeFrame theme={context.globals.theme} mode={context.globals.mode} reduced={context.globals.motion === "reduced"}><Story /></ThemeFrame>],
  parameters: {
    layout: "padded",
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    docs: { codePanel: true, toc: true, source: { type: "dynamic" } },
    options: { storySort: { order: ["Start here", "Foundations", "Inputs", "Navigation", "Overlays", "Feedback", "Data", "Interactions", "Motion", "Effects", "Blocks", "Templates", "Native"] } },
    viewport: {
      options: {
        phone: { name: "Phone · 390", styles: { width: "390px", height: "844px" } },
        tablet: { name: "Tablet · 768", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop · 1440", styles: { width: "1440px", height: "900px" } },
      },
    },
    a11y: { test: "error" },
  },
};

export default preview;
