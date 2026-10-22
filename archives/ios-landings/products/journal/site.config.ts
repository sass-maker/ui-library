import type { SiteConfig } from "../../src/lib/types";

export const site: SiteConfig = {
  name: "Journal",
  url: "https://journal.significanthobbies.com",
  tagline: "Private daily writing that remains yours.",
  headline: ["Write the day", "while it is still yours."],
  lede: "Begin with a morning question, return for evening reflection, and write the rest in your own words. Every private page stays dated and easy to find again.",
  kicker: "A device-first Journal for iPhone",
  summary:
    "A private native iPhone journal for morning and evening reflection, free writing, date navigation, and an offline personal archive.",
  status: "Internal TestFlight only. No public invite or App Store listing.",
  platforms: ["iPhone"],
  themeColor: "#8d70ad",
  mark: "/images/brand/mark.webp",
  socialImage: "/images/brand/mark.png",
  tokens: {
    paper: "#faf8f1",
    field: "#e8def0",
    ink: "#2e2732",
    inkSoft: "#655b6d",
    inkFaint: "rgba(46, 39, 50, 0.14)",
    accent: "#8d70ad",
    accentDark: "#684c85",
    accentSoft: "#c9b5dc",
    lanternA: "#9c7dbc",
    lanternB: "#e3b95d",
    lanternC: "#cf8aa5",
    blush: "#f0e7f3",
    inkOnDark: "#faf8f1",
    inkOnAccent: "#ffffff",
  },
  colorScheme: "light",
  hero: {
    image: "/images/screens/today.webp",
    alt: "Journal on iPhone showing today's private morning reflection and writing fields",
    caption: "Today opens first. Your morning, evening, and free writing share one dated page.",
  },
  gallery: [
    { src: "/images/screens/today.webp", alt: "Journal Today screen on iPhone" },
    { src: "/images/screens/writing.webp", alt: "Journal private first-entry onboarding on iPhone" },
    { src: "/images/screens/archive.webp", alt: "Journal account, sync, and archive controls on iPhone" },
  ],
  applicationCategory: "LifestyleApplication",
  availability: "unreleased",
  betaNote:
    "Version 1.0.0 build 5 completed App Store Connect processing and entered internal beta testing. Current source is build 6; there is no public enrollment link.",
  tension: {
    statement: "A day is easy to rewrite after it has passed.",
    title: "Keep the version you actually lived.",
    copy: "Journal gives each date one private place for the thought you woke with, the day as it unfolded, and what felt true by evening. It does not turn reflection into content or consistency into a score.",
  },
  chaptersKicker: "One daily practice",
  chaptersTitle: "Arrive. Write. Return.",
  chaptersLede:
    "The current date stays simple. Earlier writing remains available without becoming a feed, streak, or performance dashboard.",
  chapters: [
    {
      name: "Today",
      title: "Meet the morning. Close the day gently.",
      copy: "Switch between a morning invitation and an evening reflection, then keep the fuller account in the private journal field. Both rituals belong to the same date.",
      image: "/images/screens/today.webp",
      alt: "Journal Today screen with morning and evening controls",
    },
    {
      name: "Begin",
      title: "Start with writing, not a tutorial.",
      copy: "Pick a writing invitation or open a blank page. Your first save goes straight into the same local archive you use every day.",
      image: "/images/screens/writing.webp",
      alt: "Journal onboarding invitation for a first private entry",
    },
    {
      name: "Keep",
      title: "Own the archive and its recovery path.",
      copy: "Browse earlier dates, export the complete compatible archive, preview a replacement before import, and clear local or synced Journal writing through explicit controls.",
      image: "/images/screens/archive.webp",
      alt: "Journal settings for private sync, export, import, and deletion",
    },
  ],
  fit: {
    kicker: "An honest fit",
    title: "A journal. Not an audience.",
    yes: "Journal may fit if you want a quiet iPhone practice for morning and evening reflection, free writing, and returning to earlier days.",
    no: "It is not a social feed, publishing platform, mood diagnosis, therapy service, streak challenge, or AI interpretation of your private writing.",
  },
  privacy: {
    kicker: "Useful before sign-in",
    title: "The local archive comes first.",
    copy: "Journal reads and writes a protected file on the iPhone and works offline without an account. If you choose a Significant Hobbies account with Apple or Google, Journal synchronizes private entries through the Cloudflare Personal Platform. Sync does not replace the local archive or make an entry publishable.",
  },
  faqs: [
    {
      question: "Do I need an account?",
      answer:
        "No. Writing, saving, date navigation, archive browsing, export, and import work from the local iPhone archive. An account is optional and exists only for private cross-device sync.",
    },
    {
      question: "Can an entry become public?",
      answer:
        "No. Journal entries have no visibility field, public profile, sharing flow, or publication control. Account sync keeps private app data; it does not publish the writing.",
    },
    {
      question: "What moves when I connect my Significant Hobbies account?",
      answer:
        "Journal sends dated entry records, including morning reflection, evening reflection, free writing, and the optional new-thing field retained by the compatible archive. Name, email, and user ID support the private account. Other preserved atlas data is not exposed for editing in Journal.",
    },
    {
      question: "Does Journal detect emotions or interpret my writing?",
      answer:
        "Not today. Careful emotional-pattern reflection is a possible future direction, not a shipped feature. The current app does not score mood, diagnose mental health, or send writing to an AI model for interpretation.",
    },
    {
      question: "Can I download it or pay for it?",
      answer:
        "Not publicly. Journal is in internal TestFlight with no public invitation, App Store listing, paid plan, subscription, or checkout. No permanent free or paid model has been announced.",
    },
  ],
  founder: {
    quote: "I wanted a journal that could become a durable habit and fit naturally inside the Hub.",
    credit: "— Sarthak Agrawal, creator of Journal",
    note: "I add features after they prove useful in real writing. The words stay private.",
  },
  closingTitle: ["Write the honest page.", "Keep the archive yours."],
  footerFinePrint:
    "Private, device-first iPhone journal. Internal TestFlight only; no public invite, App Store listing, paid plan, subscription, or checkout. Emotional-pattern detection is not shipped. © 2026 Sarthak Agrawal.",
  capabilities: [
    "Morning and evening reflection on one dated page",
    "Free writing, prior-entry context, and archive browsing",
    "Protected local storage with explicit export and preview-before-import",
    "Optional Apple- or Google-backed Significant Hobbies account sync",
  ],
  boundaries: [
    "Entries have no public visibility or publishing route",
    "No streak, point, mood score, diagnosis, therapy, or AI interpretation",
    "Account sync is optional and does not replace the local archive",
    "No public TestFlight invitation or App Store release",
    "Current source targets iPhone; an iPad release is not claimed",
  ],
  agentFit: {
    bestFit: [
      "Explaining Journal as a private native iPhone practice for morning reflection, evening reflection, free writing, and returning to earlier entries",
      "Understanding its offline local archive, optional Significant Hobbies account sync, export, import preview, and deletion controls",
      "Checking current internal TestFlight access, privacy boundaries, or the difference between current writing features and future emotional-pattern ideas",
    ],
    notAFit: [
      "Claiming Journal publishes, shares, scores, diagnoses, or currently interprets entries with AI",
      "Claiming iPad, App Store, public TestFlight, payment, subscription, or permanent free access",
      "Treating the marketing website as a browser-based Journal editor or account portal",
    ],
  },
  lastUpdated: "2026-08-28",
  legal: {
    privacy: {
      title: "Your writing is not a public surface.",
      lede: "How Journal separates the protected iPhone archive, optional account sync, export, and deletion.",
      sections: [
        {
          title: "The local archive",
          body: "Journal stores its compatible versioned atlas document in the app's Application Support directory with iOS file protection. Morning reflection, evening reflection, free writing, dates, and preserved legacy atlas records remain useful offline without an account.",
        },
        {
          title: "Optional private account sync",
          body: "If you connect a Significant Hobbies account with Apple or Google, Journal synchronizes private dated entry records through the Cloudflare Personal Platform. Account mode uses name, email address, user ID, and private user content for app functionality. Entries remain non-public by construction.",
        },
        {
          title: "Export, import, and deletion",
          body: "Export creates a JSON copy you choose to share or store. Import shows a whole-archive preview before replacement. You can clear Journal writing locally, clear synchronized Journal writing, or delete the Journal cloud copy while retaining the local archive and shared account, depending on the action you select.",
        },
        {
          title: "No ad or analytics profile",
          body: "The native app uses no advertising, IDFA, third-party ad tracking, or product analytics SDK. Apple, Google, Cloudflare, and the static marketing site process service-level data under their own policies; none turns a Journal entry into public content.",
        },
        {
          title: "Effective date",
          body: "Last updated 28 August 2026. Material privacy changes will be reflected here before any public App Store release.",
        },
      ],
    },
    support: {
      title: "Support, without sending your journal.",
      lede: "Describe the behavior and protect the words that caused it.",
      sections: [
        {
          title: "Send useful context",
          body: "Use TestFlight's Send Beta Feedback action. Name the screen, date, morning or evening mode, account state, sync state, and action that failed. Replace private entry text with a neutral example.",
        },
        {
          title: "Protect the archive first",
          body: "Do not clear writing, replace an import, or delete the app as a troubleshooting step unless you already have an export you can open. A failed sync should not stop local writing.",
        },
        {
          title: "Current availability",
          body: "Journal is available only to internal TestFlight testers. There is no public invitation, App Store listing, paid support plan, or guaranteed response time. Public work remains tracked in the GitHub repository.",
        },
        {
          title: "Wellbeing boundary",
          body: "Support can help with the software and its data controls. Journal does not provide therapy, diagnosis, crisis support, or medical advice.",
        },
      ],
    },
    terms: {
      title: "Simple beta terms.",
      lede: "Personal evaluation of a private, device-first writing app.",
      sections: [
        {
          title: "Your words and decisions",
          body: "You retain responsibility for what you write, export, import, keep, or delete. Journal provides a private writing tool and does not review an entry before you rely on or share an exported copy.",
        },
        {
          title: "Beta software",
          body: "The app is an internal TestFlight beta and may change, stop working, or lose beta access. Keep a verified export of any writing you cannot afford to lose.",
        },
        {
          title: "No professional service",
          body: "Prompts and future reflection ideas are not therapy, medical care, diagnosis, or a guarantee of wellbeing. Do not use Journal for emergencies or to replace qualified help.",
        },
        { title: "Changes", body: "Last updated 28 August 2026." },
      ],
    },
    accessibility: {
      title: "Private writing should remain reachable.",
      lede: "Journal uses native controls and keeps the writing loop understandable without relying on colour or motion.",
      sections: [
        {
          title: "Current support",
          body: "The app uses Dynamic Type, semantic labels, native text editors, visible status language, generous touch targets, and Reduce Motion-aware onboarding transitions. The layout remains scrollable at accessibility text sizes.",
        },
        {
          title: "Remaining hardware checks",
          body: "A final VoiceOver chronology and writing-keyboard pass still needs repeating on a physical iPhone. This page records that unfinished check instead of claiming complete hardware accessibility certification.",
        },
        {
          title: "Report a barrier",
          body: "Use TestFlight feedback and name the screen, text size, assistive technology, and action that failed. Do not include private entry text.",
        },
      ],
    },
    testflight: {
      title: "Internal TestFlight is active.",
      lede: "Build 1.0.0 (5) completed processing and entered internal beta testing; current source is build 6 and has no public enrollment link.",
      testing:
        "Write and save morning and evening reflections, move between dates with an unsaved draft, reopen an archived entry, export and preview an import, and verify optional account sync without exposing entry text in feedback.",
      notIncluded:
        "A public invitation, App Store listing, iPad release, publishing, social feed, mood scoring, therapy, or AI emotional interpretation is not available.",
      sections: [],
    },
  },
  requiredHomeCopy: [
    "morning",
    "evening",
    "private",
    "Internal TestFlight",
    "No public invite",
    "Significant Hobbies account",
  ],
  prohibitedClaims: [
    "public journal",
    "available on the app store",
    "public TestFlight",
    "iPad app",
    "AI emotion detection is available",
    "browser journal",
  ],
};
