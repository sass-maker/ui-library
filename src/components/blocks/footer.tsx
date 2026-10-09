import * as React from "react";
import { ArrowUpRightIcon, MessageSquareIcon, SendIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type LinkGroup = { title: string; links: { label: string; href: string }[] };

const assistants = [
  { name: "Claude", action: "https://claude.ai/new" },
  { name: "ChatGPT", action: "https://chatgpt.com/" },
  { name: "Perplexity", action: "https://www.perplexity.ai/search" },
  { name: "Grok", action: "https://grok.com/" },
];

const feedbackTypes = [
  { value: "feedback", label: "Feedback" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Idea" },
];

const field =
  "w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25";
const chip =
  "inline-flex h-8 items-center gap-1 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-accent";

const studio = [
  { label: "CodeVetter", href: "https://codevetter.com" },
  { label: "HeyPace", href: "https://heypace.app" },
  { label: "PostTrainLLM", href: "https://posttrainllm.com" },
  { label: "Live", href: "https://live.significanthobbies.com" },
];

/**
 * The Fleet studio footer contract: product summary and routes, Ask AI handoff,
 * feedback, optional newsletter, wordmark, product artwork, then the studio line.
 * Ask AI and feedback are always present. Ask AI is a GET form with
 * per-assistant targets; feedback posts to SaaS Maker through the small
 * script in Base.astro.
 */
export function StudioFooter({
  product,
  url,
  summary,
  groups,
  art,
  newsletterAction,
  feedbackKey,
  legal,
  artMode = "panel",
  className,
}: {
  product: string;
  url: string;
  summary: React.ReactNode;
  groups: LinkGroup[];
  art?: { src: string; alt: string };
  newsletterAction?: string;
  /** SaaS Maker publishable project key. Without it the form runs in preview mode and sends nothing. */
  feedbackKey?: string;
  legal?: React.ReactNode;
  /** panel: framed art under the wordmark. scene: full-bleed closing art the page fades into. */
  artMode?: "panel" | "scene";
  className?: string;
}) {
  const question = `What does ${product} (${url}) do, and who is it best for? Keep it concise.`;
  return (
    <footer className={cn("border-t border-border bg-surface", className)}>
      <div className="container-page grid gap-12 py-16 md:py-20 lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-5">
          <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">{summary}</p>
        </div>
        <div className="flex flex-col gap-10 lg:col-span-6 lg:col-start-7">
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
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
          {newsletterAction && (
            <form action={newsletterAction} method="post" className="flex max-w-md flex-col gap-2">
              <label htmlFor="newsletter" className="text-sm font-medium text-foreground">
                {product} updates
              </label>
              <div className="flex gap-2">
                <input
                  id="newsletter"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={field + " h-10 min-w-0 flex-1 placeholder:text-muted-foreground"}
                />
                <button type="submit" className="h-10 shrink-0 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                  Subscribe
                </button>
              </div>
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" name="consent" required className="mt-0.5 accent-[var(--brand)]" />
                Occasional product notes. Unsubscribe any time.
              </label>
            </form>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:col-span-12">
          <form method="get" target="_blank" className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-brand-soft text-brand">
                <SparklesIcon className="size-3.5" />
              </span>
              <label htmlFor="ask-ai" className="text-sm font-medium text-foreground">
                Ask AI about {product}
              </label>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Opens your question in a new tab with the assistant you choose.</p>
            <textarea
              id="ask-ai"
              name="q"
              rows={3}
              defaultValue={question}
              className={field + " mt-3 min-h-[5.5rem] resize-y py-2 leading-relaxed"}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {assistants.map((a) => (
                <button key={a.name} type="submit" formAction={a.action} className={chip}>
                  {a.name}
                  <ArrowUpRightIcon aria-hidden className="size-3 text-muted-foreground" />
                </button>
              ))}
            </div>
            <p className="mt-auto pt-3 text-[0.6875rem] text-muted-foreground">Goes straight to the assistant. {product} never sees your question.</p>
          </form>

          <form
            id="feedback"
            data-feedback={feedbackKey ?? ""}
            data-product={product}
            className="group/fb rounded-xl border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-brand-soft text-brand">
                <MessageSquareIcon className="size-3.5" />
              </span>
              <h2 className="text-sm font-medium text-foreground">Send feedback</h2>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Read by the person who builds {product}. Bugs, ideas and anything that felt off.</p>
            <fieldset className="mt-3 flex flex-wrap gap-2">
              <legend className="sr-only">Feedback type</legend>
              {feedbackTypes.map((t, i) => (
                <label key={t.value} className={chip + " cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/25"}>
                  <input type="radio" name="type" value={t.value} defaultChecked={i === 0} className="sr-only" />
                  {t.label}
                </label>
              ))}
            </fieldset>
            <label htmlFor="fb-message" className="sr-only">Your feedback</label>
            <textarea
              id="fb-message"
              name="message"
              required
              minLength={4}
              maxLength={4000}
              rows={3}
              placeholder="What happened, or what would make it better?"
              className={field + " mt-3 min-h-[5.5rem] resize-y py-2 leading-relaxed placeholder:text-muted-foreground"}
            />
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="fb-email" className="sr-only">Email (optional)</label>
              <input
                id="fb-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email, if you want a reply"
                className={field + " h-10 min-w-0 flex-1 placeholder:text-muted-foreground"}
              />
              <button type="submit" className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
                Send
                <SendIcon aria-hidden className="size-3.5" />
              </button>
            </div>
            <p data-feedback-status role="status" aria-live="polite" className="mt-3 min-h-4 text-xs text-muted-foreground empty:hidden" />
            <p className="mt-3 text-[0.6875rem] text-muted-foreground">Sends your message, email if given, and this page's address.</p>
          </form>
        </div>
      </div>

      <div className="container-page">
        <p
          aria-hidden
          className="font-display select-none overflow-hidden whitespace-nowrap text-[clamp(3rem,14vw,13rem)] leading-[0.86] text-foreground [letter-spacing:-0.05em]"
        >
          {product}
        </p>
      </div>
      {art && artMode === "panel" && (
        <div className="container-page mt-6">
          <img
            src={art.src}
            alt={art.alt}
            loading="lazy"
            decoding="async"
            className="block aspect-[5/2] w-full object-cover [mask-image:radial-gradient(ellipse_75%_85%_at_50%_55%,black_55%,transparent_100%)] sm:aspect-[3/1]"
          />
        </div>
      )}
      {art && artMode === "scene" && (
        <img
          src={art.src}
          alt={art.alt}
          loading="lazy"
          decoding="async"
          className="-mt-[6vw] block h-[clamp(12rem,32vw,28rem)] w-full object-cover [mask-image:linear-gradient(to_bottom,transparent,black_38%)]"
        />
      )}

      <div className="container-page flex flex-col gap-4 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>From the studio</span>
          {studio
            .filter((s) => s.label !== product)
            .map((s) => (
              <a key={s.href} href={s.href} className="text-foreground transition-colors hover:text-brand">
                {s.label}
              </a>
            ))}
          <a href="https://sassmaker.com" className="inline-flex items-center gap-0.5 text-foreground hover:text-brand">
            All projects <ArrowUpRightIcon aria-hidden className="size-3" />
          </a>
        </p>
        {legal && <p>{legal}</p>}
      </div>
    </footer>
  );
}
