import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { productContent } from "@saas-maker/templates/schema";

/** Every product page: src/content/<slug>.json, validated against the template schemas. */
export const collections = {
  products: defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content" }),
    schema: productContent,
  }),
};
