// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  StudioFooter,
  studioFromProjects as reactProjects,
  withRef as reactRef,
} from "../src/blocks/footer";
import {
  renderStudioFooterHtml,
  studioFromProjects,
  withRef,
} from "../footer-html.js";
import { createProjectKey, Unreachable } from "../footer/keys.js";
import { readFileSync } from "node:fs";
const base = {
  product: "Reader",
  url: "https://reader.example",
  summary: "Saved links & reading.",
  groups: [{ title: "Product", links: [{ label: "About", href: "/about" }] }],
};
// Only sort attributes and discard React comment nodes. Text whitespace,
// entity spelling, attribute casing, void syntax, classes and styles stay exact.
function normalize(html) {
  return html.replace(/<!--[^]*?-->/g, "").replace(
    /<([a-z][\w:-]*)(\s[^<>]*?)?(\/?)>/g,
    (_, tag, attributes = "", slash) => {
      const attrs = attributes.match(/[^\s=]+="[^"]*"/g) ?? [];
      return "<" + tag + (attrs.length ? " " + attrs.sort().join(" ") : "") + slash + ">";
    },
  );
}
describe("React parity", () => {
  const cases = [
    base,
    { ...base, capture: false, catalogId: "reader", legal: "© Reader" },
    {
      ...base,
      capture: "waitlist",
      subscribeKey: "subscribe",
      feedbackKey: "feedback",
      privacyUrl: "/privacy",
      variant: "gallery",
      mark: "R",
    },
    ...["stack", "fill", "poster"].flatMap((wordmark) =>
      ["studio", "gallery"].flatMap((variant) =>
        ["panel", "scene"].map((artMode) => ({
          ...base,
          product: "Long Product Name",
          wordmark,
          variant,
          artMode,
          art: {
            src: "/art.webp?a=1&b=2",
            alt: "Art & light",
            position: "40% 60%",
            width: 1200,
            height: 800,
            credit: "Art by <someone> & friends",
            creditHref: "https://example.com/art?a=1&b=2",
          },
          cta: { label: "Open <Reader> & read", href: "/open?a=1&b=2" },
          studio: [
            {
              id: "live",
              label: "Live",
              href: "https://example.com/?a=1&ref=old#x",
            },
          ],
          catalogId: "reader",
          className: "pt-4",
        })),
      ),
    ),
  ];
  for (const [i, props] of cases.entries())
    it(`case ${i}`, () =>
      expect(normalize(renderStudioFooterHtml(props))).toEqual(
        normalize(renderToStaticMarkup(<StudioFooter {...props} />)),
      ));
});
function fragment(props) {
  const t = document.createElement("template");
  t.innerHTML = renderStudioFooterHtml({ ...base, ...props });
  return t.content;
}
it("renders one escaped product CTA outside subscribe and validates its href", () => {
  for (const href of ["https://example.com/open", "http://example.com", '/open?q="<bad>&x=1', "/open?a=1&b=2", "./open", "../open", "open"]) {
    const dom = fragment({ cta: { label: '<b>Open</b> & "read"', href } });
    const links = dom.querySelectorAll("a.bg-brand");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe(href);
    expect(links[0].textContent).toBe('<b>Open</b> & "read"');
    expect(links[0].querySelector("b")).toBeNull();
    expect(links[0].closest("form")).toBeNull();
  }
  for (const href of ["javascript:alert(1)", "data:text/html,bad", "mailto:a@b.co", "//other.example", "/\\other.example", "\njavascript:bad", "https://", ""]) {
    expect(fragment({ cta: { label: "Open", href } }).querySelector("a.bg-brand")).toBeNull();
  }
  expect(fragment({}).querySelector("a.bg-brand")).toBeNull();
  expect(() => fragment({ cta: { label: { html: "<b>raw</b>" }, href: "/open" } })).toThrow("cta.label must be text");
});
it("keeps subscribe height on mobile and flexes only in the row layout", () => {
  const input = fragment({}).querySelector("#subscribe-email");
  expect(input.classList.contains("h-12")).toBe(true);
  expect(input.classList.contains("shrink-0")).toBe(true);
  expect(input.classList.contains("sm:flex-1")).toBe(true);
  expect(input.classList.contains("flex-1")).toBe(false);
});
it("renders art dimensions, focal points and escaped credits in every mode", () => {
  const art = { src: "/art.webp", alt: "Art", width: 1200, height: 800, position: "40% 60%", credit: "<b>Artist</b> & friends", creditHref: "https://example.com/art?a=1&b=2" };
  for (const wordmark of ["poster", "stack", "fill"]) {
    for (const artMode of ["panel", "scene"]) {
      const dom = fragment({ art, wordmark, artMode });
      if (wordmark === "fill") {
        expect(dom.querySelector(".bg-clip-text").style.backgroundPosition).toBe(art.position);
      } else {
        const img = dom.querySelector("img");
        expect(img.getAttribute("width")).toBe("1200");
        expect(img.getAttribute("height")).toBe("800");
        expect(img.style.objectPosition).toBe(art.position);
      }
      const credit = dom.querySelector('a[href^="https://example.com/art"]');
      expect(credit.textContent).toBe(art.credit);
      expect(credit.querySelector("b")).toBeNull();
    }
  }
  for (const creditHref of [undefined, "/artist", "javascript:bad", "//example.com", "https://"]) {
    const dom = fragment({ art: { ...art, creditHref } });
    const credit = [...dom.querySelectorAll("p")].find((p) => p.textContent === art.credit);
    expect(credit).toBeTruthy();
    expect(credit.querySelector("a")).toBeNull();
  }
  expect(fragment({ art: { ...art, creditHref: "http://example.com/artist" } }).querySelector('a[href="http://example.com/artist"]')).not.toBeNull();
  expect(() => fragment({ art: { ...art, credit: { html: "<b>raw</b>" } } })).toThrow("art.credit must be text");
});
it("ships the reset and theme adapter outside Tailwind layers", () => {
  const css = readFileSync("footer.css", "utf8");
  const rules = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) {
      rules.push(css.slice(start, i + 1));
      start = i + 1;
    }
  }
  expect(rules.some((rule) => rule.startsWith("footer[data-fleet-footer]") && rule.includes("font:revert-layer") && rule.includes("margin:revert-layer"))).toBe(true);
  expect(rules.some((rule) => rule.startsWith("footer[data-fleet-footer]{") && rule.includes("--background:") && rule.includes("color-scheme:light"))).toBe(true);
  expect(rules.some((rule) => rule.includes('[data-theme=dark]') && rule.includes(".dark") && rule.includes("color-scheme:dark") && !rule.startsWith("@layer"))).toBe(true);
  expect(rules.some((rule) => rule.startsWith("@media(prefers-color-scheme:dark)") && rule.includes(':not([data-theme=light])') && rule.includes("--muted-foreground:"))).toBe(true);
});
it("escapes interpolated text and attributes", () => {
  const html = renderStudioFooterHtml({
    ...base,
    product: '<script>"&',
    summary: "<img onerror=bad>",
    legal: "<b>legal</b>",
    art: { src: 'x" onerror="bad', alt: "<art>" },
  });
  const t = document.createElement("template");
  t.innerHTML = html;
  expect(t.content.querySelector("script")).toBeNull();
  expect(t.content.querySelector("[onerror]")).toBeNull();
  expect(html).toContain("&lt;img onerror=bad&gt;");
});
it("consent, privacy and capture kinds", () => {
  for (const kind of ["newsletter", "waitlist"]) {
    const html = renderStudioFooterHtml({ ...base, capture: kind });
    expect(html).toContain(
      kind === "newsletter"
        ? "I agree to receive newsletter emails"
        : "I agree to receive early-access and availability emails",
    );
    expect(html.match(/href="https:\/\/sassmaker.com\/privacy"/g)).toHaveLength(
      2,
    );
  }
  expect(
    renderStudioFooterHtml({ ...base, privacyUrl: "/private" }).match(
      /href="\/private"/g,
    ),
  ).toHaveLength(2);
  expect(renderStudioFooterHtml({ ...base, capture: false })).not.toContain(
    "data-subscribe",
  );
});
it("studio sources, filtering and refs match React", () => {
  const projects = [
    null,
    { id: "reader", name: "Reader", url: "https://reader.example" },
    { id: "a", name: "A", url: "https://a.example" },
    { id: "a", name: "dupe", url: "https://dup.example" },
    { id: "bad", name: "Bad", url: "ftp://bad" },
    { id: "b", name: "B", url: "https://b.example" },
  ];
  for (const limit of [0, 1, 3])
    expect(studioFromProjects(projects, { current: "reader", limit })).toEqual(
      reactProjects(projects, { current: "reader", limit }),
    );
  for (const href of ["/relative", "https://a.example/?ref=x&z=1#hash"])
    expect(withRef(href, "reader")).toBe(reactRef(href, "reader"));
  expect(
    renderStudioFooterHtml({ ...base, projects, catalogId: "reader" }),
  ).toContain("https://a.example/?ref=reader");
  expect(renderStudioFooterHtml({ ...base, studio: [] })).toContain(
    "CodeVetter",
  );
  expect(renderStudioFooterHtml({ ...base, projects: [] })).toContain(
    "CodeVetter",
  );
  expect(
    renderStudioFooterHtml({
      ...base,
      studio: [
        { label: "Reader", href: "/self" },
        { label: "Other", href: "https://other.example" },
      ],
      ref: "custom",
    }),
  ).toContain("https://other.example/?ref=custom");
});
describe("key resolution", () => {
  const form = (key, catalog) => ({ dataset: { key, catalog } });
  it("direct key and preview avoid lookup", async () => {
    const fetch = vi.fn();
    const key = createProjectKey(fetch);
    expect(await key(form("direct", "id"))).toBe("direct");
    expect(await key(form("", ""))).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("caches found keys and shares pending lookup", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ api_key: "found" }),
      });
    const key = createProjectKey(fetch);
    expect(
      await Promise.all([key(form("", "a/b")), key(form("", "a/b"))]),
    ).toEqual(["found", "found"]);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0].endsWith("/a%2Fb")).toBe(true);
  });
  it("retries misses and failures", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ status: 500, ok: false });
    const key = createProjectKey(fetch);
    expect(await key(form("", "id"))).toBeNull();
    expect(await key(form("", "id"))).toBeNull();
    await expect(key(form("", "id"))).rejects.toBeInstanceOf(Unreachable);
    await expect(key(form("", "id"))).rejects.toBeInstanceOf(Unreachable);
    expect(fetch).toHaveBeenCalledTimes(4);
  });
});

