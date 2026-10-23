// Browser checks for the keyboard, focus and footer-send paths that type checks
// cannot see. No dependencies: drives a local Chrome over the DevTools protocol
// with real key events, and fakes api.sassmaker.com so nothing leaves the machine.
//
//   pnpm --filter ./site build && pnpm --filter ./site preview   # in one shell
//   pnpm check:browser                                           # in another
//
// --explorer checks the Storybook manager, templates and hosted asset paths.
// BASE_URL (default http://localhost:4321) and CHROME (path to Chrome) override.
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const explorer = process.argv.includes("--explorer");
const assets = new URL("../dist/_astro/", import.meta.url);
const motionChunk = !explorer && readdirSync(assets).find((file) => file.endsWith(".js") && /\bas initMotion\b/.test(readFileSync(new URL(file, assets), "utf8")));
if (!explorer && !motionChunk) throw new Error("Build the site before running browser checks.");

const base = (process.env.BASE_URL ?? "http://localhost:4321").replace(/\/$/, "");
const probePath = explorer ? "/index.json" : "/demo/identity-form/";
let probe;
for (let attempt = 0; attempt < (explorer ? 40 : 1); attempt++) {
  probe = await fetch(base + probePath).catch(() => null);
  if (probe?.ok) break;
  await probe?.arrayBuffer();
  if (explorer) await new Promise(resolve => setTimeout(resolve, 100));
}
if (!probe?.ok) throw new Error(`${base} does not serve this build (no ${probePath} page). A stale preview may be holding the port; stop it or run with BASE_URL pointing at this build's preview.`);
await probe.arrayBuffer();
const chromePath = process.env.CHROME ?? process.env.CHROME_BIN ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
if (!ws) { chrome.kill(); throw new Error("Chrome did not start; set CHROME to its path."); }
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
const KEYS = { Enter: [13, "\r"], " ": [32, " "], ArrowDown: [40], ArrowUp: [38], ArrowRight: [39], ArrowLeft: [37], Escape: [27], Tab: [9] };
async function press(key) {
  const [code, text] = KEYS[key];
  const name = key === " " ? "Space" : key;
  await cdp("Input.dispatchKeyEvent", { type: text ? "keyDown" : "rawKeyDown", key, code: name, windowsVirtualKeyCode: code, text });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code: name, windowsVirtualKeyCode: code });
  await sleep(120);
}
async function open(path, width = 1440) {
  await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 600 });
  const url = new URL(base + path);
  const navigation = await cdp("Page.navigate", { url: url.href });
  if (navigation.error || navigation.result?.errorText) throw new Error("Navigation failed: " + JSON.stringify(navigation));
  const query = JSON.stringify([...url.searchParams]);
  const correctPage = `location.pathname === ${JSON.stringify(url.pathname)} && ${query}.every(([key,value]) => new URLSearchParams(location.search).get(key) === value)`;
  const ready = `${correctPage} && document.readyState === 'complete' && !document.querySelector('astro-island[ssr]')${explorer && url.pathname.endsWith('/iframe.html') ? " && document.body.classList.contains('sb-show-main') && document.querySelector('#storybook-root')?.childElementCount > 0" : ""}`;
  let loaded = false;
  for (let i = 0; i < 80; i++) {
    await sleep(150);
    if (await js(ready)) { loaded = true; break; }
  }
  if (!loaded) throw new Error("Page did not render: " + JSON.stringify(await js("({url:location.href,title:document.title,body:document.body.innerText.slice(0,1000)})")));
  await sleep(150);
}
const waitFor = async (expr, ms = 4000) => { for (let t = 0; t < ms; t += 100) { if (await js(expr)) return true; await sleep(100); } return false; };

