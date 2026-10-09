// Browser checks for the keyboard, focus and footer-send paths that type checks
// cannot see. No dependencies: drives a local Chrome over the DevTools protocol
// with real key events, and fakes api.sassmaker.com so nothing leaves the machine.
//
//   pnpm --filter ./site build && pnpm --filter ./site preview   # in one shell
//   pnpm check:browser                                           # in another
//
// BASE_URL (default http://localhost:4321) and CHROME (path to Chrome) override.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = (process.env.BASE_URL ?? "http://localhost:4321").replace(/\/$/, "");
const chromePath = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const port = 9600 + Math.floor(Math.random() * 300);
const chrome = spawn(chromePath, ["--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", `--user-data-dir=${mkdtempSync(join(tmpdir(), "ui-check-"))}`, "about:blank"], { stdio: "ignore" });
let ws;
for (let i = 0; i < 80 && !ws; i++) {
  await sleep(250);
  try {
    const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch {}
}
if (!ws) throw new Error("Chrome did not start; set CHROME to its path.");
await new Promise((r) => ws.addEventListener("open", r));

let seq = 0;
const pending = new Map();
const handlers = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) pending.get(m.id)(m), pending.delete(m.id);
  else if (m.method) handlers.get(m.method)?.(m.params);
});
const cdp = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const js = async (expression) => {
  const r = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? expression);
  return r.result?.result?.value;
};
const KEYS = { Enter: [13, "\r"], " ": [32, " "], ArrowDown: [40], ArrowUp: [38], Escape: [27], Tab: [9] };
async function press(key) {
  const [code, text] = KEYS[key];
  const name = key === " " ? "Space" : key;
  await cdp("Input.dispatchKeyEvent", { type: text ? "keyDown" : "rawKeyDown", key, code: name, windowsVirtualKeyCode: code, text });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code: name, windowsVirtualKeyCode: code });
  await sleep(120);
}
async function open(path, width = 1440) {
  await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 600 });
  await cdp("Page.navigate", { url: base + path });
  for (let i = 0; i < 60; i++) {
    await sleep(150);
    if ((await js("document.readyState")) === "complete" && (await js("!document.querySelector('astro-island[ssr]')"))) break;
  }
  await sleep(400);
}
const waitFor = async (expr, ms = 4000) => { for (let t = 0; t < ms; t += 100) { if (await js(expr)) return true; await sleep(100); } return false; };

