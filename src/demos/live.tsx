import * as React from "react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/blocks/site-header";
import { Hero } from "@/components/blocks/hero";
import { Section, SectionHeader } from "@/components/blocks/layout";
import { Steps } from "@/components/blocks/features";
import { MediaCard } from "@/components/blocks/frames";
import { Band, Faq, Cta } from "@/components/blocks/closing";
import { StudioFooter } from "@/components/blocks/footer";

const img = (n: string) => `/demo/live/${n}`;

const categories = [
  { file: "outdoor-800.webp", label: "Outdoor", title: "Places to go and paths to walk" },
  { file: "culinary-800.webp", label: "Culinary", title: "Things to cook, taste and share" },
  { file: "creative-800.webp", label: "Creative", title: "Things to make with your hands" },
  { file: "music-800.webp", label: "Music", title: "Songs to learn and shows to see" },
  { file: "social-800.webp", label: "Social", title: "People to gather and evenings to host" },
  { file: "physical-800.webp", label: "Physical", title: "Challenges to train for" },
];

/** A life in weeks: 52 columns per year; lived weeks filled. */
function LifeInWeeks() {
  const years = 40;
  const lived = 31 * 52 + 22;
  return (
    <figure className="rounded-2xl bg-card p-5 shadow-lg ring-1 ring-black/5 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <figcaption className="font-display text-[1.5rem]">Your first 40 years, in weeks</figcaption>
        <span className="font-mono text-xs text-muted-foreground">Illustrative · 1 dot = 1 week</span>
      </div>
      <div aria-hidden className="mt-6 grid gap-[3px] [grid-template-columns:repeat(52,minmax(0,1fr))]">
        {Array.from({ length: years * 52 }, (_, i) => (
          <span
            key={i}
            className={
              i < lived
                ? "aspect-square rounded-full bg-foreground/80"
                : i === lived
                  ? "aspect-square rounded-full bg-brand ring-2 ring-brand/40"
                  : "aspect-square rounded-full bg-foreground/10"
            }
          />
        ))}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">
        The yellow dot is this week. <span className="text-foreground">The rest is still unwritten.</span>
      </p>
    </figure>
  );
}

