import { getPublishedPosts, blogPath } from "../../lib/blog";
import { site } from "../../site.config";
export async function GET() {
  const posts = await getPublishedPosts();
  return new Response(`# ${site.name} journal\n\n> Published product notes.\n\nCanonical: ${site.url}/blog/\n\n${posts.length ? posts.map(p => `- [${p.data.title}](${new URL(blogPath(p), site.url).href}) — ${p.data.description}`).join("\n") : "No published notes yet."}`, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
