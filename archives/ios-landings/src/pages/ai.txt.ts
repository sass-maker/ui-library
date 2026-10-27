import { markdownRegistry } from '../lib/markdown-registry';
import { site } from '../site.config';
export const prerender = true;
export async function GET() {
  const { handler } = await markdownRegistry();
  return handler(new Request(`${site.url}/ai.txt`));
}
