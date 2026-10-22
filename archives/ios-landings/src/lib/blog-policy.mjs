import { z } from "astro/zod";

const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Use a real calendar date in YYYY-MM-DD format");

export const blogSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(240),
  seoTitle: z.string().trim().min(1).max(60).optional(),
  seoDescription: z.string().trim().min(1).max(160).optional(),
  author: z.string().trim().min(1),
  published: calendarDate,
  updated: calendarDate.optional(),
  draft: z.boolean().default(true),
  tags: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  cover: z.object({
    src: z.string().regex(/^\/images\/[a-zA-Z0-9_./-]+$/).refine((src) => !src.split("/").includes(".."), "Cover must stay inside product images"),
    alt: z.string().trim().min(1)
  }).optional()
}).refine((post) => !post.updated || post.updated >= post.published, {
  message: "Updated date cannot precede publication", path: ["updated"]
});

/** Every public route, feed and sitemap must use this same publication policy. */
export function publishedPosts(entries, product, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return entries.filter(({ id, data }) => {
    const parts = id.split("/");
    return parts.length === 2 && parts[0] === product &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parts[1]) &&
      data.draft === false && data.published <= today;
  }).sort((a, b) => b.data.published.localeCompare(a.data.published) || a.id.localeCompare(b.id));
}
