import * as React from "react";
import { SiteHeader } from "@/components/blocks/site-header";
import {
  GalleryButton,
  GalleryCaption,
  GalleryClosing,
  GalleryCover,
  GalleryHero,
  GalleryShowcase,
  GallerySpread,
  GalleryStatement,
} from "@/components/blocks/gallery";
import { StudioFooter } from "@/components/blocks/footer";

const img = (name: string) => `/demo/kith/${name}`;
const screen = { width: 603, height: 1311 };
const mark = <img src={img("mark.webp")} alt="" width={26} height={26} className="size-[1.625rem] rounded-[0.45rem]" />;
const status = "Internal TestFlight only. No public invite or App Store listing.";

export default function KithPage() {
  return (
    <>
      <SiteHeader
        brand={{ name: "Kith", mark }}
        links={[
          { label: "How it works", href: "#how" },
          { label: "Privacy", href: "#privacy" },
          { label: "Questions", href: "#beta" },
        ]}
        actions={
          <a href="#beta" className="rounded-full bg-primary px-3.5 py-[0.45rem] text-[0.8125rem] font-semibold text-primary-foreground">
            Beta status
          </a>
        }
      />

      <main id="main">
        <GalleryHero
          eyebrow="Kith for iPhone"
          title={<>Remember the people you want to stay&nbsp;close&nbsp;to.</>}
          lede="A place for how you met, what matters now, and the dated moments you do not want to forget, without turning care into a CRM."
          actions={
            <>
              <GalleryButton href="#beta">See TestFlight status</GalleryButton>
              <GalleryButton href="#how" variant="link">
                See the real app ›
              </GalleryButton>
            </>
          }
          note={status}
          backdrop={img("book-stage.webp")}
          device={{ src: img("constellation.webp"), alt: "Kith on iPhone showing a warm constellation of people sized by chosen closeness", ...screen }}
        />

        <GalleryShowcase
          id="how"
          eyebrow="Constellation"
          title={
            <>
              See closeness the way <em>you chose it.</em>
            </>
          }
          lede="Every person becomes a warm lantern. Its size comes only from the 1–5 closeness you set: not recency, message volume, or an algorithm."
          device={{ src: img("constellation.webp"), alt: "Kith home screen enlarged: lanterns for Amma, Arjun, Priya, Maya, Dev and Nora, each sized by chosen closeness", ...screen }}
          caption={<GalleryCaption lead="The real home screen, at the size of a room.">A searchable list view stays one tap away, for speed and VoiceOver.</GalleryCaption>}
          note="Kith · iPhone · actual screen"
        />

        <GallerySpread
          eyebrow="Person"
          title={<>Keep the context that makes care&nbsp;specific.</>}
          lede="A person holds their circle, birthday, how you met, standing notes, and a chronological log of notes, hangouts, calls, gifts and things to remember."
          backdrop={img("book-stage.webp")}
          device={{ src: img("person.webp"), alt: "Kith person page for Maya Rao with how you met, keep in mind, birthday and a dated log", ...screen }}
          caption={<GalleryCaption lead="Maya Rao, closeness 5.">“Hates being late. Always orders the extra chai.” The small facts, kept where you will find them.</GalleryCaption>}
        />

        <GalleryCover
          eyebrow="Begin"
          title={<>Start with one real person, not an&nbsp;import.</>}
          lede="A name, their circle and closeness, and one thing worth remembering. That first moment stays with them, ready when you come back."
          image={img("coastal-walk-v2.webp")}
          device={{ src: img("onboarding.webp"), alt: "Kith first-run flow asking for one real person and a chosen closeness", ...screen }}
        />

        <GalleryStatement
          id="privacy"
          className="pt-[clamp(2.5rem,6vw,5rem)]"
          eyebrow="Useful before sign-in"
          title={
            <>
              The iPhone stays <em>the working copy.</em>
            </>
          }
          lede="Edits save on your iPhone first, so Kith works offline. An optional Significant Hobbies account syncs through the private Hub; local use never needs it."
          rows={[
            { title: "iPhone", body: "The full document. Adding people, closeness, search and notes all work here.", status: "Always", on: true },
            { title: "iCloud", body: "A private CloudKit mirror stays on during the sync transition.", status: "Private" },
            { title: "Hub", body: "Structured person fields and dated notes, only if you connect an account.", status: "Optional", on: true },
            { title: "This site", body: "Counts visits and named actions. Email updates only after you opt in.", status: "Separate" },
          ]}
          aside={[
            { title: "Kith may fit if", body: "you want to keep the small facts and dated moments that help you be more thoughtful with family, close friends, and the other people who matter." },
            { title: "It is not", body: "a contact book, social network, sales pipeline, messaging app, attention score, or reminder service. Kith never browses your address book or decides who deserves care." },
          ]}
        />

        <GalleryClosing
          id="beta"
          title={
            <>
              Remember what mattered.
              <br />
              <span className="text-brand">Show up with the context.</span>
            </>
          }
          actions={<GalleryButton href="#">See TestFlight status</GalleryButton>}
          note={status}
          image={img("memory-table-v2.webp")}
          credit="Illustrative artwork"
        />
      </main>

      <StudioFooter
        variant="gallery"
        product="Kith"
        mark={mark}
        url="https://kith.significanthobbies.com"
        summary="A private, device-first iPhone app for remembering the people you keep close. Internal TestFlight only."
        groups={[
          { title: "Explore", links: [{ label: "Overview", href: "#" }, { label: "TestFlight", href: "#beta" }, { label: "Journal", href: "#" }] },
          { title: "Resources", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#" }, { label: "Accessibility", href: "#" }] },
          { title: "Connect", links: [{ label: "Support", href: "#" }, { label: "Source code", href: "#" }] },
        ]}
        legal="© 2026 Sarthak Agrawal"
      />
    </>
  );
}
