import type { SiteConfig } from "../../src/lib/types";
export type { Chapter, Faq, LegalSection, LegalPage, SiteConfig } from "../../src/lib/types";

export const site: SiteConfig = {
  name: "Anchor",
  url: "https://anchor.significanthobbies.com",
  tagline: "Plan the day. Protect the present. Learn what moved it.",
  headline: ["Plan the day.", "Learn what moved it."],
  lede: "A private day planner and focus timer for people moving between Mac, iPhone and Apple Watch who want to learn why the day they lived differed from the plan.",
  kicker: "Plan. Focus. Adapt.",
  summary: "A local-first day planner and focus timer for Mac, iPhone and Apple Watch that schedules the day, captures what pulled you away, and explains the gap between plan and reality.",
  status: "Invite-only TestFlight and notarized Mac beta",
  platforms: ["iPhone", "Mac", "Apple Watch"],
  themeColor: "#0b0b0c",
  mark: "/images/brand/anchor-mark-v29.png",
  socialImage: "/images/brand/anchor-social-v29.png",
  tokens: {
    paper: "#0b0b0c", field: "#151515", ink: "#f2f0ea", inkSoft: "#aaa8a2", inkFaint: "rgba(255,255,255,0.09)",
    accent: "#f2f0ea", accentDark: "#c7c4bd", accentSoft: "#c7c4bd", lanternA: "#f2f0ea", lanternB: "#e1ad4a", lanternC: "#e66a5c",
    blush: "#202020", inkOnDark: "#f2f0ea", inkOnAccent: "#111111"
  },
  sceneArtwork: { src: "/images/story/anchor-scene-v2.webp", alt: "A charcoal day folio with warm paper, a graphite bookmark and movable amber and coral schedule strips", width: 1536, height: 1024, caption: "Illustrative artwork · the plan can change, the record stays clear" },
  colorScheme: "dark",
  hero: { image: "/images/screens/today.webp", alt: "Anchor Today showing a chronological day plan and the usual-week schedule action", caption: "Draw the day first: see open time, build the usual week, and keep today-only changes explicit.", width: 402, height: 874 },
  illustration: { src: "/images/brand/day-doodle.svg", alt: "A hand-drawn character arranging the day while distractions wait in a basket" },
  gallery: [
    { src: "/images/screens/today.webp", alt: "Anchor Today showing the day plan", width: 402, height: 874 },
    { src: "/images/screens/session.webp", alt: "Anchor running a focus session", width: 400, height: 278 },
    { src: "/images/screens/resume-capture.webp", alt: "Anchor asking what pulled you away", width: 344, height: 400 },
    { src: "/images/screens/insights.webp", alt: "Anchor history comparing focus and interruptions", width: 400, height: 339 }
  ],
  applicationCategory: "ProductivityApplication",
  availability: "unreleased",
  macDownloadUrl: "https://anchor.significanthobbies.com/downloads/Anchor-1.0.dmg",
  macDownloadLabel: "Download notarized Mac beta",
  betaNote: "Build 29 is available as a notarized Mac beta. Invite-only TestFlight remains on its separately processed build, and there is no public App Store listing yet. Distraction notes never enter the Hub, analytics, telemetry, or a cloud model.",
  tension: { statement: "A plan is only useful if it can survive reality.", title: "The gap is the useful part.", copy: "Anchor schedules the day, protects the current block, captures what changed, and gives that evidence back when you plan tomorrow." },
  chaptersKicker: "One daily loop",
  chaptersTitle: "Plan it. Live it. Learn.",
  chaptersLede: "Schedule the day, protect the current block, then review the difference without turning it into a score.",
  chapters: [
    { name: "Plan", title: "Draw the day in time.", copy: "Today shows the day as a chronological rail, keeps gaps visible, and distinguishes a one-off adjustment from a change to the usual week.", image: "/images/screens/today.webp", alt: "Anchor Today day rail and usual-week schedule action", width: 402, height: 874 },
    { name: "Focus", title: "Protect the current block.", copy: "Anchor offers the current or next scheduled block, keeps time from the wall clock, and makes interruption capture immediate.", image: "/images/screens/session.webp", alt: "Anchor focus session", width: 400, height: 278 },
    { name: "Capture", title: "Name what moved the day.", copy: "Coming back captures the interruption. “Nothing, just a break” stays one key away.", image: "/images/screens/resume-capture.webp", alt: "Anchor resume capture", width: 344, height: 400 },
    { name: "History", title: "Compare the plan with reality.", copy: "Deliberate changes, internal pulls, external interruptions, human needs, estimation errors, and unknown gaps stay distinct.", image: "/images/screens/insights.webp", alt: "Anchor history and interruption evidence", width: 400, height: 339 }
  ],
  fit: { kicker: "An honest fit", title: "A planner that takes divergence seriously.", yes: "Anchor fits if you want one place to schedule the day, focus on the present block, and learn why the plan changed.", no: "It is not a website blocker, a social productivity feed, or a moral score for how closely you followed a plan." },
  privacy: { kicker: "Private by construction", title: "Your notes are not product telemetry.", copy: "Full Anchor data stays local or in your private iCloud database. Optional Hub sync sends only finished-session summaries and never distraction notes, plans, or behavior selections." },
  faqs: [
    { question: "Do I need an account?", answer: "No. Anchor is fully usable without one. A Significant Hobbies Hub account is optional and only adds finished-session summary visibility." },
    { question: "Is it on the App Store?", answer: "Not yet. This site will not show Apple’s App Store badge until a live apps.apple.com page exists." },
    { question: "Can I download the Mac app?", answer: "Yes. The Mac beta is Developer ID signed, hardened, notarized by Apple, and requires macOS 26 or later." },
    { question: "Which devices?", answer: "Mac, iPhone, and Apple Watch. The landing uses real captures from those apps." }
  ],
  founder: { quote: "I wanted the interruption filed before I had agreed to it.", credit: "— Sarthak Agrawal, creator of Anchor", note: "An independent app from Significant Hobbies." },
  closingTitle: ["Protect the present.", "Adapt tomorrow."],
  footerFinePrint: "A private day planner and focus timer, not a blocker. © 2026 Sarthak Agrawal.",
  capabilities: ["Today: one-off and recurring plans", "Focus: wall-clock sessions and interruption capture", "Habits: patterns and concrete replacements", "History: planned-versus-lived review and export"],
  boundaries: ["No account required", "Distraction notes stay on-device or in your private iCloud", "No analytics or advertising SDK", "Not a website blocker", "Mac beta; not listed on the App Store yet"],
  lastUpdated: "2026-09-28",
  legal: {
    privacy: { title: "Your private notes are not our data.", lede: "The Anchor app is local-first and uses no analytics or advertising SDK. It never sends distraction notes to Significant Hobbies, a cloud model, or telemetry. This website has separate, limited analytics described below.", sections: [
      { title: "What Anchor stores", body: "Anchor stores your one-off and recurring plans, behavior selections and replacements, focus sessions, outcomes, and the distractions you write down. This is written to a database on your device." },
      { title: "On your device", body: "The database lives in Anchor’s own container on your Mac, iPhone or Apple Watch." },
      { title: "In your iCloud, if you use it", body: "When you’re signed in to iCloud, Anchor syncs through Apple’s CloudKit into your private database. That data is held in your Apple account under Apple’s terms. We cannot see it, and we have no way to request it." },
      { title: "Optional Significant Hobbies Hub", body: "Anchor works fully without an account. If you choose to connect the Significant Hobbies Hub, Anchor sends only a finished session’s goal, start and end times, focused duration, outcome, and interruption count to your Hub account. Plans, behavior selections, session notes, and distraction notes are excluded. Signing out stops future Hub sync." },
      { title: "Distraction notes", body: "Distraction text is never sent to Significant Hobbies, analytics, telemetry, or a model. If you enable iCloud, Apple may sync it only within your private CloudKit database so your own Anchor devices stay in step." },
      { title: "What the Anchor app does not do", body: "The app has no analytics, telemetry, crash-reporting SDK, advertising, advertising identifier, or cross-app tracking. No selling or advertising use of data. The optional Hub connection is for your own finished-session summaries, not product analytics." },
      { title: "This website", body: "The landing page does not access your Anchor data. App Health collects website page views and named clicks on the Mac download and beta-status links, with basic referral and campaign information. It does not receive plans, focus sessions, or distraction notes. Hosting requests include ordinary connection data." },
      { title: "Apple Intelligence", body: "Anchor uses Apple’s on-device foundation model to group goals into themes and sort distractions into categories, and to write an optional one-paragraph summary of a period. This runs entirely on your device through Apple’s Foundation Models framework. Tagging and summaries do not send your notes to Apple, to us, or to any cloud model. Private iCloud storage is described separately above. Where Apple Intelligence is unavailable — an ineligible device, the feature switched off, or on Apple Watch, where Apple ships no on-device model — Anchor falls back to built-in keyword rules that also run locally." },
      { title: "Developer MCP tool", body: "Anchor’s source repository builds an optional local MCP server for developers, but the signed Mac app does not bundle or advertise it. The tool runs locally and never enables Anchor to transmit data. If you configure a separate AI client to read exported or locally accessible data, that client’s own privacy policy governs anything it sends." },
      { title: "Export", body: "You can export your history to Excel, CSV or JSON at any time. Exported files go wherever you save them, and are then yours to handle." },
      { title: "Deleting your data", body: "Deleting the app removes its local database. To remove private CloudKit copies, delete Anchor’s data from iCloud in your device settings. If you connected the Hub, sign out to stop future sync and email hello@significanthobbies.com to request deletion of Hub account data and session summaries." },
      { title: "Children", body: "Anchor is not directed at children under 13. The app has no advertising or analytics collection; the optional Hub connection is the only Anchor feature that uses account data." },
      { title: "Changes", body: "If this policy changes, the revised version will be posted here with a new date. Distraction-note privacy and the absence of app analytics or advertising are product constraints, not temporary settings." },
      { title: "Contact", body: "Questions: hello@significanthobbies.com." },
      { title: "Effective date", body: "Last updated 11 September 2026." }
    ]},
    support: { title: "Support, without a maze.", lede: "Email hello@significanthobbies.com and you’ll get a reply from the person who built it.", sections: [
      { title: "Does Anchor block apps or websites?", body: "No. Apple’s Screen Time blocking APIs exist only on iPhone and iPad — there is no macOS equivalent — so a blocker would work on half your devices and quietly fail on the rest. Anchor takes the other approach: capture the distraction in one keystroke and hand you back your goal. It also records honestly when a distraction won, which is what makes the analytics worth reading." },
      { title: "Why does resuming ask me a question?", body: "Because a pause is usually an interruption you would otherwise never log. Answering takes a few words, and declining with “Nothing — just a break” (or the Escape key) takes one keypress." },
      { title: "My timer kept counting while my Mac was asleep. Is that a bug?", body: "No — that’s deliberate. Anchor measures elapsed time from the clock rather than by ticking, so a session stays accurate across sleep, quitting the app, and syncing between devices. Time you spend paused is always excluded." },
      { title: "My distractions are being categorised oddly.", body: "Tap the category icon on any item in Parked to correct it. A category you set by hand is locked, and will never be overwritten by the on-device model." },
      { title: "It says Apple Intelligence isn’t available.", body: "Apple Intelligence needs a supported device with the feature switched on in Settings, and the model may still be downloading. Anchor works fully without it — grouping falls back to built-in rules, and the optional written summary is simply hidden rather than faked. Apple Watch never has it, so anything captured there is refined by your iPhone or Mac once it syncs." },
      { title: "My devices aren’t syncing.", body: "Sync uses your own private iCloud database. Check that the same Apple Account is signed in on both devices and that iCloud Drive is on. If iCloud is unavailable, Anchor keeps working against a local database rather than refusing to start a timer." },
      { title: "How do I get my data out?", body: "History → Export gives you an Excel workbook, CSV or JSON. Exports stay on your device until you choose where to save or share them." },
      { title: "Reporting a bug", body: "Email what you did, what you expected, and what happened, plus your OS version. Please don’t include your distraction notes unless they’re relevant — they’re your business." }
    ]},
    terms: { title: "Simple beta terms.", lede: "Pre-release software for personal evaluation.", sections: [
      { title: "Beta software", body: "Features may change. Keep anything you cannot lose somewhere else." },
      { title: "Changes", body: "Last updated 17 August 2026." }
    ]},
    accessibility: { title: "Access is part of the experience.", lede: "Native Apple accessibility, not a separate mode.", sections: [
      { title: "Current support", body: "VoiceOver, Dynamic Type, and Reduce Motion are tested on the principal flows." }
    ]},
    testflight: { title: "The beta is taking shape.", lede: "We only link to Apple after the enrollment URL is verified.", testing: "Plan a day, start the current block, capture what moved it, and review the result in History. A notarized Mac build is available directly from this site.", notIncluded: "A public TestFlight enrollment URL and App Store listing are not ready.", sections: [] }
  },
  requiredHomeCopy: [],
  prohibitedClaims: ["available on the app store"]
};
export const links = {
  home: `${site.url}/`, privacy: `${site.url}/privacy/`, support: `${site.url}/support/`,
  terms: `${site.url}/terms/`, accessibility: `${site.url}/accessibility/`, testflight: `${site.url}/testflight/`
};
