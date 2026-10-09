import { z } from "astro/zod";

/**
 * The content-file format. A product page is one JSON file that must match
 * one of these schemas; the site build validates every file and fails with
 * the exact path of any mistake. Text fields accept *phrase* for the accent.
 */

const link = z.object({ label: z.string(), href: z.string(), icon: z.string().optional() }).strict();
const screen = z
  .object({
    src: z.string(),
    alt: z.string().min(1),
    /** Round elements (in screenshot pixels) that gently breathe: the screen's one live moment. */
    spots: z.array(z.object({ x: z.number(), y: z.number(), r: z.number() }).strict()).optional(),
  })
  .strict();
const caption = z.object({ lead: z.string().optional(), text: z.string().optional() }).strict();
const tone = z.enum(["neutral", "success", "danger", "warning", "brand"]);
const pill = z.object({ tone, label: z.string() }).strict();

export const pageSettings = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    theme: z.enum(["base", "paper", "ink", "hearth", "signal", "gallery"]).optional(),
    mode: z.enum(["light", "dark"]).optional(),
    /** Brand overrides, e.g. { "--brand": "oklch(...)" }. */
    tokens: z.record(z.string(), z.string()).optional(),
    icon: z.string().optional(),
  })
  .strict();

const footer = z
  .object({
    summary: z.string(),
    legal: z.string().optional(),
    /** SaaS Maker publishable project key for the feedback card. */
    feedbackKey: z.string().optional(),
    /** Publishable key for the updates sign-up; defaults to feedbackKey. */
    subscribeKey: z.string().optional(),
    /** Fleet catalog id; resolves the sign-up key when no key is given. */
    catalogId: z.string().optional(),
  })
  .strict();

// ── Gallery ──────────────────────────────────────────────────────────────

const tile = z.object({ image: z.string(), alt: z.string(), label: z.string().optional(), title: z.string(), href: z.string().optional() }).strict();

const gallerySection = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("grid"), id: z.string().optional(), eyebrow: z.string().optional(), title: z.string(), lede: z.string().optional(), items: z.array(tile).min(1) }).strict(),
  z.object({ kind: z.literal("faq"), id: z.string().optional(), title: z.string().optional(), lede: z.string().optional(), items: z.array(z.object({ q: z.string(), a: z.string() }).strict()) }).strict(),
  z.object({ kind: z.literal("showcase"), id: z.string().optional(), eyebrow: z.string().optional(), title: z.string(), lede: z.string().optional(), screen, caption: caption.optional(), note: z.string().optional() }).strict(),
  z.object({ kind: z.literal("spread"), id: z.string().optional(), eyebrow: z.string().optional(), title: z.string(), lede: z.string().optional(), backdrop: z.string().optional(), screen, caption: caption.optional() }).strict(),
  z.object({ kind: z.literal("cover"), id: z.string().optional(), eyebrow: z.string().optional(), title: z.string(), lede: z.string().optional(), image: z.string(), screen: screen.optional(), credit: z.string().optional() }).strict(),
  z
    .object({
      kind: z.literal("statement"),
      id: z.string().optional(),
      eyebrow: z.string().optional(),
      title: z.string(),
      lede: z.string().optional(),
      rows: z.array(z.object({ title: z.string(), body: z.string(), status: z.string().optional(), on: z.boolean().optional() }).strict()).optional(),
      aside: z.array(z.object({ title: z.string(), body: z.string() }).strict()).optional(),
    })
    .strict(),
]);

export const galleryContent = z
  .object({
    template: z.literal("gallery"),
    page: pageSettings,
    product: z.string(),
    url: z.string().url(),
    mark: z.string(),
    /** Pixel size of the phone screenshots, for layout stability. */
    screenSize: z.object({ width: z.number(), height: z.number() }).strict().optional(),
    nav: z.array(link),
    headerAction: link,
    /** A device hero (backdrop + screen) or a full-bleed photo cover (image). */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string(),
        lede: z.string().optional(),
        primary: link,
        secondary: link.optional(),
        note: z.string().optional(),
        backdrop: z.string().optional(),
        screen: screen.optional(),
        image: z.string().optional(),
      })
      .strict()
      .refine((h) => (h.backdrop && h.screen) || h.image, { message: "hero needs backdrop + screen, or image" }),
    sections: z.array(gallerySection),
    closing: z.object({ id: z.string().optional(), title: z.string(), primary: link, note: z.string().optional(), image: z.string(), credit: z.string().optional() }).strict(),
    footer: footer
      .extend({
        links: z.array(link),
        /** Wide artwork under the wordmark; position is a CSS object-position. */
        art: z.object({ src: z.string(), alt: z.string(), position: z.string().optional() }).strict().optional(),
        /** How the wordmark meets the art: poster (default), fill (art inside the letters) or stack. */
        wordmark: z.enum(["stack", "fill", "poster"]).optional(),
      })
      .strict(),
  })
  .strict();

