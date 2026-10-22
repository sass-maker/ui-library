import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { blogSchema } from "./lib/blog-policy.mjs";

const blog = defineCollection({
  loader: glob({
    base: "./products",
    pattern: "*/blog/*.md",
    generateId: ({ entry }) => {
      const [product, , file] = entry.split("/");
      const slug = file.replace(/\.md$/, "");
      if (!/^[a-z][a-z0-9-]*$/.test(product) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(`Invalid blog product or slug: ${entry}`);
      }
      return `${product}/${slug}`;
    }
  }),
  schema: blogSchema
});

export const collections = { blog };
