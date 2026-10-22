/**
 * Worker-site build targets: prebuilt static sites that keep their own
 * Cloudflare Worker (routes, headers, 404/HEAD handling). They sit beside the
 * Astro products selected with PRODUCT=<id>; they are never part of
 * `pnpm run deploy` (Pages only) and deploy one at a time through
 * scripts/deploy-worker-site.mjs.
 *
 * `renderer` names how the site's assets are produced. "static" serves the
 * checked-in `public/` directory unchanged. A future "ui-library" renderer can
 * write the same directory from a content file without changing the Worker.
 */
export const WORKER_SITES = {
  daddyrad: {
    renderer: "static",
    dir: "sites/daddyrad",
    worker: "daddyrad",
    routes: ["daddyrad.com", "www.daddyrad.com"],
    tests: ["worker.test.mjs", "app-health-events.test.mjs"],
    source: {
      repository: "Significant-Hobbies/daddyrad",
      path: "site",
      revision: "bfdd8a813deff13fbc9a342ff865a28a50b724e3"
    }
  }
};

export const WORKER_SITE_IDS = Object.keys(WORKER_SITES);

/** Parse wrangler.jsonc (line comments allowed) and confirm it matches the registry. */
export function verifyWranglerConfig(id, text) {
  const site = WORKER_SITES[id];
  if (!site) throw new Error(`Unknown worker site "${id}". Known: ${WORKER_SITE_IDS.join(", ")}.`);
  const config = JSON.parse(text.replace(/^\s*\/\/.*$/gm, ""));
  if (config.name !== site.worker) {
    throw new Error(`${id}: wrangler name "${config.name}" must be "${site.worker}".`);
  }
  const routes = (config.routes || []).map((route) => {
    if (!route.custom_domain) throw new Error(`${id}: route ${route.pattern} must be a custom domain.`);
    return route.pattern;
  });
  if (JSON.stringify(routes) !== JSON.stringify(site.routes)) {
    throw new Error(`${id}: routes ${routes.join(", ")} must equal ${site.routes.join(", ")}.`);
  }
  if (config.workers_dev !== false || config.preview_urls !== false) {
    throw new Error(`${id}: workers.dev and preview URLs must stay disabled.`);
  }
  return config;
}
