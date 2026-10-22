// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { bindFooter } from "../footer/behaviour.js";
import { renderStudioFooterHtml } from "../footer-html.js";

const baseScript = readFileSync(
  "../templates/src/Base.astro", "utf8",
).split("{footerScript && <script is:inline>")[1].split("</script>}")[0];
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

for (const [name, bind] of [
  ["custom element", bindFooter],
  ["Base inline script", (root) => new Function("addEventListener", baseScript)(root.addEventListener.bind(root))],
]) describe(name, () => {
  function setup() {
    const root = document.createElement("div");
    root.innerHTML = renderStudioFooterHtml({ product: "Reader", url: "https://reader.example", feedbackKey: "public-key", groups: [] });
    document.body.append(root);
    bind(root);
    const form = root.querySelector("[data-feedback]");
    const fill = () => {
      form.elements.title.value = "Same message";
      form.elements.message.value = "Lost response, retained draft";
      form.elements.consent.checked = true;
    };
    fill();
    const post = async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await vi.waitFor(() => expect(form.querySelector("button[type=submit]").disabled).toBe(false));
    };
    return { root, form, fill, post };
  }
  const payload = (fetch, n) => JSON.parse(fetch.mock.calls[n][1].body.get("feedback"));

  it("retries a lost response with one identity and starts a new intent after success", async () => {
    const fetch = vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("response lost after commit"))
      .mockResolvedValue({ ok: true });
    const { form, fill, post } = setup();
    await post();
    expect(form.elements.title.value).toBe("Same message");
    expect(form.elements.consent.checked).toBe(true);
    expect(form.querySelector("[data-feedback-status]").textContent).toContain("Couldn't confirm delivery");
    const first = payload(fetch, 0);
    expect(first.submission_id).toMatch(/^[0-9a-f-]{36}$/);
    await post();
    expect(payload(fetch, 1)).toEqual(first);
    fill();
    await post();
    expect(payload(fetch, 2).submission_id).not.toBe(first.submission_id);
  });

  it("gives edited content and a replacement image new identities while retaining the same file on retry", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));
    const { form, post } = setup();
    const shot = new File(["first"], "shot.png", { type: "image/png" });
    form.elements.screenshot.files = [shot];
    await post(); await post();
    expect(payload(fetch, 1).submission_id).toBe(payload(fetch, 0).submission_id);
    form.elements.title.value = "Edited message";
    await post();
    expect(payload(fetch, 2).submission_id).not.toBe(payload(fetch, 1).submission_id);
    form.elements.screenshot.files = [new File(["other"], "shot.png", { type: "image/png" })];
    await post();
    expect(payload(fetch, 3).submission_id).not.toBe(payload(fetch, 2).submission_id);
  });

  it("does not send a second request while the first is pending", async () => {
    let release;
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(resolve => { release = resolve; }));
    const { form } = setup();
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledOnce();
    release({ ok: true });
    await vi.waitFor(() => expect(form.querySelector("button[type=submit]").disabled).toBe(false));
  });
});
