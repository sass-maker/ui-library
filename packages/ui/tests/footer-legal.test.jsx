// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vitest";
import "../footer.js";

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

it("preserves an open feedback draft, file and retry identity across a late legal update", async () => {
  const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("response lost"));
  const root = document.createElement("studio-footer");
  root.setAttribute("product", "Anime List");
  root.setAttribute("url", "https://anime.example");
  root.setAttribute("feedback-key", "public-key");
  root.setAttribute("legal", "Anime List");
  document.body.append(root);
  const form = root.querySelector("[data-feedback]");
  const dialog = root.querySelector("[data-feedback-dialog]");
  dialog.setAttribute("open", "");
  form.elements.title.value = "Keep my draft";
  form.elements.message.value = "Details survive asynchronous metadata";
  form.elements.consent.checked = true;
  const file = new File(["image"], "screen.png", { type: "image/png" });
  form.elements.screenshot.files = [file];
  const submit = async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(form.querySelector("button[type=submit]").disabled).toBe(false));
  };
  await submit();
  const payload = n => JSON.parse(fetch.mock.calls[n][1].body.get("feedback"));
  const first = payload(0);
  root.setAttribute("legal", "Anime List · Updated just now");
  expect(root.querySelector("[data-feedback]")).toBe(form);
  expect(dialog.hasAttribute("open")).toBe(true);
  expect(form.elements.title.value).toBe("Keep my draft");
  expect(form.elements.message.value).toBe("Details survive asynchronous metadata");
  expect(form.elements.consent.checked).toBe(true);
  expect(form.elements.screenshot.files[0]).toBe(file);
  expect(root.querySelector("[data-footer-legal]").textContent).toBe("Anime List · Updated just now");
  await submit();
  expect(payload(1)).toEqual(first);
});

for (const mode of ["full", "compact"]) it(`updates, hides and restores legal text in ${mode} without replacing the footer`, () => {
  const root = document.createElement("studio-footer");
  root.setAttribute("product", "Anime List");
  root.setAttribute("mode", mode);
  document.body.append(root);
  const footer = root.querySelector("footer");
  root.setAttribute("legal", "<b>Plain text</b>");
  expect(root.querySelector("footer")).toBe(footer);
  const legal = root.querySelector("[data-footer-legal]");
  expect(legal.textContent).toBe("<b>Plain text</b>");
  expect(legal.querySelector("b")).toBeNull();
  expect(legal.hidden).toBe(false);
  root.removeAttribute("legal");
  expect(legal.hidden).toBe(true);
  root.setAttribute("legal", "Restored");
  expect(legal.hidden).toBe(false);
  expect(legal.textContent).toBe("Restored");
  expect(root.querySelector("footer")).toBe(footer);
});
