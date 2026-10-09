import * as React from "react";
import { ArrowUpRightIcon, CrosshairIcon, ImageIcon, MessageSquareIcon, SendIcon, SparklesIcon, XIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { AssistantLogo } from "./assistant-logos";

type LinkGroup = { title: string; links: { label: string; href: string }[] };
type StudioLink = { label: string; href: string };

const assistants = [
  { name: "Claude", action: "https://claude.ai/new" },
  { name: "ChatGPT", action: "https://chatgpt.com/" },
  { name: "Perplexity", action: "https://www.perplexity.ai/search" },
  { name: "Grok", action: "https://grok.com/" },
];

// The values SaaS Maker's /v1/feedback accepts.
const feedbackTypes = [
  { value: "bug", label: "Something broke" },
  { value: "feature", label: "An idea" },
  { value: "feedback", label: "General feedback" },
];

/** Must match SaaS Maker's server consent snapshot (CONSENT_COPY_V1.newsletter). */
const consentCopy = "I agree to receive newsletter emails about this product. I can unsubscribe at any time.";

const field =
  "w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25";
const chip =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-[0.8125rem] font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-accent";
const quietButton =
  "inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-accent";

const defaultStudio: StudioLink[] = [
  { label: "CodeVetter", href: "https://codevetter.com" },
  { label: "HeyPace", href: "https://heypace.app" },
  { label: "PostTrainLLM", href: "https://posttrainllm.com" },
  { label: "Live", href: "https://live.significanthobbies.com" },
  { label: "Kith", href: "https://kith.significanthobbies.com" },
];

/** Product updates sign-up: the most visible action in the footer. */
function Subscribe({ product, projectKey, catalogId }: { product: string; projectKey?: string; catalogId?: string }) {
  return (
    <form
      data-subscribe=""
      data-key={projectKey ?? ""}
      data-catalog={catalogId ?? ""}
      className="grid gap-6 rounded-[1.75rem] bg-card p-6 shadow-xs ring-1 ring-border sm:p-9 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12"
    >
      <div>
        <h2 className="font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-[1.05] text-balance">
          Get {product} updates
        </h2>
        <p className="mt-3 max-w-[26em] font-text text-[1.0625rem] leading-relaxed text-muted-foreground">
          A short note when something new ships. No spam, and you can leave with one click.
        </p>
      </div>
      <div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <label htmlFor="subscribe-email" className="sr-only">
            Email
          </label>
          <input
            id="subscribe-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
            className={field + " h-12 min-w-0 flex-1 rounded-full px-5 text-base placeholder:text-muted-foreground"}
          />
          <button
            type="submit"
            className="ui-case inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-primary px-6 text-[0.9375rem] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Subscribe
          </button>
        </div>
        <label className="mt-3 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
          <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]" />
          {consentCopy}
        </label>
        <p data-subscribe-status role="status" aria-live="polite" className="mt-2 text-sm text-foreground empty:hidden" />
      </div>
    </form>
  );
}

/** Ask AI: the question goes straight to the assistant the visitor picks. */
function AskAi({ product, url }: { product: string; url: string }) {
  const question = `What does ${product} (${url}) do, and who is it best for? Keep it concise.`;
  return (
    <form method="get" target="_blank" className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-brand-soft text-brand-ink">
          <SparklesIcon className="size-3.5" />
        </span>
        <label htmlFor="ask-ai" className="text-sm font-medium text-foreground">
          Ask AI about {product}
        </label>
      </div>
      <textarea id="ask-ai" name="q" rows={2} defaultValue={question} className={field + " mt-3 min-h-[4.5rem] resize-y py-2 leading-relaxed"} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {assistants.map((a) => (
          <button
            key={a.name}
            type="submit"
            formAction={a.action}
            aria-label={`Ask ${a.name}`}
            title={`Ask ${a.name}`}
            className="grid size-10 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-foreground/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
          >
            <AssistantLogo name={a.name} className="size-[1.125rem]" />
          </button>
        ))}
        <span className="ml-auto text-[0.6875rem] text-muted-foreground">Opens in a new tab</span>
      </div>
    </form>
  );
}

