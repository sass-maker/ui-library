import * as React from "react";
import { ArrowRightIcon, ArrowDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/blocks/site-header";
import { Hero } from "@/components/blocks/hero";
import { Section, SectionHeader } from "@/components/blocks/layout";
import { FeatureSpread, FitCompare } from "@/components/blocks/features";
import { Ledger, Quote } from "@/components/blocks/proof";
import { PhoneFrame, Photo, Artwork } from "@/components/blocks/frames";
import { Faq, Cta } from "@/components/blocks/closing";
import { StudioFooter } from "@/components/blocks/footer";

const img = (name: string) => `/demo/kith/${name}`;

function HeroStage() {
  return (
    <div className="relative mx-auto grid max-w-xl place-items-center py-6 sm:py-10">
      <div
        aria-hidden
        className="absolute inset-x-6 inset-y-0 -z-10 overflow-hidden rounded-[2rem] shadow-xl sm:inset-x-10"
      >
        <img src={img("book-stage.webp")} alt="" className="size-full object-cover" />
      </div>
      <PhoneFrame
        className="w-[15rem] sm:w-[17rem]"
        image={{ src: img("constellation.webp"), alt: "Kith on iPhone showing a warm constellation of five people sized by chosen closeness", width: 603, height: 1311, priority: true }}
      />
      <Photo
        tilt="left"
        className="absolute bottom-6 left-0 w-32 sm:-left-4 sm:bottom-12 sm:w-44"
        image={{ src: img("coastal-walk-v2.webp"), alt: "Illustrative scene of two friends walking along a coastal path", width: 760, height: 507 }}
        caption={<span className="font-display text-[0.8125rem] italic">A little time together.</span>}
      />
      <span className="absolute right-0 top-8 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-md sm:right-2">
        The actual app
      </span>
    </div>
  );
}

export default function KithPage() {
  return (
    <>
      <SiteHeader
        brand={{ name: "Kith", mark: <img src={img("mark.webp")} alt="" width={28} height={28} className="size-7 rounded-lg" /> }}
        links={[
          { label: "How it works", href: "#how" },
          { label: "Privacy", href: "#privacy" },
          { label: "Questions", href: "#faq" },
        ]}
        actions={
          <Button size="sm" variant="outline" className="rounded-full" asChild>
            <a href="#beta">Beta status</a>
          </Button>
        }
      />

      <main id="main">
        <Hero
          backdrop="paper"
          eyebrow="A private relationship-memory app for iPhone"
          title={
            <>
              Remember the people you want to <em>stay close to.</em>
            </>
          }
          lede="Kith gives each person a place for how you met, what matters now, and the dated moments you do not want to forget, without turning care into a CRM."
          actions={
            <>
              <Button size="xl" variant="brand" className="rounded-full" asChild>
                <a href="#beta">
                  See TestFlight status <ArrowRightIcon />
                </a>
              </Button>
              <Button size="xl" variant="ghost" className="rounded-full" asChild>
                <a href="#how">
                  See the real app <ArrowDownIcon />
                </a>
              </Button>
            </>
          }
          note="Internal TestFlight only. No public invite or App Store listing."
          media={<HeroStage />}
        />

        <section className="container-page">
          <Artwork
            className="aspect-[4/5] sm:aspect-[16/8]"
            image={{ src: img("memory-table-v2.webp"), alt: "Illustrative still life of a notebook, photographs and a coffee cup on a table", width: 1536, height: 1024 }}
            overlay={
              <div className="max-w-md rounded-2xl bg-background/88 p-6 shadow-lg backdrop-blur-md sm:p-8">
                <p className="font-display text-[clamp(1.75rem,1.3rem+1.8vw,2.5rem)]">
                  See them. Remember. <em>Add the moment.</em>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  The constellation is orientation, not a score. Open one person, recover the useful context, write a short dated note, and leave.
                </p>
                <p className="mt-4 font-mono text-[0.6875rem] text-muted-foreground">Illustrative artwork · real product screens below</p>
              </div>
            }
          />
        </section>

        <Section id="how">
          <div className="container-page">
            <SectionHeader
              align="split"
              eyebrow="A name in a phone is not the context of a relationship"
              title={
                <>
                  Keep what helps you <em>show up well.</em>
                </>
              }
              lede="Kith holds how you met, a birthday, standing notes, and the dated calls, dinners, gifts and small facts you would otherwise trust yourself to remember. It does not rank attention or turn people into work."
            />
            <FeatureSpread
              className="mt-20"
              items={[
                {
                  kicker: "Constellation",
                  title: <>See closeness the way <em>you chose it.</em></>,
                  body: "Every person becomes a warm lantern. Its size comes only from the 1–5 closeness you set: not recency, message volume, or an algorithm. A searchable list view stays available for speed and VoiceOver.",
                  media: <ScreenStage src="constellation.webp" alt="Kith home with warm lanterns sized by the user's explicit closeness values" tone="bg-tone-1" />,
                },
                {
                  kicker: "Person",
                  title: <>Keep the context that makes <em>care specific.</em></>,
                  body: "A person holds their circle, birthday, how you met, standing notes, and a chronological log. Each entry stays a note, hangout, call, message, gift, milestone, or something to remember.",
                  media: <ScreenStage src="person.webp" alt="Kith person page with standing context and a chronological dated log" tone="bg-tone-3" />,
                },
                {
                  kicker: "Begin",
                  title: <>Start with one real person, <em>not an import.</em></>,
                  body: "Start with a name, choose their circle and closeness, and add one thing worth remembering. That first moment stays with the person, ready when you come back.",
                  media: <ScreenStage src="onboarding.webp" alt="Kith first-run flow asking for one real person and a chosen closeness" tone="bg-tone-4" />,
                },
              ]}
            />
          </div>
        </Section>

        <Section surface="muted">
          <div className="container-page">
            <SectionHeader
              eyebrow="An honest fit"
              title={
                <>
                  For tending a few relationships. <em>Not managing a database.</em>
                </>
              }
            />
            <FitCompare
              className="mt-12"
              fit="Kith may fit if you want to keep the small facts and dated moments that help you be more thoughtful with family, close friends, and the other people who matter."
              notFit="It is not a contact book, social network, sales pipeline, messaging app, attention score, or reminder service. You can pick individual people with Apple's contact picker; Kith never browses your address book or decides who deserves care."
            />
          </div>
        </Section>

        <Section id="privacy">
          <div className="container-page grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeader
                eyebrow="Useful before sign-in"
                title={
                  <>
                    The iPhone stays <em>the working copy.</em>
                  </>
                }
                lede="Edits save on your iPhone first, so Kith works offline. An optional Significant Hobbies account syncs people and dated notes through the private Hub; local use never needs it."
              />
              <Button variant="link" className="mt-6 px-0" asChild>
                <a href="#">
                  Read the plain-language privacy policy <ArrowRightIcon />
                </a>
              </Button>
            </div>
            <Ledger
              className="lg:col-span-7"
              title="Where your people live"
              rows={[
                { label: "iPhone", value: "The full document. Adding people, closeness, search and notes all work here.", status: { tone: "success", label: "always" } },
                { label: "iCloud", value: "A private CloudKit mirror stays on during the sync transition.", status: { tone: "neutral", label: "private" } },
                { label: "Hub", value: "Structured person fields and dated notes, only if you connect an account.", status: { tone: "brand", label: "optional" } },
                { label: "This site", value: "Counts visits and named actions. Email updates only after you opt in.", status: { tone: "neutral", label: "separate" } },
              ]}
            />
          </div>
        </Section>

        <Section surface="muted">
          <div className="container-page">
            <Quote
              quote="I wanted a beautiful personal relationship-memory app that helps me stay more thoughtful about the people in my life."
              name="Sarthak Agrawal"
              role="Creator of Kith"
              avatar={img("mark.webp")}
            />
          </div>
        </Section>

        <Section id="faq">
          <div className="container-page">
            <Faq
              title={<>A few <em>honest answers.</em></>}
              items={[
                { q: "Do I need an account?", a: "No. Adding people, setting closeness, searching, opening a person and writing dated notes all work from the iPhone. An account is optional and adds private Hub sync." },
                { q: "Does Kith decide who I am closest to?", a: "No. Closeness is a value from 1 to 5 that you set. Bubble size reflects only that; Kith never infers it from recency, log volume, messages or circle." },
                { q: "Will it import my contacts or remind me to message people?", a: "You add people by hand or pick individual contacts with Apple's picker. Only your selections reach Kith. Messaging, photos and reminder notifications are not included." },
                { q: "Can I download or pay for Kith?", a: "Not publicly. Kith is in internal TestFlight with no public invite, App Store listing, paid plan or checkout." },
              ]}
            />
          </div>
        </Section>

        <Section id="beta" size="compact">
          <div className="container-page">
            <Cta
              eyebrow="Kith · iPhone"
              title={
                <>
                  Remember what mattered. <em>Show up with the context.</em>
                </>
              }
              actions={
                <Button size="xl" variant="brand" className="rounded-full" asChild>
                  <a href="#">
                    See TestFlight status <ArrowRightIcon />
                  </a>
                </Button>
              }
              note="Internal TestFlight only. No public invite or App Store listing."
              media={
                <div className="hidden justify-center lg:flex">
                  <PhoneFrame className="w-56 rotate-3" image={{ src: img("person.webp"), alt: "", width: 603, height: 1311 }} />
                </div>
              }
            />
          </div>
        </Section>
      </main>

      <StudioFooter
        product="Kith"
        url="https://kith.significanthobbies.com"
        summary="A private, device-first iPhone app for remembering the people you keep close. Internal TestFlight only; no public invite, App Store listing or checkout."
        groups={[
          { title: "Explore", links: [{ label: "Overview", href: "#" }, { label: "TestFlight", href: "#beta" }, { label: "Journal", href: "#" }] },
          { title: "Resources", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#" }, { label: "Accessibility", href: "#" }] },
          { title: "Connect", links: [{ label: "Support", href: "#" }, { label: "Source code", href: "#" }] },
        ]}
        art={{ src: img("memory-table-v2.webp"), alt: "Illustrative still life of a notebook and photographs on a table" }}
        feedbackHref="#"
        legal="© 2026 Sarthak Agrawal"
      />
    </>
  );
}

/** A real screen on a soft tinted stage. */
function ScreenStage({ src, alt, tone }: { src: string; alt: string; tone: string }) {
  return (
    <div className={`grid place-items-center rounded-[2rem] px-6 py-10 sm:py-14 ${tone}`}>
      <PhoneFrame className="w-[14rem] sm:w-[16rem]" image={{ src: img(src), alt, width: 603, height: 1311 }} />
    </div>
  );
}
