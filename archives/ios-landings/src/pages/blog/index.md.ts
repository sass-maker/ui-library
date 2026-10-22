import { getPublishedPosts, blogPath } from "../../lib/blog";
import { site } from "../../site.config";
export async function GET() {
  const posts = await getPublishedPosts();
  return new Response(`# ${site.name} journal\n\n${posts.length ? posts.map(p => `- [${p.data.title}](${blogPath(p)}) — ${p.data.description}`).join("\n") : "No published notes yet."}`, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
