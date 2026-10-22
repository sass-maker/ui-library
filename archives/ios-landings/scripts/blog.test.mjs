import { test } from "node:test";
import assert from "node:assert/strict";
import { blogSchema, publishedPosts } from "../src/lib/blog-policy.mjs";

const base = { title: "A useful note", description: "What the observation means.", author: "Significant Hobbies", published: "2026-09-19" };
const entry = (id, changes = {}) => ({ id, data: blogSchema.parse({ ...base, draft: false, ...changes }) });

test("new posts default to unpublished drafts", () => {
  assert.equal(blogSchema.parse(base).draft, true);
  assert.deepEqual(publishedPosts([{ id: "kith/note", data: blogSchema.parse(base) }], "kith"), []);
});

test("publication is product-isolated and excludes drafts and future dates", () => {
  const posts = [entry("kith/current"), entry("anchor/current"), entry("kith/future", { published: "2026-09-20" }), entry("kith/draft", { draft: true }), entry("kithish/current"), entry("kith/../escape")];
  assert.deepEqual(publishedPosts(posts, "kith", new Date("2026-09-19T12:00:00Z")).map(p => p.id), ["kith/current"]);
});

test("dates, readable metadata and accessible local cover metadata are validated", () => {
  for (const changes of [{ published: "2026-02-30" }, { published: "tomorrow" }, { updated: "2026-09-18" }, { title: " " }, { author: "" }, { cover: { src: "/images/../secret", alt: "Cover" } }, { cover: { src: "https://example.com/cover.png", alt: "Cover" } }, { cover: { src: "/images/cover.png", alt: "" } }]) {
    assert.equal(blogSchema.safeParse({ ...base, ...changes }).success, false, JSON.stringify(changes));
  }
  assert.equal(blogSchema.safeParse({ ...base, cover: { src: "/images/ports.png", alt: "A port inspection" } }).success, true);
});

test("sorting is newest first with deterministic ties", () => {
  const posts = [entry("kith/z"), entry("kith/old", { published: "2026-09-18" }), entry("kith/a")];
  assert.deepEqual(publishedPosts(posts, "kith", new Date("2026-09-19T12:00:00Z")).map(p => p.id), ["kith/a", "kith/z", "kith/old"]);
});