/** A button that opens the full feedback form: type, details, a pointed-at element, a screenshot and email. */
function Feedback({ product, feedbackKey }: { product: string; feedbackKey?: string }) {
  return (
    <>
      <button type="button" data-feedback-open="" className={quietButton}>
        <MessageSquareIcon aria-hidden className="size-4" />
        Send feedback
      </button>
      <dialog
        data-feedback-dialog=""
        aria-labelledby="fb-title"
        className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
      >
        <form id="feedback" data-feedback={feedbackKey ?? ""} data-product={product} className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="fb-title" className="font-display text-2xl">
                Send feedback
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Read by the person who builds {product}.</p>
            </div>
            <button type="button" data-feedback-close="" aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
              <XIcon className="size-4" />
            </button>
          </div>

          <fieldset className="mt-5 flex flex-wrap gap-2">
            <legend className="mb-2 text-xs font-medium text-muted-foreground">What is it about?</legend>
            {feedbackTypes.map((t, i) => (
              <label
                key={t.value}
                className={chip + " has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand-ink has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/25"}
              >
                <input type="radio" name="type" value={t.value} defaultChecked={i === 2} className="sr-only" />
                {t.label}
              </label>
            ))}
          </fieldset>

          <label htmlFor="fb-summary" className="mt-5 block text-xs font-medium text-muted-foreground">
            Summary
          </label>
          <input id="fb-summary" name="title" required maxLength={120} placeholder="One line" className={field + " mt-1.5 h-10 placeholder:text-muted-foreground"} />
          <label htmlFor="fb-message" className="mt-4 block text-xs font-medium text-muted-foreground">
            Details
          </label>
          <textarea
            id="fb-message"
            name="message"
            required
            minLength={4}
            maxLength={4000}
            rows={4}
            placeholder="What happened, or what would make it better?"
            className={field + " mt-1.5 min-h-[6rem] resize-y py-2 leading-relaxed placeholder:text-muted-foreground"}
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" data-feedback-point="" className={chip}>
              <CrosshairIcon aria-hidden className="size-3.5" />
              Point at something
            </button>
            <label className={chip + " has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/25"}>
              <ImageIcon aria-hidden className="size-3.5" />
              <span data-feedback-file-label="">Add a screenshot</span>
              <input type="file" name="screenshot" accept="image/png,image/jpeg,image/webp" className="sr-only" />
            </label>
          </div>
          <p data-feedback-anchor="" className="mt-2 hidden items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate" />
            <button type="button" data-feedback-unpoint="" className="shrink-0 underline underline-offset-2 hover:text-foreground">
              clear
            </button>
          </p>

          <label htmlFor="fb-email" className="mt-5 block text-xs font-medium text-muted-foreground">
            Email, if you want a reply
          </label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <input id="fb-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className={field + " h-10 min-w-0 flex-1 placeholder:text-muted-foreground"} />
            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Send
              <SendIcon aria-hidden className="size-3.5" />
            </button>
          </div>
          <p data-feedback-status role="status" aria-live="polite" className="mt-3 text-sm text-foreground empty:hidden" />
          <p className="mt-3 text-[0.6875rem] text-muted-foreground">Sends what you write, this page's address, and anything you point at or attach.</p>
        </form>
      </dialog>
    </>
  );
}

function StudioStrip({ product, studio }: { product: string; studio: StudioLink[] }) {
  const others = studio.filter((s) => s.label !== product);
  return (
    <nav aria-label="From the studio" className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-sm">
      <span className="text-muted-foreground">From the studio</span>
      {others.map((s) => (
        <a key={s.href} href={s.href} className="font-medium text-foreground transition-colors hover:text-brand-ink">
          {s.label}
        </a>
      ))}
      <a href="https://sassmaker.com" className="inline-flex items-center gap-0.5 font-medium text-foreground transition-colors hover:text-brand-ink">
        All projects <ArrowUpRightIcon aria-hidden className="size-3" />
      </a>
    </nav>
  );
}

/**
 * The Fleet studio footer contract: updates sign-up first, then the product
 * summary, Ask AI handoff and a feedback button, the wordmark, product
 * artwork, the studio strip and routes. Ask AI, feedback, subscribe and the
 * studio strip are always present. Feedback and subscribe post to SaaS Maker
 * through the small script in Base.astro; without keys they run in preview
 * mode and send nothing.
 */
