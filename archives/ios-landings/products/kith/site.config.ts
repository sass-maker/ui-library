import type { SiteConfig } from "../../src/lib/types";

export const site: SiteConfig = {
  name: "Kith",
  url: "https://kith.significanthobbies.com",
  tagline: "Private notes for people you keep close.",
  headline: ["Remember the people", "you want to stay close to."],
  lede:
    "Kith gives each person a place for how you met, what matters now, and the dated moments you do not want to forget—without turning care into a CRM.",
  kicker: "A private relationship-memory app for iPhone",
  summary:
    "A device-first iPhone app where explicit closeness shapes a warm constellation, and each person has standing notes and a chronological memory log.",
  status: "Internal TestFlight only. No public invite or App Store listing.",
  platforms: ["iPhone"],
  themeColor: "#241812",
  mark: "/images/brand/mark.webp",
  socialImage: "/images/brand/social.png",
  tokens: {
    paper: "#34241c",
    field: "#241812",
    ink: "#fff2e2",
    inkSoft: "#c2b5a8",
    inkFaint: "rgba(255, 242, 226, 0.14)",
    accent: "#e89474",
    accentDark: "#d6745c",
    accentSoft: "#ecb080",
    lanternA: "#e89474",
    lanternB: "#ecb080",
    lanternC: "#e8c46e",
    blush: "#362923",
    inkOnDark: "#fff2e2",
    inkOnAccent: "#241812",
  },
  colorScheme: "dark",
  story: {
    ink: "#fff2e2",
    paper: { src: "/images/story/paper.webp", alt: "", width: 768, height: 512 },
    cover: { src: "/images/story/book-stage.webp", alt: "", width: 1024, height: 1536 },
    moment: {
      src: "/images/story/coastal-walk-v2.webp",
      alt: "Illustrative candid scene of two friends walking together along a coastal path",
      width: 760,
      height: 507,
      caption: "A little time together.",
    },
    scene: { src: "/images/story/memory-table-v2.webp", alt: "", width: 1536, height: 1024 },
    note: "A small thing worth remembering.",
  },
  hero: {
    image: "/images/screens/constellation.webp",
    alt: "Kith on iPhone showing a warm constellation of five people sized by chosen closeness",
    caption: "Closer people take more space because you set their closeness. Kith never infers it.",
    width: 603,
    height: 1311,
  },
  gallery: [
    {
      src: "/images/screens/constellation.webp",
      alt: "Kith constellation with search, list view, and people sized by explicit closeness",
      width: 603,
      height: 1311,
    },
    {
      src: "/images/screens/person.webp",
      alt: "Kith person page with how-you-met context, standing notes, birthday, and dated memories",
      width: 603,
      height: 1311,
    },
    {
      src: "/images/screens/onboarding.webp",
      alt: "Kith onboarding for adding one real person and choosing closeness without inference",
      width: 603,
      height: 1311,
    },
  ],
  applicationCategory: "LifestyleApplication",
  availability: "unreleased",
  newsletterCapture: true,
  betaNote:
    "Kith is in private beta for invited internal testers. Public TestFlight enrollment and an App Store listing are not available.",
  tension: {
    statement: "A name in a phone is not the context of a relationship.",
    title: "Keep what helps you show up well.",
    copy: "Kith holds how you met, a birthday, standing notes, and the dated calls, dinners, gifts, milestones, and small facts you would otherwise trust yourself to remember. It does not rank attention or turn people into work.",
  },
  chaptersKicker: "One thoughtful loop",
  chaptersTitle: "See them. Remember. Add the moment.",
  chaptersLede:
    "The constellation is orientation, not a score. Open one person, recover the useful context, write a short dated note, and leave.",
  chapters: [
    {
      name: "Constellation",
      title: "See closeness the way you chose it.",
      copy: "Every person becomes a warm lantern. Its size comes only from the 1–5 closeness value you set—not recency, message volume, circle, or an algorithm. Searchable list view remains available for speed and VoiceOver.",
      image: "/images/screens/constellation.webp",
      alt: "Kith home with warm lanterns sized by the user's explicit closeness values",
      width: 603,
      height: 1311,
    },
    {
      name: "Person",
      title: "Keep the context that makes care specific.",
      copy: "A person can hold their circle, birthday, how you met, standing notes, and a chronological log. Each dated entry stays a note, hangout, call, message, gift, milestone, or something to remember.",
      image: "/images/screens/person.webp",
      alt: "Kith person page with standing context and a chronological dated log",
      width: 603,
      height: 1311,
    },
    {
      name: "Begin",
      title: "Start with one real person, not an import.",
      copy: "Start with a name, choose their circle and closeness, and add one thing worth remembering. That first moment stays with the person, ready for you to return to.",
      image: "/images/screens/onboarding.webp",
      alt: "Kith first-run flow asking for one real person and a chosen closeness",
      width: 603,
      height: 1311,
    },
  ],
  fit: {
    kicker: "An honest fit",
    title: "For tending a few relationships. Not managing a database.",
    yes: "Kith may fit if you want to retain the small facts and dated moments that help you be more thoughtful with family, close friends, and other people who matter.",
    no: "It is not a contact book, social network, sales pipeline, messaging app, attention score, or reminder-notification product. You may select individual people with Apple’s contact picker; Kith does not browse the address book or infer who deserves care.",
  },
  privacy: {
    kicker: "Useful before sign-in",
    title: "The iPhone remains the working copy.",
    copy: "Your edits are saved on your iPhone first, so you can keep using Kith offline. A private iCloud mirror remains during the sync transition. An optional Significant Hobbies account with Apple or Google also syncs your people and dated notes through the private Hub; local use never requires sign-in. This website separately uses App Health for visits and named actions, and offers email updates only after explicit consent.",
  },
  faqs: [
    {
      question: "Do I need an account?",
      answer:
        "No. Adding people, setting closeness, searching, opening a person, and writing dated notes work from the local iPhone document. A Significant Hobbies account is optional and adds private Hub synchronization.",
    },
    {
      question: "What is stored where?",
      answer:
        "The iPhone holds the immediate full document. A private CloudKit mirror remains enabled during the sync transition. If you connect the optional account, Kith synchronizes structured person fields and dated interaction records through the private Significant Hobbies Hub, while preserving the local working copy and durable waiting changes.",
    },
    {
      question: "Does Kith decide who I am closest to?",
      answer:
        "No. Closeness is an explicit value from 1 to 5 that you set. Bubble size reflects that value only; Kith does not infer it from note recency, log volume, messages, or circle.",
    },
    {
      question: "Will it import my contacts or remind me to message people?",
      answer:
        "You can add people by hand or choose individual contacts with Apple’s system picker. Only your selections are shared with Kith. Messaging, photos, and notification reminders are not included.",
    },
    {
      question: "Can I download or pay for Kith?",
      answer:
        "Not publicly. Kith is in internal TestFlight with no public invitation, App Store listing, paid plan, subscription, or checkout. No permanent free or paid model has been announced.",
    },
  ],
  founder: {
    quote: "I wanted a beautiful personal relationship-memory app that helps me stay more thoughtful about the people in my life.",
    credit: "— Sarthak Agrawal, creator of Kith",
    note: "Real use decides what I add next. Closeness stays explicit, and the private context has to stay useful.",
  },
  closingTitle: ["Remember what mattered.", "Show up with the context."],
  footerFinePrint:
    "Private, device-first iPhone relationship-memory app. Internal TestFlight only; no public invite, App Store listing, paid plan, subscription, or checkout. © 2026 Sarthak Agrawal.",
  capabilities: [
    "Warm constellation sized only by explicit 1–5 closeness",
    "Searchable list and a person page with standing context",
    "Chronological dated notes across seven concrete memory kinds",
    "Offline local document, transition CloudKit mirror, and optional private Hub sync",
  ],
  boundaries: [
    "No background address-book access, messaging, photos, or reminder notifications",
    "No inferred closeness, attention score, social graph, or public profile",
    "Optional account sync never replaces or blocks the local working copy",
    "No public TestFlight invitation or App Store release",
    "Current source targets iPhone and does not claim an iPad or web client",
  ],
  agentFit: {
    bestFit: [
      "Explaining Kith as a private native iPhone memory app for people, chosen closeness, standing context, and dated moments",
      "Understanding its local JSON working copy, transition CloudKit mirror, optional Significant Hobbies Hub sync, and offline behavior",
      "Checking current internal TestFlight access or the boundary between intentional relationship memory and CRM-style automation",
    ],
    notAFit: [
      "Claiming Kith browses the full address book, infers closeness, scores relationship health, sends reminders, messages people, or creates a social graph",
      "Claiming a public TestFlight, App Store release, web client, iPad app, payment plan, subscription, or permanent free access",
      "Treating the optional Significant Hobbies account as mandatory or describing Hub synchronization as the only copy of the user's data",
    ],
  },
  lastUpdated: "2026-10-16",
  legal: {
    privacy: {
      title: "The people and notes stay private.",
      lede: "How Kith separates the immediate iPhone document, transition CloudKit mirror, and optional Significant Hobbies Hub copy.",
      sections: [
        {
          title: "The local working copy",
          body: "Kith stores the people you add, explicit closeness, circle, birthday, how-you-met context, standing notes, colours, and dated log entries in one local JSON document. The app reads and writes that document first and remains useful offline.",
        },
        {
          title: "CloudKit during transition",
          body: "Signed builds may mirror the full Kith document through the private CloudKit container associated with the user's iCloud account. This mirror remains available as migration rollback while the shared Hub path is validated.",
        },
        {
          title: "Optional private Hub synchronization",
          body: "If you connect a Significant Hobbies account with Apple or Google, Kith synchronizes structured person fields and dated interaction records through the private Cloudflare Hub. Authentication and a successful sync are shown separately; offline or service failures leave local edits usable and retain waiting changes for retry.",
        },
        {
          title: "No advertising profile",
          body: "The native app uses no advertising, IDFA, third-party analytics SDK, background address-book access, or cross-app tracking. If you use Apple’s contact picker, only the people you select are imported. Their names, birthdays, selected phone/email, organization and location details become local Kith content; approved content may also be copied to your signed-in Hub account. Apple, Google, Cloudflare, TestFlight, and the static marketing site may process service-level data under their own policies.",
        },
        {
          title: "Kith website analytics",
          body: "The marketing site uses App Health to count page visits and named actions such as opening the product guide or TestFlight status. It records a newsletter signup click only after a valid email and the separate explicit newsletter consent checkbox are present. Its browser tracker stores a random site-scoped identifier in local storage (not a cookie) and sends page paths without query strings or fragments, plus referrer hostnames. App Health does not receive Kith content, camera or contact data, email addresses, form values, or subscription records.",
        },
        {
          title: "Email updates",
          body: "If you opt in through the footer form, SaaS Maker receives your email address, newsletter type, footer source, and explicit consent record to manage Kith updates. The required checkbox starts unchecked; you can unsubscribe at any time.",
        },
        {
          title: "Deletion and care",
          body: "Removing a person also removes that person's notes from the local document. Because Kith is beta software with more than one private copy during transition, keep independent notes for information you cannot afford to lose and avoid including other people's private details in support screenshots.",
        },
        { title: "Effective date", body: "Last updated 28 September 2026." },
      ],
    },
    support: {
      title: "Support, without exposing someone else's story.",
      lede: "Kith is a private iPhone app for remembering the people you care about. Ask general questions in public; send private beta details through TestFlight.",
      sections: [
        {
          title: "Public questions and issues",
          body: "For a general question or a reproducible problem that contains no personal data, open a public GitHub issue. Replace names and note text with neutral examples; never post screenshots that expose another person's story.",
          links: [{ label: "Ask a public question on GitHub", href: "https://github.com/Significant-Hobbies/kith/issues/new" }],
        },
        {
          title: "Private beta feedback",
          body: "If you are an invited internal tester, use TestFlight's Send Beta Feedback action. Name the screen, action, current build, whether you were offline, and whether the Connection screen showed signed in, syncing, waiting changes, a last success, or an error. Replace names and note text with neutral examples.",
        },
        {
          title: "Protect the local copy",
          body: "Do not remove a person, delete the app, or clear device data as a first troubleshooting step. A failed CloudKit or Hub sync should not stop local use; record the visible recovery guidance and try Sync now after connectivity returns.",
        },
        {
          title: "Current availability and privacy",
          body: "Kith is available only to internal TestFlight testers. There is no public invitation, App Store listing, paid support plan, or guaranteed response time. Read the current access status and privacy policy before sharing feedback.",
          links: [
            { label: "Current access status", href: "/testflight/" },
            { label: "Privacy policy", href: "/privacy/" },
          ],
        },
      ],
    },
    terms: {
      title: "Simple beta terms.",
      lede: "Personal evaluation of a private, device-first relationship-memory app.",
      sections: [
        {
          title: "Your content and judgment",
          body: "The people and notes you add remain your responsibility. Kith helps you remember context; it does not verify a memory, judge a relationship, decide who deserves attention, or act on your behalf.",
        },
        {
          title: "Beta software",
          body: "The app is an internal TestFlight beta and may change, stop working, or lose beta access. Keep information you cannot afford to lose somewhere you independently control.",
        },
        {
          title: "Personal use",
          body: "You may use the beta for personal evaluation through Apple TestFlight. Do not redistribute the app or use it as a professional CRM, safety system, or source of automated relationship decisions.",
        },
        { title: "Changes", body: "Last updated 19 September 2026." },
      ],
    },
    accessibility: {
      title: "Closeness is never colour alone.",
      lede: "The constellation has a searchable alternative and the important relationship fields remain named in text.",
      sections: [
        {
          title: "Current support",
          body: "Lanterns expose spoken names, circle, and closeness; the searchable list provides a direct alternative to the spatial field. Closeness is represented by a numeric value and size as well as colour. Native controls, Dynamic Type, and semantic labels support the principal flows.",
        },
        {
          title: "Motion",
          body: "Reduce Motion freezes the constellation rather than removing its people or hierarchy. The app remains usable through the static field and searchable list.",
        },
        {
          title: "Report a barrier",
          body: "Use TestFlight feedback and begin the message with Accessibility. Include the screen, text size or assistive technology, and intended action, while omitting real names and private notes from screenshots.",
        },
      ],
    },
    testflight: {
      title: "Internal TestFlight is active.",
      lede: "Kith is available to invited internal testers. There is no public TestFlight enrollment link or App Store listing.",
      testing:
        "Add one real person, choose circle and closeness, write a dated memory, relaunch, search in list view, inspect the Connection state, and verify that a failed network path does not prevent local use.",
      notIncluded:
        "A public invitation, App Store listing, iPad or web client, messaging, photos, reminder notifications, inferred closeness, paid plan, or checkout is not available.",
      sections: [],
    },
  },
  requiredHomeCopy: [
    "closeness",
    "private",
    "Internal TestFlight",
    "No public invite",
    "Significant Hobbies account",
    "local JSON document",
  ],
  prohibitedClaims: [
    "No Kith account",
    "invite-only TestFlight beta preparation",
    "available on the app store",
    "public TestFlight",
    "Kith web app",
    "Kith for iPad",
    "automatically scores relationships",
  ],
};

export const links = {
  home: `${site.url}/`,
  privacy: `${site.url}/privacy/`,
  support: `${site.url}/support/`,
  terms: `${site.url}/terms/`,
  accessibility: `${site.url}/accessibility/`,
  testflight: `${site.url}/testflight/`,
};