export default function LivePage() {
  return (
    <>
      <SiteHeader
        variant="floating"
        className="absolute inset-x-0"
        brand={{ name: "Live", mark: <img src={img("icon.svg")} alt="" width={26} height={26} className="size-[26px]" /> }}
        links={[
          { label: "Catalog", href: "#catalog" },
          { label: "How it works", href: "#how" },
          { label: "Questions", href: "#faq" },
        ]}
        actions={
          <Button size="sm" variant="brand" className="rounded-full" asChild>
            <a href="#catalog">Explore the catalog</a>
          </Button>
        }
      />

      <main id="main">
        <Hero
          layout="cover"
          image={{ src: img("hobby-horizon-poster.jpg") }}
          eyebrow="Live by Significant Hobbies"
          title={
            <>
              Make your bucket list <em>happen.</em>
            </>
          }
          lede="Find things you want to do, from big bucket-list experiences to small side quests. Keep your own list, mark things done, and remember your week."
          actions={
            <Button size="xl" variant="brand" className="rounded-full" asChild>
              <a href="#catalog">
                Explore the catalog <ArrowRightIcon />
              </a>
            </Button>
          }
          note="Free to use. No account required to begin."
        />

        <Band tone={1}>
          <div id="catalog" className="container-page">
            <SectionHeader
              align="split"
              eyebrow="Need a nudge?"
              title={
                <>
                  What will you do <em>before you die?</em>
                </>
              }
              lede="Borrow an idea, reject the obvious, then make a list that could only belong to you. 419 ideas and counting."
            >
              <Button variant="outline" className="rounded-full bg-transparent" asChild>
                <a href="#">
                  Browse every idea <ArrowRightIcon />
                </a>
              </Button>
            </SectionHeader>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <MediaCard
                  key={c.file}
                  href="#"
                  label={c.label}
                  title={c.title}
                  image={{ src: img(c.file), alt: `${c.label} category illustration`, width: 800, height: 600 }}
                />
              ))}
            </div>
          </div>
        </Band>

        <Band tone={2}>
          <div id="how" className="container-page">
            <SectionHeader
              eyebrow="Discover · choose · remember"
              title={
                <>
                  Turn “someday” into a life <em>you can actually see.</em>
                </>
              }
            />
            <Steps
              className="mt-14 bg-foreground/10 [--background:var(--tone-2)]"
              items={[
                { title: "Find something to do", body: "Search the catalog for bucket-list ideas, places and small adventures.", detail: <span className="eyebrow">Search or browse</span> },
                { title: "Keep your own list", body: "Save what you want to try. Add your own, mark things done, or make a Bingo board.", detail: <span className="eyebrow">Your choices</span> },
                { title: "Remember your week", body: "Log a habit when you do it. Write one private journal entry about the week before.", detail: <span className="eyebrow">Private by default</span> },
              ]}
            />
          </div>
        </Band>

        <Band tone={3}>
          <div className="container-page grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeader
                eyebrow="Life in weeks"
                title={
                  <>
                    Time is the only thing <em>you can't save.</em>
                  </>
                }
                lede="The life-in-weeks view puts your time in perspective. No streaks, no scores: just the weeks you've lived and the ones still to come."
              />
            </div>
            <div className="lg:col-span-7">
              <LifeInWeeks />
            </div>
          </div>
        </Band>

        <Section id="faq">
          <div className="container-page">
            <Faq
              title={
                <>
                  Questions, <em>answered.</em>
                </>
              }
              lede="Start free without an account. Keep control of what is public."
              items={[
                { q: "What is Live?", a: "Live helps you find things to do and keep a bucket list of your own. Browse ideas and side quests, mark them done, check in on habits, and keep one private weekly journal entry." },
                { q: "Is Live free?", a: "Yes. Live is free to use and there is no paid plan or checkout. You can begin without an account." },
                { q: "Do I need an account?", a: "No. Signed-out work stays on this device. Sign in with Google when you want records across devices or choose to publish." },
                { q: "Is my work public?", a: "Not by default. Publication is opt-in per item. Private work stays private unless you explicitly choose otherwise." },
                { q: "How often do I write?", a: "Once a week, about the week before. Habit check-ins are separate: log them when you do them, without a streak or score." },
              ]}
            />
          </div>
        </Section>

        <Section size="compact">
          <div className="container-page">
            <div className="relative isolate overflow-hidden rounded-[2rem]">
              <img src={img("dawn-valley-1920.webp")} alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
              <div className="max-w-2xl px-6 py-16 text-white sm:px-12 md:py-24 [--muted-foreground:rgb(255_255_255/0.8)] [--accent-ink:var(--brand)]">
                <p className="eyebrow mb-5 text-white/80">Start with one real possibility</p>
                <h2 className="font-display text-[clamp(2.25rem,1.5rem+3vw,4rem)]">
                  You don't need a life plan. <em>You need one thing worth trying next.</em>
                </h2>
                <Button size="xl" variant="brand" className="mt-9 rounded-full" asChild>
                  <a href="#catalog">
                    Explore the catalog <ArrowRightIcon />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <StudioFooter
        product="Live"
        url="https://live.significanthobbies.com"
        summary="Find what deserves your time. A free bucket list, side quests, habits and one weekly journal entry, private by default."
        groups={[
          { title: "Explore", links: [{ label: "Catalog", href: "#catalog" }, { label: "Life in weeks", href: "#" }, { label: "Bingo", href: "#" }] },
          { title: "Resources", links: [{ label: "Changelog", href: "#" }, { label: "Roadmap", href: "#" }, { label: "Privacy", href: "#" }] },
          { title: "Studio", links: [{ label: "Significant Hobbies", href: "https://significanthobbies.com" }] },
        ]}
        art={{ src: img("live.webp"), alt: "Illustrated landscape of paths and adventures" }}
        feedbackHref="#"
        legal="© 2026 Significant Hobbies"
      />
    </>
  );
}
