import {
  renderStudioFooterHtml,
  studioFromProjects,
  studioProjectsFeed,
} from "./html.js";
import { bindFooter } from "./behaviour.js";
const attributes = [
  "product",
  "url",
  "summary",
  "catalog-id",
  "feedback-key",
  "subscribe-key",
  "capture",
  "variant",
  "art-mode",
  "wordmark",
  "privacy-url",
  "legal",
  "class-name",
  "ref",
  "studio-from-projects",
];
export class StudioFooterElement extends HTMLElement {
  static observedAttributes = attributes;
  #config = {};
  #ready = false;
  #revision = 0;
  get config() {
    return this.#config;
  }
  set config(value) {
    this.#config = value ?? {};
    if (this.#ready) this.render();
  }
  connectedCallback() {
    // Module scripts are deferred; a property assigned before upgrade is preserved.
    if (Object.hasOwn(this, "config")) {
      const value = this.config;
      delete this.config;
      this.config = value;
    }
    if (this.#ready) return;
    this.#ready = true;
    if (!this.querySelector("footer[data-fleet-footer]")) this.render();
    else this.updateStrip(this.readConfig());
    bindFooter(this);
  }
  attributeChangedCallback() {
    if (this.#ready) this.render();
  }
  readConfig() {
    const json = this.querySelector('script[type="application/json"]');
    const config = {
      ...(json ? JSON.parse(json.textContent) : {}),
      ...this.#config,
    };
    for (const name of attributes)
      if (this.hasAttribute(name)) {
        config[name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] =
          this.getAttribute(name);
      }
    if (config.capture === "false") config.capture = false;
    if (config.studioFromProjects === "") config.studioFromProjects = true;
    if (config.studioFromProjects === "false")
      config.studioFromProjects = false;
    return config;
  }
  render() {
    const config = this.readConfig();
    if (typeof config.product !== "string") return;
    const html = renderStudioFooterHtml(config);
    // Keep JSON config outside the replaceable footer.
    this.querySelector("footer[data-fleet-footer]")?.remove();
    this.insertAdjacentHTML("beforeend", html);
    this.updateStrip(config);
  }
  updateStrip(config) {
    const revision = ++this.#revision;
    if (
      config.studioFromProjects &&
      !config.studio?.length &&
      !config.projects
    ) {
      fetch(
        typeof config.studioFromProjects === "string" &&
          config.studioFromProjects !== "true"
          ? config.studioFromProjects
          : studioProjectsFeed,
        { credentials: "omit" },
      )
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => [])
        .then((projects) => {
          if (revision !== this.#revision || !this.isConnected) return;
          const studio = studioFromProjects(projects, {
            current: config.catalogId,
            limit: config.studioLimit,
          });
          // Update only the strip; preserve form edits and dialog state.
          const template = document.createElement("template");
          template.innerHTML = renderStudioFooterHtml({ ...config, studio });
          this.querySelector('nav[aria-label="From the studio"]')?.replaceWith(
            template.content.querySelector('nav[aria-label="From the studio"]'),
          );
        });
    }
  }
}
if (!customElements.get("studio-footer"))
  customElements.define("studio-footer", StudioFooterElement);