let failed = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : `: ${detail}`}`);
  if (!ok) failed++;
}

await cdp("Page.enable");
await cdp("Runtime.enable");

// Check the actual built templates under a project subdirectory, as Pages hosts them.
// This uses the same Chrome driver as the existing site checks, without new dependencies.
if (explorer) {
  try {
    await open("/?path=/story/start-here-overview--explore");
    check("explorer: manager renders its preview under the base path", await waitFor("document.querySelector('#storybook-preview-iframe')?.contentDocument?.querySelector('#storybook-root')?.childElementCount > 0"));
    await js("document.querySelector('#storybook-preview-iframe').contentDocument.querySelector('a[href*=\"start-here-composition\"]').click()");
    check("explorer: walkthrough links retain the manager and selected story", await waitFor("new URLSearchParams(location.search).get('path') === '/story/start-here-composition--from-atom-to-organism' && !!document.querySelector('#storybook-preview-iframe')?.contentDocument?.querySelector('#composition-atom')", 8000));
    await open("/?path=/story/interactions-inline-edit--in-context", 1440);
    check("source: Code panel is available", await waitFor("[...document.querySelectorAll('[role=tab]')].some(tab => tab.textContent.trim() === 'Code')", 8000));
    await js("[...document.querySelectorAll('[role=tab]')].find(tab => tab.textContent.trim() === 'Code').click()");
    check("source: contextual example includes its implementation and imports", await waitFor("[...document.querySelectorAll('pre')].some(pre => pre.textContent.includes('export function ProjectDetailsContext') && pre.textContent.includes('@saas-maker/ui/recipes/inline-edit'))", 8000));
    const checkedAssets = new Set();
    for (const width of [390, 820, 1440]) {
      for (const id of ["organisms-workspaces-asset-library--files", "organisms-workspaces-workspace-settings--settings", "organisms-workspaces-notification-inbox--inbox", "organisms-workspaces-project-overview--overview", "data-pricing-calculator--in-context", "motion-morphing-dialog--in-context", "start-here-overview--explore", "start-here-composition--from-atom-to-organism", "start-here-states--state-lab", "foundations-button--in-context", "inputs-input--in-context", "templates-console--workspace", "templates-console--gallery", "templates-console--workbench"]) {
        await open(`/iframe.html?id=${id}&viewMode=story`, width);
        const ready = await waitFor("document.querySelector('#storybook-root')?.childElementCount > 0");
        check(`explorer: ${id} renders at ${width}`, ready);
        if (!ready) continue;
        check(`explorer: ${id} fits at ${width}`, await js("document.documentElement.scrollWidth <= innerWidth + 1"));
        const urls = await js("[...document.querySelectorAll('#storybook-root img')].map(img => img.src)");
        for (const url of urls) {
          if (url.startsWith("data:") || checkedAssets.has(url)) continue;
          checkedAssets.add(url);
          const local = url.startsWith(base + "/");
          check("explorer: image stays under the hosted base path", local, url);
          if (local) {
            const response = await fetch(url);
            const body = await response.arrayBuffer();
            check("explorer: image asset exists", response.ok && body.byteLength > 0, url);
          }
        }
      }
    }

    const index = await (await fetch(base + "/index.json")).json();
    await open("/iframe.html?id=start-here-composition--from-atom-to-organism&viewMode=story", 390);
    check("composition: shared input renders", await waitFor("!!document.querySelector('#composition-atom')"));
    await js("document.querySelector('#composition-atom').focus(); document.querySelector('#composition-atom').select()");
    await cdp("Input.insertText", { text: "A shared workspace" });
    check("composition: all three layers edit the same draft", await waitFor("[...document.querySelectorAll('input:not([type=email])')].length === 3 && [...document.querySelectorAll('input:not([type=email])')].every(input => input.value === 'A shared workspace')"));
    await js("document.querySelector('button[type=submit]').click()");
    check("composition: saved value reaches the application", await waitFor("document.querySelector('.composition-connection strong')?.textContent === 'A shared workspace' && document.body.innerText.includes('All changes saved.')"));
    await js("document.querySelector('#composition-atom').focus(); document.querySelector('#composition-atom').select()");
    await cdp("Input.insertText", { text: " " });
    await js("document.querySelector('button[type=submit]').click()");
    check("composition: validation focuses the actual organism field", await waitFor("document.activeElement?.name === 'workspaceName' && document.activeElement.getAttribute('aria-invalid') === 'true'"));
    await js("[...document.querySelectorAll('button')].find(button => button.textContent.trim().toLowerCase() === 'discard').click()");
    check("composition: discard restores the saved value to every layer", await waitFor("[...document.querySelectorAll('input:not([type=email])')].every(input => input.value === 'A shared workspace') && !document.querySelector('[aria-invalid=true]')"));

    await open("/iframe.html?id=start-here-states--state-lab&viewMode=story", 390);
    check("states: state controls render", await waitFor("!!document.querySelector('[role=radio]')"));
    await js("[...document.querySelectorAll('[role=radio]')].find(button => button.textContent === 'Loading').click()");
    check("states: loading keeps the narrow file silhouette", await waitFor("!!document.querySelector('[aria-label=\"Loading files\"]')"));
    check("states: outgoing panels are inert during transitions", await js("[...document.querySelectorAll('[data-slot=transition-panel]')].every(panel => [...panel.children].filter(child => !child.inert).length <= 1)"));
    check("states: loading cards match the phone grid", await js("getComputedStyle(document.querySelector('[aria-label=\"Loading files\"]')).gridTemplateColumns.split(' ').length === 1"));
    await js("[...document.querySelectorAll('button')].find(button => button.textContent.trim().toLowerCase() === 'finish loading').click()");
    check("states: loading transitions to working files", await waitFor("document.querySelectorAll('button[aria-label^=\"Preview \"]:not([inert] *)').length === 6 && !document.querySelector('[aria-label=\"Loading files\"]:not([inert] *)')"));
    await js("[...document.querySelectorAll('[role=radio]')].find(button => button.textContent === 'Error').click()");
    check("states: failure offers recovery", await waitFor("document.body.innerText.includes('Files couldn’t be loaded')"));
    await js("[...document.querySelectorAll('button')].find(button => button.textContent.trim().toLowerCase() === 'try again').click()");
    check("states: retry recovers and retains meaningful focus", await waitFor("document.querySelectorAll('button[aria-label^=\"Preview \"]:not([inert] *)').length === 6 && document.activeElement?.tagName === 'H2'"));

    await open("/iframe.html?id=foundations-button--in-context&viewMode=story", 390);
    check("form example: response control renders", await waitFor("!!document.querySelector('[role=radio]')"));
    await js("[...document.querySelectorAll('[role=radio]')].find(button => button.textContent === 'Error').click()");
    check("form example: rejected response is selected before submitting", await waitFor("document.querySelector('[role=radio][aria-checked=true]')?.textContent === 'Error'"));
    await js("document.querySelector('button[type=submit]').click()");
    check("form example: pending action is stable and guarded", await js("document.querySelector('button[type=submit]').disabled && document.querySelector('button[type=submit]').getAttribute('aria-busy') === 'true'"));
    check("form example: a rejected request retains the draft", await waitFor("document.body.innerText.includes('Connection interrupted.') && document.querySelector('input[name=projectName]').value === 'Kith · the next chapter'"));
    await js("[...document.querySelectorAll('[role=radio]')].find(button => button.textContent === 'Success').click()");
    check("form example: successful response is selected before retrying", await waitFor("document.querySelector('[role=radio][aria-checked=true]')?.textContent === 'Success'"));
    await js("document.querySelector('button[type=submit]').click()");
    check("form example: retry reaches success", await waitFor("document.body.innerText.includes('Saved in this example.')"));

    for (const layer of ["Atoms", "Molecules", "Organisms", "Templates"]) {
      check("architecture: " + layer + " is discoverable", Object.values(index.entries).some(entry => entry.title.startsWith(layer + "/")));
    }
    await open("/iframe.html?id=organisms-workspaces-workspace-settings--settings&viewMode=story", 390);
    check("settings: form renders", await waitFor("!!document.querySelector('input[name=workspaceName]')"));
    await js("document.querySelector('input[name=workspaceName]').focus(); document.querySelector('input[name=workspaceName]').select()");
    await cdp("Input.insertText", { text: "  Kith, considered  " });
    await js("[...document.querySelectorAll('label')].find(label => label.textContent.includes('Make the next save fail')).querySelector('input').click(); [...document.querySelectorAll('button')].find(button => button.textContent.trim().toLowerCase() === 'save changes').click()");
    check("settings: failed save retains edits", await waitFor("document.body.innerText.includes('Your changes are still here.') && document.querySelector('input[name=workspaceName]').value === '  Kith, considered  '"));
    await js("[...document.querySelectorAll('label')].find(label => label.textContent.includes('Make the next save fail')).querySelector('input').click(); [...document.querySelectorAll('button')].find(button => button.textContent.trim().toLowerCase() === 'try again').click()");
    check("settings: retry saves normalized values", await waitFor("document.body.innerText.includes('All changes saved.') && document.querySelector('input[name=workspaceName]').value === 'Kith, considered'"));

    await open("/iframe.html?id=feedback-notification-bell--in-context&viewMode=story", 390);
    await js("document.querySelector('button[aria-label^=Notifications]').click()");
    check("notifications: anchored panel opens", await waitFor("!!document.querySelector('[role=region][aria-label=Notifications]')"));
    check("notifications: panel stays in the phone viewport", await js("(() => {const r=document.querySelector('[role=region][aria-label=Notifications]').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth + 1})()"));
    await press("Escape");
    check("notifications: Escape closes and restores focus", await waitFor("!document.querySelector('[role=region][aria-label=Notifications]') && document.activeElement?.getAttribute('aria-label')?.startsWith('Notifications')"));

    await open("/iframe.html?id=organisms-workspaces-asset-library--files&viewMode=story", 390);
    check("files: search renders", await waitFor("!!document.querySelector('input[aria-label=\"Search files\"]')"));
    await js("document.querySelector('input[aria-label=\"Search files\"]').focus()");
    await cdp("Input.insertText", { text: "no-such-file" });
    check("files: search exposes an empty result", await waitFor("document.body.innerText.includes('No matching files')"));
    await js("document.querySelector('button[aria-label=\"Clear search files\"]').click()");
    check("files: clearing restores results and focus", await waitFor("!!document.querySelector('button[aria-label^=\"Preview \"]') && document.activeElement?.getAttribute('aria-label') === 'Search files'"));
    await js("document.querySelector('button[aria-label^=\"Preview \"]').click()");
    check("files: preview opens", await waitFor("!!document.querySelector('[role=dialog]')"));
    await press("Escape");
    check("files: preview returns focus", await waitFor("!document.querySelector('[role=dialog]') && document.activeElement?.getAttribute('aria-label')?.startsWith('Preview ')"));


    await open("/iframe.html?id=organisms-workspaces-notification-inbox--inbox&viewMode=story", 390);
    check("inbox: message list renders", await waitFor("[...document.querySelectorAll('button')].some(button => button.textContent.includes('The small things are coming together'))"));
    await js("[...document.querySelectorAll('button')].find(button => button.textContent.includes('The small things are coming together')).click()");
    check("inbox: phone detail receives focus", await waitFor("document.activeElement?.tagName === 'H3' && document.activeElement.textContent.includes('The small things are coming together')"));
    await js("[...document.querySelectorAll('button')].find(button => button.textContent.trim().toLowerCase() === 'inbox').click()");
    check("inbox: back returns focus to its message", await waitFor("document.activeElement?.tagName === 'BUTTON' && document.activeElement.textContent.includes('The small things are coming together')"));

    await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    for (const id of ["motion-text-effect--in-context", "effects-border-beam--playground"]) {
      await open("/iframe.html?id=" + id + "&viewMode=story", 390);
      check("motion: reduced mode leaves no blur in " + id, await js("[...document.querySelectorAll('#storybook-root *')].every(element => !getComputedStyle(element).filter.includes('blur(') || getComputedStyle(element).filter.includes('blur(0px)'))"));
      check("motion: reduced mode stops loops in " + id, await js("document.getAnimations().every(animation => animation.playState !== 'running' || animation.effect?.getTiming().iterations !== Infinity)"));
    }
    await cdp("Emulation.setEmulatedMedia", { features: [] });

    await open("/iframe.html?id=effects-code-comparison--playground&viewMode=story", 820);
    check("code: scroll region renders", await waitFor("!!document.querySelector('[aria-label^=\"before code:\"]')"));
    await js("document.querySelector('[aria-label^=\"before code:\"]').focus()");
    await press("ArrowRight");
    check("code: keyboard scrolls long lines", await waitFor("document.activeElement?.getAttribute('aria-label')?.startsWith('before code:') && document.activeElement.scrollLeft > 0"));
    await press("Tab");
    check("code: both panels are reachable by Tab", await waitFor("document.activeElement?.getAttribute('aria-label')?.startsWith('after code:')"));


    for (const theme of ["paper", "hearth", "gallery"]) {
      await open("/iframe.html?id=navigation-tabs--playground&viewMode=story&globals=theme:" + theme + ";mode:light", 820);
      const tabContrast = await js(`(() => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const luminance = rgb => rgb.map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126,.7152,.0722][index], 0);
        return [...document.querySelectorAll('[data-slot=tabs-trigger][data-state=inactive]')].map(tab => {
          context.clearRect(0,0,1,1);
          context.fillStyle = getComputedStyle(tab.closest('[data-slot=tabs-list]')).backgroundColor;
          context.fillRect(0,0,1,1);
          const background = luminance([...context.getImageData(0,0,1,1).data].slice(0,3));
          context.fillStyle = getComputedStyle(tab).color;
          context.fillRect(0,0,1,1);
          const foreground = luminance([...context.getImageData(0,0,1,1).data].slice(0,3));
          return (Math.max(background,foreground)+.05)/(Math.min(background,foreground)+.05);
        });
      })()`);
      check("tabs: inactive labels have AA contrast in " + theme, tabContrast.length > 0 && tabContrast.every(ratio => ratio >= 4.5), tabContrast.join(", "));
    }

    await open("/iframe.html?id=templates-console--gallery&viewMode=story", 1440);
    check("motion: template initializes offscreen reveals", await waitFor("[...document.querySelectorAll('.motion-reveal,.motion-stagger > *')].some(element => element.style.opacity === '0')"));
    await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    check("motion: live reduced preference restores hidden content", await waitFor("[...document.querySelectorAll('.motion-reveal,.motion-stagger > *')].every(element => element.style.opacity !== '0')"));
    await cdp("Emulation.setEmulatedMedia", { features: [] });

  } finally {
    ws.close();
    chrome.kill();
  }
  console.log(failed ? `\n${failed} explorer check(s) failed` : "\nall explorer checks passed");
  process.exit(failed ? 1 : 0);
}

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

// Phase A: actual cascade contrast, app palette inheritance and responsive demos.
const paletteChecks = `(() => {
  const root = document.documentElement, original = root.getAttribute('style');
  const theme = root.dataset.theme, mode = root.dataset.mode;
  const probe = document.createElement('span'); document.body.append(probe);
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const luminance = role => {
    probe.style.color = 'var(--' + role + ')'; ctx.fillStyle = getComputedStyle(probe).color;
    ctx.fillRect(0, 0, 1, 1);
    const c = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(x => x / 255)
      .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
  };
  const ratio = (a,b) => { const x=luminance(a), y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
  const failures = [];
  try {
    root.removeAttribute('style'); root.dataset.mode = 'dark';
    for (const preset of ['base','paper','hearth','signal','gallery','ink']) {
      root.dataset.theme = preset;
      for (const text of ['foreground','muted-foreground']) for (const bg of ['background','card'])
        if (ratio(text,bg) < 4.5) failures.push(preset + ':' + text + '/' + bg);
      if (ratio('brand','brand-foreground') < 4.5) failures.push(preset + ':brand text');
      if (ratio('brand','background') < 3) failures.push(preset + ':brand/background');
      if (getComputedStyle(root).colorScheme !== 'dark') failures.push(preset + ':color-scheme');
    }
  } finally { probe.remove(); root.dataset.theme=theme; root.dataset.mode=mode; if(original === null) root.removeAttribute('style'); else root.setAttribute('style',original); }
  return failures;
})()`;
await open('/demo/dark-gallery/');
const paletteFailures = await js(paletteChecks);
check('dark: every theme has AA text and brand contrast in the actual cascade', paletteFailures.length === 0, paletteFailures.join(', '));
for (const slug of ['dark-gallery', 'dark-workbench', 'from-app']) {
  for (const width of [390, 1440]) {
    await open('/demo/' + slug + '/', width);
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await js('document.fonts.ready');
    check(slug + ': dark at ' + width, await js("document.documentElement.dataset.mode === 'dark' && getComputedStyle(document.documentElement).colorScheme === 'dark'"));
    check(slug + ': no horizontal scroll at ' + width, await js('document.documentElement.scrollWidth <= innerWidth'));
    check(slug + ': no broken images at ' + width, await js("[...document.images].every(i => !i.complete || i.naturalWidth > 0)"));
    if (slug === 'from-app') {
      const app = JSON.parse(readFileSync(new URL('../src/content/from-app.json', import.meta.url), 'utf8')).page.fromApp;
      check('from-app: background, text, card, border and brand inherit into footer', await js(`(() => {
        const root = getComputedStyle(document.documentElement), footer = getComputedStyle(document.querySelector('footer'));
        return Object.entries(${JSON.stringify(app)}).filter(([k]) => !['fonts','radius'].includes(k)).every(([k,v]) => {
          const role = '--' + k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
          return root.getPropertyValue(role).trim() === v && footer.getPropertyValue(role).trim() === v;
        }) && root.getPropertyValue('--font-text').includes('Geist') && root.getPropertyValue('--font-display').includes('Figtree');
      })()`));
    }
    if (process.env.SCREENSHOT_DIR) {
      mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
      // Load lazy images before taking the full page capture.
      await js("Promise.all([...document.images].map(i => { i.loading='eager'; return i.decode().catch(()=>{}); }))");
      const metrics = await cdp('Page.getLayoutMetrics');
      const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height: metrics.result.cssContentSize.height, scale: 1 } });
      writeFileSync(join(process.env.SCREENSHOT_DIR, slug + '-' + width + '.png'), Buffer.from(shot.result.data, 'base64'));
    }
  }
}
await cdp('Emulation.setEmulatedMedia', { features: [] });

// Every Gallery section kind keeps its content id on the rendered section.
const sectionKinds = new Set();
for (const slug of ["kith", "live", "anchor"]) {
  const content = JSON.parse(readFileSync(new URL(`../src/content/${slug}.json`, import.meta.url), "utf8"));
  await open(`/demo/${slug}/`);
  for (const section of content.sections.filter((s) => s.id)) {
    sectionKinds.add(section.kind);
    check(`gallery: ${slug} ${section.kind} #${section.id}`, await js(`document.getElementById(${JSON.stringify(section.id)})?.tagName === 'SECTION'`));
  }
  const privacyUrl = content.footer.privacyUrl ?? "https://sassmaker.com/privacy";
  check(`gallery: ${slug} privacy links use the content URL or default`, await js(`(() => { const links = [...document.querySelectorAll('form[data-subscribe] a, [data-feedback-dialog] a')].filter((a) => a.textContent === 'Privacy'); return links.length === 2 && links.every((a) => a.getAttribute('href') === ${JSON.stringify(privacyUrl)}); })()`));
  check(`motion: ${slug} initializes after lazy loading`, await waitFor("document.querySelector('.motion-parallax')?.style.transform || document.querySelector('.motion-reveal[style]')"));
}
check("gallery: all section kinds have DOM id coverage", ["grid", "showcase", "spread", "cover", "statement", "faq"].every((kind) => sectionKinds.has(kind)));