export function StudioFooter({
  product,
  url,
  summary,
  groups,
  art,
  feedbackKey,
  subscribeKey,
  catalogId,
  studio = defaultStudio,
  legal,
  artMode = "panel",
  wordmark = "poster",
  variant = "studio",
  mark,
  className,
}: {
  product: string;
  url: string;
  summary: React.ReactNode;
  groups: LinkGroup[];
  art?: { src: string; alt: string; position?: string };
  /** SaaS Maker publishable project key for feedback. */
  feedbackKey?: string;
  /** Publishable key for the updates sign-up; defaults to feedbackKey. */
  subscribeKey?: string;
  /** Fleet catalog id; resolves the sign-up key when no key is given. */
  catalogId?: string;
  /** Sibling products for the studio strip; the current product is left out. */
  studio?: StudioLink[];
  legal?: React.ReactNode;
  /** panel: framed art under the wordmark. scene: full-bleed closing art the page fades into. */
  artMode?: "panel" | "scene";
  /**
   * How the wordmark meets the art (default poster). stack: wordmark, then the art.
   * fill: the art shows through the letters (no separate band).
   * poster: the wordmark sits on the art in light ink.
   */
  wordmark?: "stack" | "fill" | "poster";
  /** studio: full footer with link groups. gallery: the quiet footer for Gallery pages. */
  variant?: "studio" | "gallery";
  /** Small product mark shown beside the name in the gallery variant. */
  mark?: React.ReactNode;
  className?: string;
}) {
  const subscribe = <Subscribe product={product} projectKey={subscribeKey ?? feedbackKey} catalogId={catalogId} />;
  const feedback = <Feedback product={product} feedbackKey={feedbackKey} />;
  const wrap = variant === "gallery" ? "mx-auto w-full max-w-[75rem] px-[clamp(1.25rem,4vw,3.5rem)]" : "container-page";
  const wordmarkCls =
    "ui-case select-none overflow-hidden whitespace-nowrap text-center font-display text-[clamp(6rem,22vw,20rem)] font-bold leading-[0.8] tracking-[-0.06em]";
  // Long names shrink to stay on one line; short ones keep the full scale.
  const wordmarkSize = product.length > 8 ? { fontSize: `min(${(125 / product.length).toFixed(2)}vw, 20rem)` } : undefined;
  const artImg =
    art &&
    (variant === "gallery" || artMode === "scene" ? (
      <img
        src={art.src}
        alt={art.alt}
        loading="lazy"
        decoding="async"
        style={art.position ? { objectPosition: art.position } : undefined}
        className="mt-[clamp(1.5rem,4vw,3rem)] block h-[clamp(12rem,30vw,26rem)] w-full object-cover [mask-image:linear-gradient(to_bottom,transparent,black_35%)]"
      />
    ) : (
      <div className="container-page mt-6">
        <img
          src={art.src}
          alt={art.alt}
          loading="lazy"
          decoding="async"
          className="block aspect-[5/2] w-full object-cover [mask-image:radial-gradient(ellipse_75%_85%_at_50%_55%,black_55%,transparent_100%)] sm:aspect-[3/1]"
        />
      </div>
    ));

  return (
    <footer className={cn("overflow-hidden bg-surface pt-[clamp(4rem,7vw,6rem)]", variant === "studio" && "border-t border-border", className)}>
      <div className={wrap}>
        {subscribe}

        <div className="mt-[clamp(3rem,6vw,4.5rem)] grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div className="flex flex-col items-start gap-6">
            <div>
              <p className="flex items-center gap-2.5 font-display text-lg font-bold tracking-[-0.03em]">
                {mark}
                {product}
              </p>
              <p className="mt-3 max-w-[24em] font-text text-[1.0625rem] leading-relaxed text-muted-foreground">{summary}</p>
            </div>
            {feedback}
          </div>
          <AskAi product={product} url={url} />
        </div>

        {variant === "studio" && (
          <nav aria-label="Footer" className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((g) => (
              <div key={g.title}>
                <h2 className="eyebrow mb-4 text-foreground">{g.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {g.links.map((l) => (
                    <li key={l.href + l.label}>
                      <a href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}

        {!(art && wordmark === "poster") && (
          <p
            aria-hidden
            className={cn(wordmarkCls, "mt-[clamp(3.5rem,7vw,4.5rem)]", art && wordmark === "fill" ? "bg-cover bg-clip-text text-transparent" : "text-foreground/90")}
            style={{ ...wordmarkSize, ...(art && wordmark === "fill" && { backgroundImage: `url(${art.src})`, backgroundPosition: art.position ?? "center" }) }}
          >
            {product}
          </p>
        )}
      </div>
      {art && wordmark === "stack" && artImg}
      {art && wordmark === "poster" && (
        <div className="relative isolate mt-[clamp(2rem,5vw,3.5rem)] overflow-hidden">
          <img
            src={art.src}
            alt={art.alt}
            loading="lazy"
            decoding="async"
            style={art.position ? { objectPosition: art.position } : undefined}
            className="block h-[clamp(16rem,38vw,34rem)] w-full object-cover [mask-image:linear-gradient(to_bottom,transparent,black_30%)]"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
          <p
            aria-hidden
            className={cn(wordmarkCls, "absolute inset-x-0 bottom-[-0.02em] text-[#fbf5ec]")}
            style={wordmarkSize}
          >
            {product}
          </p>
        </div>
      )}

      <div className={cn(wrap, "pb-10", art && wordmark !== "fill" ? "pt-8" : "mt-14")}>
        <div className={cn("flex flex-col gap-4", !(art && wordmark !== "fill") && "border-t border-border pt-7")}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <StudioStrip product={product} studio={studio} />
            {legal && <p className="font-display text-[0.8125rem] text-muted-foreground">{legal}</p>}
          </div>
          {variant === "gallery" && (
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2.5 font-display text-[0.8125rem] text-muted-foreground">
              {groups.flatMap((g) => g.links).map((l) => (
                <a key={l.href + l.label} href={l.href} className="transition-colors hover:text-foreground">
                  {l.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
