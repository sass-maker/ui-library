import type { SiteConfig } from "../../src/lib/types";

export const site: SiteConfig = {
  name: "Habits",
  url: "https://habits.significanthobbies.com",
  tagline: "The habit loop continues in Anchor.",
  headline: ["Habits now lives", "inside Anchor."],
  lede: "Plan the time you want to protect, notice what changed it, and make room for a better alternative in one continuous day.",
  kicker: "One product, not two.",
  summary: "Habits was merged into Anchor, the maintained local-first day planner, focus timer, and schedule-review app.",
  status: "Merged into Anchor on 24 August 2026.",
  platforms: ["Mac", "iPhone", "Apple Watch"],
  themeColor: "#e1f0fc",
  mark: "/images/brand/mark.jpg",
  socialImage: "/images/brand/social.jpg",
  tokens: {
    paper: "#fffaf5", field: "#e1f0fc", ink: "#0c1c38", inkSoft: "#263653",
    inkFaint: "rgba(12, 28, 56, 0.15)", accent: "#db293b", accentDark: "#ad182c",
    accentSoft: "#ff98a7", lanternA: "#db293b", lanternB: "#fff7cf",
    lanternC: "#78a889", blush: "#f4d9dd", inkOnDark: "#fffaf5", inkOnAccent: "#fffaf5"
  },
  colorScheme: "light",
  hero: {
    image: "/images/screens/life.webp",
    alt: "The former Habits Life room, retained as product-history artwork",
    caption: "The visual pattern language now appears at decision points inside Anchor."
  },
  gallery: [
    { src: "/images/screens/life.webp", alt: "Former Habits Life room" },
    { src: "/images/screens/trade.webp", alt: "Former Habits Trade screen" },
    { src: "/images/screens/history.webp", alt: "Former Habits History screen" }
  ],
  applicationCategory: "ProductivityApplication",
  availability: "successor",
  appUrl: "https://anchor.significanthobbies.com",
  appCtaLabel: "Continue with Anchor",
  betaNote: "Habits has no separate roadmap or new build. Existing Apple and Hub data identities are retained for compatibility.",
  tension: {
    statement: "Your schedule and your habits compete for the same hours.",
    title: "One place to plan, notice, and adjust.",
    copy: "Anchor combines the schedule, focus timer, interruption evidence, and Habits’ non-moralizing replacement loop instead of asking you to maintain two versions of your time."
  },
  chaptersKicker: "What moved forward",
  chaptersTitle: "Notice. Explain. Replace.",
  chaptersLede: "The strongest Habits ideas now support Anchor’s schedule-to-review loop.",
  chapters: [
    { name: "Notice", title: "Recognize automatic time.", copy: "The original illustrated pattern choices remain private and optional inside Anchor.", image: "/images/screens/life.webp", alt: "Former Habits visual pattern screen" },
    { name: "Explain", title: "Connect it to a real gap.", copy: "Anchor asks what changed a planned block and keeps internal pulls, external interruptions, deliberate changes, and unknowns distinct.", image: "/images/screens/trade.webp", alt: "Former Habits trade screen" },
    { name: "Replace", title: "Make room for something chosen.", copy: "Life directions shape grounded suggestions without streaks, scores, or a verdict on the day.", image: "/images/screens/history.webp", alt: "Former Habits history screen" }
  ],
  fit: {
    kicker: "The maintained product",
    title: "Use Anchor now.",
    yes: "Anchor fits if you want one schedule, one timer, and one evidence-based review of what changed your day.",
    no: "It is not medical care, addiction treatment, Screen Time enforcement, or an adherence score."
  },
  privacy: {
    kicker: "Compatibility preserved",
    title: "Old data is not being destroyed.",
    copy: "The historical bundle identifier, private Apple stores, App Store/TestFlight record, and Personal Platform habits records remain intact. This consolidation does not migrate or delete them."
  },
  faqs: [
    { question: "Is Habits still a separate product?", answer: "No. It was superseded by Anchor on 24 August 2026 and has no active roadmap." },
    { question: "What moved into Anchor?", answer: "The onboarding hero, 24 illustrated behavior patterns, eight life directions, intentional-versus-automatic framing, and non-scoring replacement suggestions." },
    { question: "Was my historical data deleted?", answer: "No. Existing Apple storage identities and Hub habits records remain compatibility resources." },
    { question: "Where should new work happen?", answer: "In Anchor. The old Habits repository is retained only as recoverable source history." }
  ],
  founder: {
    quote: "I wanted the plan, the interruption, and the pattern behind it to live in one honest loop.",
    credit: "— Sarthak Agrawal, creator of Anchor",
    note: "Habits is a retired predecessor whose strongest ideas continue in Anchor."
  },
  closingTitle: ["Plan the day.", "Learn what moved it."],
  footerFinePrint: "Habits was merged into Anchor on 24 August 2026. Compatibility resources remain preserved.",
  capabilities: ["Illustrated private pattern selection in Anchor", "Planned-versus-observed daily review", "Evidence-linked replacement suggestions"],
  boundaries: ["No separate Habits roadmap", "No automatic app monitoring", "No score, streak, or diagnosis", "No data deletion or migration in this consolidation"],
  agentFit: {
    bestFit: ["Explaining the Habits-to-Anchor consolidation", "Finding the maintained Anchor product"],
    notAFit: ["Planning new Habits features", "Claiming historical data was migrated or deleted"]
  },
  lastUpdated: "2026-08-24",
  legal: {
    privacy: { title: "Historical data remains private.", lede: "The consolidation preserves existing local and private storage identities.", sections: [{ title: "No migration", body: "No Apple, CloudKit, SwiftData, or Hub habits records were moved or deleted as part of the product merge." }, { title: "Anchor", body: "New maintained behavior-profile and schedule data belongs to Anchor under Anchor’s published privacy boundary." }] },
    support: { title: "Continue with Anchor.", lede: "Habits has no active support or release roadmap.", sections: [{ title: "Current product", body: "Use Anchor’s support surface for the maintained schedule, timer, interruption, and review experience." }] },
    terms: { title: "Historical product notice.", lede: "Habits is a retired predecessor, not an available standalone product.", sections: [{ title: "No outcome promise", body: "Neither the historical product nor Anchor guarantees a behavioral or health outcome." }] },
    accessibility: { title: "The carried experience remains accessible.", lede: "Anchor owns accessibility for the maintained onboarding and review loop.", sections: [{ title: "Current support", body: "Anchor’s carried artwork has text labels and supports Dynamic Type, VoiceOver, Reduce Motion, increased contrast, and non-color selection state." }] },
    testflight: { title: "Habits is no longer seeking a separate release.", lede: "The maintained product is Anchor.", testing: "Use Anchor’s verified release status for current testing.", notIncluded: "No new standalone Habits TestFlight or App Store release is planned.", sections: [] }
  },
  requiredHomeCopy: ["Habits", "Anchor", "Merged"],
  prohibitedClaims: ["guaranteed", "perfect streak", "new Habits release"]
};
