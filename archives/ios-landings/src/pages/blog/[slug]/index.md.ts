import { getPublishedPosts } from "../../../lib/blog";
import { site } from "../../../site.config";
import type { CollectionEntry } from "astro:content";
export async function getStaticPaths() {
  return (await getPublishedPosts()).map(post => ({ params: { slug: post.id.split("/")[1] }, props: { post } }));
}
export function GET({ props }: { props: { post: CollectionEntry<"blog"> } }) {
  const { post } = props;
  return new Response(`# ${post.data.title}\n\n${site.name} · ${post.data.author} · ${post.data.published}\n\n${post.data.description}\n\n${post.body ?? ""}`, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
