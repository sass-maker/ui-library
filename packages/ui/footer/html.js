import {
  StudioFooter,
  studioFromProjects,
  withRef,
} from "../src/blocks/footer.tsx";
import { toHtml } from "./html-runtime.js";
export {
  studioFromProjects,
  withRef,
  defaultStudio,
  studioProjectsFeed,
  studioProjectsPage,
} from "../src/blocks/footer.tsx";
export function renderStudioFooterHtml(props) {
  const config = { summary: "", groups: [], ...props };
  for (const [name, value] of [
    ["summary", config.summary], ["legal", config.legal], ["mark", config.mark],
    ["cta.label", config.cta?.label], ["art.credit", config.art?.credit],
  ]) {
    if (value != null && typeof value === "object")
      throw new TypeError(name + " must be text");
  }
  if (config.projects && !config.studio?.length)
    config.studio = studioFromProjects(config.projects, {
      current: config.catalogId,
      limit: config.studioLimit,
    });
  // ref is an optional static-only override; catalogId remains the audit/key identity.
  let html = toHtml(StudioFooter(config));
  if (config.ref) {
    // Replace only sibling hrefs, never product routes or privacy links.
    html = html.replace(
      /(<nav aria-label="From the studio"[\s\S]*?<\/nav>)/,
      (nav) =>
        nav.replace(/href="([^"]+)"/g, (attr, href) => {
          if (href === "https://sassmaker.com/projects") return attr;
          const decoded = href.replace(/&amp;/g, "&");
          return (
            'href="' +
            withRef(decoded, config.ref)
              .replace(/&/g, "&amp;")
              .replace(/"/g, "&quot;") +
            '"'
          );
        }),
    );
  }
  return html;
}
