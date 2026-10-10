import { createProjectKey, Unreachable } from "./keys.js";
const bound = new WeakSet();
export function bindFooter(root) {
  if (bound.has(root)) return;
  bound.add(root);
  // Footer forms post to SaaS Maker with a publishable key. Without one they run in preview mode.
  const api = "https://api.sassmaker.com";
  // A page address without query or fragment, which can carry private tokens.
  const pageUrl = () => location.origin + location.pathname;
  // The publishable project key: given directly, or resolved from the catalog id.
  // Only a found key is cached; a miss or a failed lookup is retried on the next send.
  // null means preview mode (no key, or the catalog id has no project); a failed
  // lookup throws Unreachable so the form says SaaS Maker could not be reached.
  const projectKey = createProjectKey();
  const dialog = () => root.querySelector("[data-feedback-dialog]");
  let anchor = null;

  // Point at something: pick an element on the page, then reopen the form.
  function showAnchor() {
    const row = dialog()?.querySelector("[data-feedback-anchor]");
    if (!row) return;
    row.classList.toggle("hidden", !anchor);
    row.classList.toggle("flex", !!anchor);
    row.firstElementChild.textContent = anchor
      ? "Pointing at: " + (anchor.text || "<" + anchor.tag + ">")
      : "";
  }
  // A selector that matches only el: climb to a unique id or to <body>, with
  // :nth-of-type wherever a parent has more than one child of the same tag.
  function selectorFor(el, useIds = true) {
    const parts = [];
    let n = el;
    for (
      ;
      n &&
      n.nodeType === 1 &&
      n !== document.body &&
      n !== document.documentElement;
      n = n.parentElement
    ) {
      if (
        useIds &&
        n.id &&
        document.querySelectorAll("#" + CSS.escape(n.id)).length === 1
      )
        break;
      const same = [...(n.parentElement?.children ?? [])].filter(
        (c) => c.tagName === n.tagName,
      );
      parts.unshift(
        CSS.escape(n.localName) +
          (same.length > 1
            ? ":nth-of-type(" + (same.indexOf(n) + 1) + ")"
            : ""),
      );
    }
    parts.unshift(
      useIds && n?.id && n !== document.body ? "#" + CSS.escape(n.id) : "body",
    );
    const sel = parts.join(" > ");
    const hits = document.querySelectorAll(sel);
    return (hits.length === 1 && hits[0] === el) || !useIds
      ? sel
      : selectorFor(el, false);
  }
  function pick() {
    const d = dialog();
    d.close();
    const box = Object.assign(document.createElement("div"), {
      ariaHidden: "true",
    });
    box.style.cssText =
      "position:fixed;pointer-events:none;z-index:2147483647;border:2px solid var(--brand);border-radius:6px;background:color-mix(in oklch,var(--brand) 12%,transparent);transition:all .08s";
    const tip = Object.assign(document.createElement("div"), {
      textContent: "Click the part you mean. Esc to cancel.",
    });
    tip.style.cssText =
      "position:fixed;left:50%;bottom:24px;translate:-50% 0;z-index:2147483647;padding:10px 16px;border-radius:999px;background:#1d1611;color:#fff;font:500 14px system-ui";
    document.body.append(box, tip);
    const move = (e) => {
      const r = e.target.getBoundingClientRect();
      Object.assign(box.style, {
        left: r.left - 2 + "px",
        top: r.top - 2 + "px",
        width: r.width + 4 + "px",
        height: r.height + 4 + "px",
      });
    };
    const done = (el) => {
      removeEventListener("mousemove", move, true);
      removeEventListener("click", click, true);
      removeEventListener("keydown", key, true);
      box.remove();
      tip.remove();
      if (el)
        anchor = {
          selector: selectorFor(el),
          tag: el.tagName.toLowerCase(),
          text: (el.innerText || el.alt || "").trim().slice(0, 140),
          source: "click",
          url: pageUrl(),
        };
      showAnchor();
      d.showModal();
    };
    const click = (e) => {
      e.preventDefault();
      e.stopPropagation();
      done(e.target);
    };
    const key = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        done(null);
      }
    };
    addEventListener("mousemove", move, true);
    addEventListener("click", click, true);
    addEventListener("keydown", key, true);
  }

  root.addEventListener("click", (e) => {
    const t = e.target.closest?.(
      "[data-feedback-open],[data-feedback-close],[data-feedback-point],[data-feedback-unpoint]",
    );
    if (!t) return;
    e.stopPropagation();
    if (t.hasAttribute("data-feedback-open")) dialog()?.showModal();
    if (t.hasAttribute("data-feedback-close")) dialog()?.close();
    if (t.hasAttribute("data-feedback-point")) pick();
    if (t.hasAttribute("data-feedback-unpoint")) {
      anchor = null;
      showAnchor();
    }
  });
  root.addEventListener("change", (e) => {
    if (e.target.name !== "screenshot" || !e.target.closest("[data-feedback]"))
      return;
    const label = e.target
      .closest("label")
      .querySelector("[data-feedback-file-label]");
    e.stopPropagation();
    label.textContent = e.target.files[0]?.name || "Add a screenshot";
  });
  // Clicking the backdrop closes the dialog.
  root.addEventListener("click", (e) => {
    if (e.target.matches?.("[data-feedback-dialog]")) {
      e.stopPropagation();
      e.target.close();
    }
  });

  async function send(form, statusSel, request, ok) {
    const status = form.querySelector(statusSel);
    const button = form.querySelector("button[type=submit]");
    const say = (text) => (status.textContent = text);
    button.disabled = true;
    say("Sending…");
    try {
      const res = await request();
      if (res === null) {
        say("Preview only: this demo has no project key, so nothing was sent.");
        return false;
      }
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      say(ok);
      return true;
    } catch (err) {
      say(
        err instanceof Unreachable
          ? "Couldn't reach SaaS Maker, so nothing was sent. Please try again in a moment."
          : "That did not send. Please try again in a moment.",
      );
    } finally {
      button.disabled = false;
    }
  }

  root.addEventListener("submit", async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.hasAttribute("data-feedback")) {
      e.preventDefault();
      e.stopPropagation();
      const data = new FormData(form);
      const email = String(data.get("email") || "").trim();
      const shot = data.get("screenshot");
      const sent = await send(
        form,
        "[data-feedback-status]",
        async () => {
          const key = await projectKey(form);
          if (!key) return null;
          const body = new FormData();
          body.set(
            "feedback",
            JSON.stringify({
              type: data.get("type") || "feedback",
              title: String(data.get("title") || "").trim(),
              description: String(data.get("message") || "").trim(),
              ...(email && { submitter_email: email }),
              page: { url: pageUrl(), title: document.title },
              ...(anchor && { anchor }),
              source: "studio-footer",
            }),
          );
          if (shot && shot.size) body.set("screenshot", shot);
          return fetch(api + "/v1/feedback", {
            method: "POST",
            credentials: "omit",
            headers: { "X-Project-Key": key },
            body,
          });
        },
        "Thanks, it reached the person who builds " +
          form.dataset.product +
          ".",
      );
      if (sent) {
        anchor = null;
        showAnchor();
        form.querySelector("[data-feedback-file-label]").textContent =
          "Add a screenshot";
      }
    }

    if (form.hasAttribute("data-subscribe")) {
      e.preventDefault();
      e.stopPropagation();
      const email = String(new FormData(form).get("email") || "").trim();
      await send(
        form,
        "[data-subscribe-status]",
        async () => {
          const key = await projectKey(form);
          if (!key) return null;
          return fetch(api + "/v1/subscriptions", {
            method: "POST",
            credentials: "omit",
            headers: {
              "Content-Type": "application/json",
              "X-Project-Key": key,
            },
            body: JSON.stringify({
              email,
              kind: form.dataset.kind || "newsletter",
              source: "footer",
              consent: true,
            }),
          });
        },
        "You're on the list.",
      );
    }
  });
}