it("upgrades prerendered HTML and binds only once across reconnects", async () => {
  await import("../footer.js");
  const host = document.createElement("studio-footer");
  host.innerHTML = renderStudioFooterHtml(base);
  document.body.append(host);
  const footer = host.firstElementChild;
  const email = host.querySelector("[data-subscribe] input");
  email.value = "before@example.com";
  await import("../footer.js");
  expect(host.firstElementChild).toBe(footer);
  expect(email.value).toBe("before@example.com");
  const dialog = host.querySelector("dialog");
  dialog.showModal = vi.fn();
  host.remove();
  document.body.append(host);
  host.querySelector("[data-feedback-open]").click();
  expect(dialog.showModal).toHaveBeenCalledOnce();
  host.remove();
});
it("JSON/property/attributes and feed fallback work in the built element", async () => {
  await import("../footer.js");
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "live", name: "Live", url: "https://live.example" },
      ],
    });
  const host = document.createElement("studio-footer");
  host.innerHTML =
    '<script type="application/json">{"product":"JSON","groups":[],"capture":false}</script>';
  host.config = {
    product: "Property",
    url: "https://example.com",
    studioFromProjects: true,
  };
  host.setAttribute("product", "Attribute");
  host.setAttribute("catalog-id", "attr");
  document.body.append(host);
  expect(host.querySelector("[data-subscribe]")).toBeNull();
  await vi.waitFor(() =>
    expect(
      host.querySelector('a[href="https://live.example/?ref=attr"]'),
    ).not.toBeNull(),
  );
  expect(
    host.querySelector('a[href="https://live.example/?ref=attr"]'),
  ).not.toBeNull();
  expect(fetch).toHaveBeenCalledWith("https://sassmaker.com/projects.json", {
    credentials: "omit",
  });
  host.remove();
  fetch.mockRestore();
});
it("supports CTA attributes and passes JSON art metadata through unchanged", async () => {
  await import("../footer.js");
  const host = document.createElement("studio-footer");
  const art = { src: "/art.webp", alt: "Art", width: 640, height: 480, position: "20% 80%", credit: "<Artist>", creditHref: "https://example.com/artist" };
  host.innerHTML = '<script type="application/json">' + JSON.stringify({ ...base, art }) + '</script>';
  host.setAttribute("cta-label", "Open Reader");
  host.setAttribute("cta-href", "/open");
  document.body.append(host);
  expect(host.readConfig().art).toEqual(art);
  expect(host.querySelector("a.bg-brand").textContent).toBe("Open Reader");
  expect(host.querySelector("img").getAttribute("width")).toBe("640");
  expect(host.querySelector('a[href="https://example.com/artist"]').textContent).toBe("<Artist>");
  host.setAttribute("cta-href", "javascript:bad");
  expect(host.querySelector("a.bg-brand")).toBeNull();
  host.remove();
});
it("posts subscribe once and blocks Base-style window delegation", async () => {
  await import("../footer.js");
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true });
  const windowSubmit = vi.fn();
  window.addEventListener("submit", windowSubmit);
  const host = document.createElement("studio-footer");
  host.config = { ...base, feedbackKey: "fallback", capture: "waitlist" };
  document.body.append(host);
  const form = host.querySelector("[data-subscribe]");
  form.elements.email.value = " a@example.com ";
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await vi.waitFor(() =>
    expect(form.querySelector("[role=status]").textContent).toBe(
      "You're on the list.",
    ),
  );
  expect(fetch).toHaveBeenCalledOnce();
  const [url, options] = fetch.mock.calls[0];
  expect(url.endsWith("/v1/subscriptions")).toBe(true);
  expect(options.headers["X-Project-Key"]).toBe("fallback");
  expect(JSON.parse(options.body)).toEqual({
    email: "a@example.com",
    kind: "waitlist",
    source: "footer",
    consent: true,
  });
  expect(windowSubmit).not.toHaveBeenCalled();
  window.removeEventListener("submit", windowSubmit);
  host.remove();
  fetch.mockRestore();
});
it("shows preview and Unreachable copy without posting", async () => {
  await import("../footer.js");
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockRejectedValue(new Error("offline"));
  const host = document.createElement("studio-footer");
  host.config = base;
  document.body.append(host);
  let form = host.querySelector("[data-feedback]");
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await vi.waitFor(() =>
    expect(form.querySelector("[role=status]").textContent).toContain(
      "Preview only:",
    ),
  );
  expect(fetch).not.toHaveBeenCalled();
  host.setAttribute("catalog-id", "reader");
  form = host.querySelector("[data-feedback]");
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await vi.waitFor(() =>
    expect(form.querySelector("[role=status]").textContent).toBe(
      "Couldn't reach SaaS Maker, so nothing was sent. Please try again in a moment.",
    ),
  );
  expect(form.querySelector("button[type=submit]").disabled).toBe(false);
  host.remove();
  fetch.mockRestore();
});
it("feedback points at a unique element and posts page details and screenshot", async () => {
  await import("../footer.js");
  const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true });
  const host = document.createElement("studio-footer");
  host.config = { ...base, feedbackKey: "feedback" };
  document.body.append(host);
  const target = document.createElement("p");
  target.id = "point-target";
  target.innerText = "The part I mean";
  document.body.prepend(target);
  const dialog = host.querySelector("dialog");
  dialog.close = vi.fn();
  dialog.showModal = vi.fn();
  host.querySelector("[data-feedback-point]").click();
  target.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  expect(dialog.showModal).toHaveBeenCalledOnce();
  expect(host.querySelector("[data-feedback-anchor]").textContent).toContain(
    "The part I mean",
  );
  const form = host.querySelector("[data-feedback]");
  form.elements.title.value = " Summary ";
  form.elements.message.value = " Details ";
  form.elements.email.value = "reply@example.com";
  const screenshot = new File(["image"], "screen.png", { type: "image/png" });
  form.elements.screenshot.files = [screenshot];
  form.elements.screenshot.dispatchEvent(
    new Event("change", { bubbles: true }),
  );
  expect(form.querySelector("[data-feedback-file-label]").textContent).toBe(
    "screen.png",
  );
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await vi.waitFor(() =>
    expect(form.querySelector("[data-feedback-status]").textContent).toBe(
      "Thanks, it reached the person who builds Reader.",
    ),
  );
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe("https://api.sassmaker.com/v1/feedback");
  expect(options.headers["X-Project-Key"]).toBe("feedback");
  const feedback = JSON.parse(options.body.get("feedback"));
  expect(feedback).toMatchObject({
    type: "feedback",
    title: "Summary",
    description: "Details",
    submitter_email: "reply@example.com",
    source: "studio-footer",
    anchor: {
      selector: "#point-target",
      tag: "p",
      text: "The part I mean",
      source: "click",
    },
  });
  expect(feedback.page.url).not.toMatch(/[?#]/);
  expect(options.body.get("screenshot").name).toBe("screen.png");
  expect(form.querySelector("[data-feedback-file-label]").textContent).toBe(
    "Add a screenshot",
  );
  host.remove();
  target.remove();
  fetch.mockRestore();
});
