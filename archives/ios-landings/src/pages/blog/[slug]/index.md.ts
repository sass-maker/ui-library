import { absoluteMarkdownLinks } from '../../../lib/agent-surfaces/format.mjs';
import { getPublishedPosts, blogPath } from "../../../lib/blog";
import { site } from "../../../site.config";
import type { CollectionEntry } from "astro:content";
export async function getStaticPaths() {
  return (await getPublishedPosts()).map(post => ({ params: { slug: post.id.split("/")[1] }, props: { post } }));
}
export function GET({ props }: { props: { post: CollectionEntry<"blog"> } }) {
  const { post } = props;
  return new Response(`# ${post.data.title}\n\n> ${post.data.description}\n\nCanonical: ${new URL(blogPath(post), site.url).href}\nLast updated: ${post.data.updated ?? post.data.published}\n\n${site.name} · ${post.data.author} · ${post.data.published}\n\n${absoluteMarkdownLinks(post.body ?? "", new URL(blogPath(post), site.url).href)}`, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