let failed = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : `: ${detail}`}`);
  if (!ok) failed++;
}

await cdp("Page.enable");
await cdp("Runtime.enable");

// Fake SaaS Maker: capture-config answers 503 once, then a key; sends answer 201.
let lookups = 0;
const sent = [];
await cdp("Fetch.enable", { patterns: [{ urlPattern: "https://api.sassmaker.com/*" }] });
handlers.set("Fetch.requestPaused", async ({ requestId, request }) => {
  const cors = [
    { name: "Access-Control-Allow-Origin", value: "*" },
    { name: "Access-Control-Allow-Headers", value: "*" },
    { name: "Access-Control-Allow-Methods", value: "GET, POST" },
    { name: "Content-Type", value: "application/json" },
  ];
  let status = 201;
  let body = "{}";
  if (request.method === "OPTIONS") status = 204;
  else if (request.url.includes("/v1/capture-config/")) {
    lookups++;
    status = lookups === 1 ? 503 : 200;
    body = lookups === 1 ? "{}" : JSON.stringify({ api_key: "pk_test" });
  } else {
    sent.push({ url: request.url, key: request.headers["X-Project-Key"], body: request.postData ?? "" });
  }
  await cdp("Fetch.fulfillRequest", { requestId, responseCode: status, responseHeaders: cors, body: Buffer.from(body).toString("base64") });
});

// ── Data demo: FacetFilter by keyboard, compare picks from the URL, selection counter
await open("/demo/data/?pick=nowhere,lisbon-portugal,lisbon-portugal");
check("data: no horizontal scroll at 1440", await js("document.documentElement.scrollWidth <= innerWidth"));
const picks = await js("new URLSearchParams(location.search).get('pick')");
check("data: unknown and repeated picks are dropped from the URL", picks === "lisbon-portugal", `pick=${picks}`);
check("data: selection counter is text, not aria-label on a span", await js("!document.querySelector('th span[aria-label]') && /selected/.test(document.querySelector('thead th .sr-only')?.textContent ?? '')"));

await js("document.querySelector('button[aria-haspopup=dialog]').focus()");
await press("Enter");
check("facet: focus lands in the popover's input", await waitFor("document.activeElement?.matches('[cmdk-input]')"));
check("facet: the combobox has a name", await js("!!document.querySelector('[cmdk-input]')?.labels?.[0]?.textContent || !!document.getElementById(document.querySelector('[cmdk-input]')?.getAttribute('aria-labelledby'))?.textContent"));
const first = await js("document.querySelector('[cmdk-item][data-selected=true]')?.getAttribute('data-value')");
await press("ArrowDown");
const second = await js("document.querySelector('[cmdk-item][data-selected=true]')?.getAttribute('data-value')");
check("facet: ArrowDown moves the active option", !!second && second !== first, `${first} -> ${second}`);
await press("Enter");
check("facet: Enter toggles the active option", await waitFor(`document.querySelector('[cmdk-item][data-value="${second}"]')?.getAttribute('aria-checked') === 'true'`));
await press("Escape");
await sleep(200);

await press("Escape");
await js("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))");
if (await waitFor("!!document.querySelector('[role=dialog] [cmdk-input]')", 1500)) {
  check("search: the palette combobox has a name", await js("!!document.getElementById(document.querySelector('[role=dialog] [cmdk-root]')?.querySelector('label[cmdk-label]')?.id)?.textContent || !!document.querySelector('[role=dialog] [cmdk-label]')?.textContent"));
  await press("Escape");
}

await open("/demo/data/", 390);
check("data: no horizontal scroll at 390", await js("document.documentElement.scrollWidth <= innerWidth"));

// ── Claims demo: QuoteList rows are real buttons with links beside them; detail returns focus
await open("/demo/data/claims/");
check("claims: no horizontal scroll at 1440", await js("document.documentElement.scrollWidth <= innerWidth"));
check("quotes: rows are <button>s", await js("[...document.querySelectorAll('[data-quote-row]')].length > 0 && [...document.querySelectorAll('[data-quote-row]')].every((r) => r.tagName === 'BUTTON')"));
check("quotes: no link or control inside a button", await js("!document.querySelector('button a, button button, [role=button] a, [role=button] button')"));
await js("document.querySelector('[data-quote-row]').focus()");
await press("ArrowDown");
check("quotes: ArrowDown moves to the next row", await js("document.activeElement === document.querySelectorAll('[data-quote-row]')[1]"));
await press("Enter");
check("detail: Enter opens the panel and focuses its heading", await waitFor("document.activeElement?.closest('[data-record-detail]') !== null && document.activeElement?.tagName === 'H2'"));
await press("Escape");
check("detail: closing returns focus to the row", await waitFor("document.activeElement === document.querySelectorAll('[data-quote-row]')[1]"));
await js("document.querySelectorAll('[data-quote-row]')[2].focus()");
await press(" ");
check("quotes: Space opens a row", await waitFor("!!document.querySelector('[data-record-detail]')"));
await open("/demo/data/claims/", 390);
check("claims: no horizontal scroll at 390", await js("document.documentElement.scrollWidth <= innerWidth"));

// ── Gallery footer: lookup failure is an error, retried next time; selector is unique; no globals
await open("/demo/anchor/");
check("gallery: no horizontal scroll at 1440", await js("document.documentElement.scrollWidth <= innerWidth"));
check("footer: script declares no globals", await js("typeof api === 'undefined' && typeof keys === 'undefined' && typeof projectKey === 'undefined'"));
const subscribe = async () => {
  await js(`(() => { const f = document.querySelector('form[data-subscribe]'); f.querySelector('input[type=email]').value = 'a@b.co'; const c = f.querySelector('input[type=checkbox]'); if (c && !c.checked) c.click(); f.requestSubmit(); })()`);
  await waitFor("!/Sending/.test(document.querySelector('[data-subscribe-status]').textContent)");
  return js("document.querySelector('[data-subscribe-status]').textContent");
};
const firstTry = await subscribe();
check("footer: a failed lookup says SaaS Maker could not be reached", /couldn't reach SaaS Maker/i.test(firstTry), firstTry);
const secondTry = await subscribe();
check("footer: the next submit looks the key up again and sends", secondTry === "You're on the list." && lookups === 2 && sent.at(-1)?.key === "pk_test", `${secondTry} lookups=${lookups}`);

await js("document.querySelector('[data-feedback-open]').click()");
await js("document.querySelector('[data-feedback-point]').click()");
await sleep(200);
const target = await js(`(() => { const el = [...document.querySelectorAll('main p')].at(-1); el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + 4, y: r.top + r.height / 2 }; })()`);
await sleep(200);
for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await cdp("Input.dispatchMouseEvent", { type, x: target.x, y: target.y, button: "left", clickCount: 1 });
await sleep(200);
await js(`(() => { const f = document.querySelector('form[data-feedback]'); f.querySelector('[name=title]').value = 'Check'; f.querySelector('[name=message]').value = 'Selector check'; const c = f.querySelector('input[type=checkbox]'); if (c && !c.checked) c.click(); f.requestSubmit(); })()`);
await waitFor("/Thanks/.test(document.querySelector('[data-feedback-status]').textContent)");
const feedback = sent.find((s) => s.url.endsWith("/v1/feedback"));
const selector = feedback && /"selector":"((?:[^"\\]|\\.)*)"/.exec(feedback.body)?.[1];
check("footer: the pointed-at selector matches exactly one element", !!selector && (await js(`document.querySelectorAll(${JSON.stringify(JSON.parse(`"${selector}"`))}).length`)) === 1, selector ?? "no feedback sent");
await open("/demo/anchor/", 390);
check("gallery: no horizontal scroll at 390", await js("document.documentElement.scrollWidth <= innerWidth"));

chrome.kill();
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
