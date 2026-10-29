import { createServer } from "node:http";
import { outputDir } from "../sites/daddyrad/compose.mjs";
import { directoryAssets } from "../sites/daddyrad/static-assets.mjs";
import { ORIGIN } from "../sites/daddyrad/products.mjs";
import worker from "../sites/daddyrad/worker.mjs";

const env = { ASSETS: directoryAssets(outputDir) };
const port = Number(process.env.PORT ?? 4322);
createServer(async (incoming, outgoing) => {
  try {
    const response = await worker.fetch(new Request(new URL(incoming.url, ORIGIN), { method: incoming.method, headers: incoming.headers }), env);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    outgoing.writeHead(500);
    outgoing.end("Preview failed");
  }
}).listen(port, "127.0.0.1", () => console.log(`DaddyRad Worker preview: http://127.0.0.1:${port} (generated assets, production hostname and CSP)`));
