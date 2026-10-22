import type { SiteConfig } from "../../src/lib/types";
export type { Chapter, Faq, LegalSection, LegalPage, SiteConfig } from "../../src/lib/types";

export const site: SiteConfig = {
  name: "Setline",
  url: "https://setline.significanthobbies.com",
  tagline: "Run every workout exactly as written.",
  headline: ["Run the workout", "you already wrote."],
  lede: "Keep strength, cardio, and mobility sessions in authored order. Setline puts the current set and rest clock in front of you, then records every explicit change.",
  kicker: "Native workout execution for iPhone",
  summary: "An iOS-native training tracker that runs a written strength, cardio and mobility programme one set at a time and measures each exercise against an authored target.",
  status: "Internal TestFlight only. No public invite or App Store listing.",
  platforms: ["iPhone"],
  themeColor: "#0f181d",
  mark: "/images/brand/mark.webp",
  socialImage: "/images/brand/social.png",
  tokens: {
    paper: "#18262e", field: "#0f181d", ink: "#f7f6f0", inkSoft: "rgba(247,246,240,0.72)", inkFaint: "rgba(247,246,240,0.12)",
    accent: "#b9e83f", accentDark: "#f7f6f0", accentSoft: "#b9d8e8", lanternA: "#b9e83f", lanternB: "#b9d8e8", lanternC: "#ff614d",
    blush: "#2a373e", inkOnDark: "#f7f6f0", inkOnAccent: "#18262e"
  },
  sceneArtwork: { src: "/images/story/training-bench-v1.webp", alt: "A lime training log, ordered workout cards and a weight plate on a paper workbench", width: 1536, height: 1024, caption: "Illustrative artwork · an authored workout, one set at a time" },
  colorScheme: "dark",
  hero: { image: "/images/screens/workout-player.webp", alt: "Setline workout player showing the current set", caption: "The current set owns the screen. Record it, then rest." },
  gallery: [
    { src: "/images/screens/today.webp", alt: "Setline Today screen with the session for this day" },
    { src: "/images/screens/workout-player.webp", alt: "Setline recording the current set" },
    { src: "/images/screens/rest-timer.webp", alt: "Setline rest timer after a completed set" },
    { src: "/images/screens/plan.webp", alt: "Setline plan for the authored programme" },
    { src: "/images/screens/history.webp", alt: "Setline history of recorded sessions" }
  ],
  applicationCategory: "HealthApplication",
  availability: "unreleased",
  newsletterCapture: true,
  betaNote: "A processed internal build has been installed and launched on a physical iPhone. Current source is still being refined; there is no public download link.",
  tension: { statement: "The gym is the wrong place to decide.", title: "Write the session before it starts.", copy: "Use the bundled twelve-week programme or author a bounded plan of your own. Setline keeps its order, targets, and rest close at hand without silently changing the next workout." },
  chaptersKicker: "One session",
  chaptersTitle: "Play the workout. Keep the evidence.",
  chaptersLede: "Today resolves the plan. The player handles the set. History keeps what really happened.",
  chapters: [
    { name: "Today", title: "Start in authored order.", copy: "The local date resolves to the planned session, including explicit unplanned days. Start without reopening a PDF, note, or spreadsheet.", image: "/images/screens/today.webp", alt: "Setline Today" },
    { name: "Player", title: "Keep target and actuals separate.", copy: "Complete the planned set, record ordered drop segments, or explicitly skip, add, or defer work. Setline preserves the deviation without rewriting the programme.", image: "/images/screens/workout-player.webp", alt: "Setline player" },
    { name: "Rest", title: "Measure the gap, not just the countdown.", copy: "Authored rest, any timer adjustment, and the actual completion-to-next-start gap remain separate. The next target is ready when you are.", image: "/images/screens/rest-timer.webp", alt: "Setline rest" }
  ],
  fit: { kicker: "An honest fit", title: "Execution. Not a coach.", yes: "Setline may fit if you follow a structured strength, cardio, or mobility programme and want less decision-making between sets.", no: "It does not prescribe a programme, diagnose readiness, count calories, or turn training into a social feed." },
  privacy: { kicker: "Device first", title: "The workout never waits on a network.", copy: "The active session reads and writes locally. Private iCloud continuity is implemented but still awaits two-device hardware verification. A connected Significant Hobbies account shares completed-workout summaries with Hub only after local writes; it never receives an active set, targets, templates, or plans." },
  faqs: [
    { question: "Do I need an account?", answer: "No. Planning, starting, recording, resting, history, and export all work from local storage. No request sits between you and the next set." },
    { question: "Will it write my programme?", answer: "No. Setline ships with one authored twelve-week programme and lets you build bounded custom plans, but it does not generate or prescribe training." },
    { question: "What can leave the iPhone?", answer: "If you choose iCloud, Setline can reconcile plans, templates, targets, and completed workouts across your Apple devices. If you connect a Significant Hobbies account, Hub receives completed-workout summaries only. An active workout stays local." },
    { question: "Can I download it or pay for it?", answer: "Not publicly. Setline is in internal TestFlight with no public invitation, App Store listing, paid plan, subscription, or checkout. No permanent free or paid model has been announced." },
    { question: "Is it medical or coaching software?", answer: "No. It records the programme and measurements you provide. It does not diagnose, prescribe, or decide whether an exercise is safe for you." }
  ],
  founder: { quote: "I wanted the next set written down before I had to think.", credit: "— Sarthak Agrawal, creator of Setline", note: "Built around the strength, cardio, and mobility programme I actually follow." },
  closingTitle: ["Write it once.", "Run it set by set."],
  footerFinePrint: "Device-first iPhone workout player. Internal TestFlight only; no public invite, App Store listing, paid plan, subscription, or checkout. Not medical care or a training prescription. © 2026 Sarthak Agrawal.",
  capabilities: ["Today: calendar-correct authored session", "Player: planned targets, recorded actuals, and explicit deviations", "Rest: authored, adjusted, and actual timing", "History: immutable completed-session evidence"],
  boundaries: ["Active workouts never depend on a network request", "No advertising or analytics SDK in the app", "Not a programme generator, coach, or medical service", "No public TestFlight or App Store release", "iCloud two-device convergence is not yet hardware-verified"],
  agentFit: {
    bestFit: [
      "Explaining Setline as an execution layer for an existing strength, cardio, or mobility programme",
      "Understanding authored order, explicit in-session deviations, wall-clock rest, and planned-versus-recorded history",
      "Checking current TestFlight access, device-first behavior, iCloud scope, or Significant Hobbies Hub summary boundaries"
    ],
    notAFit: [
      "Generating, prescribing, or medically approving a training programme",
      "Claiming Apple Health, Apple Watch, sensors, social features, or automatic coaching are shipped",
      "Providing a public TestFlight, App Store, payment, or subscription link"
    ]
  },
  lastUpdated: "2026-09-28",
  legal: {
    privacy: { title: "Your training starts on the iPhone.", lede: "How local workouts, optional iCloud continuity, Hub summaries, and export stay separate.", sections: [
      { title: "The active workout is local", body: "Setline stores the programme, templates, targets, active session, completed history, and settings in the app container. Planning, recording, rest timing, recovery after relaunch, and export do not require an account or network request." },
      { title: "Private iCloud continuity", body: "Setline includes a private CloudKit transport for plans, templates, targets, and completed workouts in your Apple Account. It never syncs an active workout or bundled programme content that already ships with the app. The implementation is present, but convergence between two physical devices has not been verified, so this page does not promise finished cross-device reliability." },
      { title: "Significant Hobbies Hub", body: "If you connect a private Significant Hobbies account with Apple or Google, Setline can share completed-workout summaries after the local write succeeds. A summary contains the workout name, start time, duration, and completed-step count. It does not include set-by-set details, targets, templates, plans, or an active workout." },
      { title: "Export and deletion", body: "Export writes the complete local Setline document to a JSON file you choose. Import previews a whole-state replacement before it happens. Reset local data or deleting the app removes the local copy; neither action silently erases a separate iCloud copy or a Hub account." },
      { title: "App telemetry", body: "The native app contains no advertising, product analytics, or tracking SDK. Apple and any connected account provider process their own service data under their policies. This static marketing site is separate from the workout app." },
      { title: "Setline website analytics", body: "This site uses App Health to count page visits and named actions such as opening TestFlight details, exploring product screens, and clicking the newsletter button after a valid email and explicit consent are present. The browser tracker stores a random, site-scoped identifier in local storage (not a cookie) and sends page paths without query strings or fragments, plus referrer hostnames. It does not send workout data, email addresses, form values, or subscription records to App Health." },
      { title: "Email updates", body: "If you opt in through the footer form, SaaS Maker receives your email address, newsletter type, footer source, and consent record to manage Setline updates. Unsubscribing marks your address as unsubscribed." },
      { title: "Effective date", body: "Last updated 28 September 2026. Material changes will be reflected here before a public App Store release." }
    ]},
    support: { title: "Support, without a maze.", lede: "How to report a problem in the internal TestFlight build.", sections: [
      { title: "Send useful context", body: "Use TestFlight’s Send Beta Feedback action. Say whether the problem happened in Today, the player, rest, History, planning, iCloud, or Hub, and whether an active workout was in progress." },
      { title: "Protect the local record", body: "Do not reset local data or delete the app as a troubleshooting step unless you already have an export you can open. A failed cloud attempt should not block or erase the workout on this iPhone." },
      { title: "Current availability", body: "Setline is available only to internal TestFlight testers. There is no public invitation, App Store listing, paid support plan, or guaranteed response time. Public work remains tracked in the GitHub repository." },
      { title: "Safety boundary", body: "Support can help with the software and its data controls. It cannot prescribe training, interpret pain or symptoms, or replace a qualified professional." }
    ]},
    terms: { title: "Simple beta terms.", lede: "Personal evaluation of a device-first workout player.", sections: [
      { title: "Your programme, your decisions", body: "Setline presents the programme and measurements you provide. The bundled programme is owner-authored product data, not a general prescription. You remain responsible for exercise selection, technique, load, environment, and when to stop." },
      { title: "Recorded and calculated values", body: "Targets are authored plan data, actuals are what you record, and trends or recommendations are calculations from available history. A calculation can be incomplete or wrong and never silently changes a future workout." },
      { title: "Beta software", body: "The app is an internal TestFlight beta and may change, stop working, or lose beta access. Keep a verified export of any training record you cannot afford to lose." },
      { title: "No medical or coaching service", body: "Setline does not diagnose, treat, prescribe, assess readiness, or guarantee a training outcome. Do not use it for emergencies or to override professional advice." },
      { title: "Changes", body: "Last updated 28 August 2026." }
    ]},
    accessibility: { title: "Access is part of the workout.", lede: "Native controls should remain usable between sets and at larger text sizes.", sections: [
      { title: "Current support", body: "VoiceOver labels, Dynamic Type, Reduce Motion, visible text labels, and native control semantics are part of the player rather than a separate mode." },
      { title: "Touch and contrast", body: "Primary workout actions use large touch targets and high-contrast text. Lime marks execution but never carries status without a label, position, or shape." },
      { title: "Timing", body: "Rest uses a visible wall-clock end time and local notification, not colour or animation alone. Reduced Motion removes decorative movement without changing the recorded timing." },
      { title: "Report a barrier", body: "Use TestFlight feedback and name the screen, text size, assistive technology, and action that failed. Accessibility defects are product defects." }
    ]},
    testflight: { title: "Internal TestFlight is active.", lede: "A processed build has been installed and launched on a physical iPhone, but there is no public enrollment link.", testing: "Run an authored session in order, record planned and multi-segment actuals, make an explicit skip, extra, or Do later change, confirm wall-clock rest, relaunch safely, and inspect History.", notIncluded: "A public invitation, App Store listing, Apple Health, Apple Watch, sensor input, social features, and automatic programme generation are not available.", sections: [] }
  },
  requiredHomeCopy: ["workout you already wrote", "authored order", "internal TestFlight", "no public invite", "completed-workout summaries"],
  prohibitedClaims: ["guaranteed gains", "available on the app store", "public TestFlight", "automatic coaching", "two-device iCloud sync is verified"]
};

export const links = {
  home: `${site.url}/`, privacy: `${site.url}/privacy/`, support: `${site.url}/support/`,
  terms: `${site.url}/terms/`, accessibility: `${site.url}/accessibility/`, testflight: `${site.url}/testflight/`
};