// Native form labels and progressive validation, without React hydration.
await open("/demo/identity-form/", 390);
check("form hero: label association and invalid alert", await js(`(() => {
  const f = document.querySelector('[data-identity-form]'), i = f.querySelector('input');
  f.requestSubmit();
  return i.labels[0]?.htmlFor === i.id && i.getAttribute('aria-invalid') === 'true'
    && !f.querySelector('[role=alert]').hidden && !!f.querySelector('[role=alert]').textContent
    && i.getAttribute('aria-describedby').split(' ').every(id => !!document.getElementById(id));
})()`));

// ── Data demo: FacetFilter by keyboard, compare picks from the URL, selection counter
await open("/demo/data/?pick=nowhere,lisbon-portugal,lisbon-portugal");
check("motion: a page without motion classes never loads the motion chunk", await js(`!document.querySelector('.motion-reveal,.motion-stagger,.motion-zoom,.motion-tilt,.motion-parallax,.motion-drift,.motion-draw,.motion-type') && !performance.getEntriesByType('resource').some((r) => r.name.endsWith('/' + ${JSON.stringify(motionChunk)}))`));
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

// ── Loading demo: same-shape placeholder, retry recovery and cached revisit
await open("/demo/loading/", 390);
check("loading: skeleton appears for a slow request", await waitFor("!!document.querySelector('[data-resource-demo] [role=status][aria-busy=true]')"));
check("loading: no horizontal scroll at 390", await js("document.documentElement.scrollWidth <= innerWidth"));
check("loading: slow request resolves", await waitFor("!!document.querySelector('[data-loaded-record]')"));
await js("document.querySelector('[data-revisit]').click()");
await js("document.querySelector('[data-revisit]').click()");
check("loading: revisit uses cached content immediately", await js("!!document.querySelector('[data-loaded-record]') && !document.querySelector('[data-resource-demo] [aria-busy=true]')"));
await js("document.querySelector('[data-mode=error]').click()");
check("loading: error offers try again", await waitFor("[...document.querySelectorAll('[data-resource-demo] button')].some(b => b.textContent === 'try again')"));
await js("[...document.querySelectorAll('[data-resource-demo] button')].find(b => b.textContent === 'try again').click()");
check("loading: retry recovers", await waitFor("!!document.querySelector('[data-loaded-record]')"));
await js("document.querySelector('[data-mode=empty]').click()");
check("loading: empty result is distinct", await waitFor("document.querySelector('[data-resource-demo]')?.dataset.resourceStatus === 'empty'"));

await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
check("loading: reduced motion stops pulse", await js("[...document.querySelectorAll('[data-slot=skeleton]')].every(b => getComputedStyle(b).animationName === 'none')"));
await js("document.querySelector('[data-mode=fast]').click()");
check("loading: fast request avoids a visible placeholder", await js("(() => new Promise(resolve => { let flashed = false; const sample = () => { const bone = document.querySelector('[data-resource-demo] [data-slot=card-skeleton]'); if (bone && getComputedStyle(bone.parentElement).visibility !== 'hidden') flashed = true; }; const timer = setInterval(sample, 10); setTimeout(() => { clearInterval(timer); resolve(!flashed && !!document.querySelector('[data-loaded-record]')); }, 250); }))()"));
await cdp("Emulation.setEmulatedMedia", { features: [] });

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