// ── Workbench ────────────────────────────────────────────────────────────

const workbenchBlock = z.discriminatedUnion("type", [
  z.object({ type: z.literal("steps"), items: z.array(z.object({ title: z.string(), body: z.string(), code: z.string().optional(), pill: pill.optional() }).strict()) }).strict(),
  z.object({ type: z.literal("stats"), items: z.array(z.object({ value: z.string(), label: z.string(), note: z.string().optional() }).strict()) }).strict(),
  z
    .object({
      type: z.literal("features"),
      variant: z.enum(["ruled", "cards", "plain"]).optional(),
      items: z.array(z.object({ icon: z.string().optional(), title: z.string(), body: z.string(), meta: z.string().optional() }).strict()),
    })
    .strict(),
  z
    .object({
      type: z.literal("spread"),
      items: z.array(
        z
          .object({
            kicker: z.string().optional(),
            title: z.string(),
            body: z.string(),
            diff: z
              .object({
                file: z.string(),
                lines: z.array(
                  z.object({ kind: z.enum(["add", "del", "ctx"]), text: z.string(), note: z.object({ pill: pill.optional(), text: z.string() }).strict().optional() }).strict(),
                ),
              })
              .strict()
              .optional(),
            code: z.object({ label: z.string().optional(), code: z.string() }).strict().optional(),
            /** A cropped detail of the product window: one focal point. */
            detail: z
              .object({
                src: z.string(),
                alt: z.string(),
                width: z.number(),
                height: z.number(),
                /** Region of the full image to show, in its pixels. */
                crop: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }).strict(),
              })
              .strict()
              .optional(),
          })
          .strict(),
      ),
    })
    .strict(),
  z
    .object({
      type: z.literal("statement"),
      eyebrow: z.string().optional(),
      title: z.string(),
      lede: z.string().optional(),
      points: z.array(z.object({ title: z.string(), body: z.string() }).strict()).optional(),
    })
    .strict(),
  z.object({ type: z.literal("faq"), title: z.string().optional(), lede: z.string().optional(), items: z.array(z.object({ q: z.string(), a: z.string() }).strict()) }).strict(),
  z.object({ type: z.literal("cta"), title: z.string(), lede: z.string().optional(), primary: link, secondary: link.optional(), note: z.string().optional() }).strict(),
]);

export const workbenchContent = z
  .object({
    template: z.literal("workbench"),
    page: pageSettings,
    product: z.string(),
    url: z.string().url(),
    mark: z.string(),
    nav: z.array(link),
    header: z.object({ primary: link, secondary: link.optional() }).strict(),
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string(),
        lede: z.string().optional(),
        primary: link,
        secondary: link.optional(),
        note: z.string().optional(),
        window: z
          .object({ title: z.string(), src: z.string(), alt: z.string(), width: z.number(), height: z.number(), chrome: z.enum(["mac", "browser", "none"]).optional() })
          .strict(),
        /** Artwork behind the window; without it the stage is a soft brand mesh. */
        backdrop: z.string().optional(),
        receipt: z
          .object({
            title: z.string(),
            meta: z.string().optional(),
            rows: z.array(z.object({ label: z.string(), value: z.string(), mono: z.boolean().optional(), strong: z.boolean().optional(), status: pill.optional() }).strict()),
          })
          .strict()
          .optional(),
        caption: z.string().optional(),
        facts: z.array(z.string()).optional(),
        /** Brand brackets framing the stage (the CodeVetter mark's code scope). */
        brackets: z.boolean().optional(),
      })
      .strict(),
    sections: z.array(
      z
        .object({
          id: z.string().optional(),
          surface: z.enum(["default", "muted"]).optional(),
          compact: z.boolean().optional(),
          header: z.object({ eyebrow: z.string().optional(), title: z.string(), lede: z.string().optional(), align: z.enum(["start", "center", "split"]).optional() }).strict().optional(),
          blocks: z.array(workbenchBlock),
        })
        .strict(),
    ),
    footer: footer.extend({ groups: z.array(z.object({ title: z.string(), links: z.array(link) }).strict()) }).strict(),
  })
  .strict();

export const productContent = z.discriminatedUnion("template", [galleryContent, workbenchContent]);

export type PageSettings = z.infer<typeof pageSettings>;
export type GalleryContent = z.infer<typeof galleryContent>;
export type GallerySection = GalleryContent["sections"][number];
export type WorkbenchContent = z.infer<typeof workbenchContent>;
export type WorkbenchBlock = z.infer<typeof workbenchBlock>;
export type ProductContent = z.infer<typeof productContent>;
