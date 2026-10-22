import { getCollection, type CollectionEntry } from "astro:content";
import { publishedPosts } from "./blog-policy.mjs";
import { productId } from "../site.config";
import { screenshotMetadata } from "./screenshot-metadata.mjs";

export async function getPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
  const posts: CollectionEntry<"blog">[] = publishedPosts(await getCollection("blog"), productId);
  await Promise.all(posts.map(async (post) => {
    if (post.data.cover) await screenshotMetadata(productId, post.data.cover.src);
  }));
  return posts;
}

export const escapeXml = (value: string) => value.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]!));

export function blogPath(post: CollectionEntry<"blog">): string {
  return `/blog/${post.id.split("/")[1]}/`;
}
