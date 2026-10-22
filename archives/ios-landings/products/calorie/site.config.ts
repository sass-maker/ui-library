import type { SiteConfig } from "../../src/lib/types";

export const site: SiteConfig = {
  name: "Calorie",
  url: "https://calorie.significanthobbies.com",
  tagline: "A private food journal for weight loss.",
  headline: ["A private food journal for weight loss", "with math you can inspect."],
  lede: "Log meals, four nutrients, water, weight, and routines in seconds. See transparent fasting, exercise, and sleep estimates from your timestamps and targets.",
  kicker: "Native food & body journal",
  summary:
    "A private, local-first iPhone and iPad journal for food, four core nutrients, water, weight, routines, and transparent timing guidance. Optional Apple sign-in can add private Cloudflare sync.",
  status: "Internal TestFlight only. No public invite or App Store listing.",
  platforms: ["iPhone", "iPad"],
  themeColor: "#121813",
  mark: "/images/brand/mark.png",
  socialImage: "/images/brand/social.png",
  tokens: {
    paper: "#121813",
    field: "#1e281f",
    ink: "#ecf4eb",
    inkSoft: "#94979b",
    inkFaint: "rgba(236, 244, 235, 0.14)",
    accent: "#6fa55d",
    accentDark: "#91c37f",
    accentSoft: "#91c37f",
    lanternA: "#6fa55d",
    lanternB: "#f4c14c",
    lanternC: "#ff7065",
    blush: "#304031",
    inkOnDark: "#ecf4eb",
    inkOnAccent: "#121813"
  },
  sceneArtwork: { src: "/images/story/calorie-scene-v1.webp", alt: "A moss-green meal journal beside a simple grain-and-vegetable bowl and water glass", width: 1536, height: 1024, caption: "Illustrative artwork · ordinary meals, a record you can inspect" },
  colorScheme: "dark",
  hero: {
    image: "/images/screens/today.webp",
    alt: "Calorie Today on iPhone, with the day’s log and timing guidance",
    caption: "Log what you ate. The timing is just math you can see."
  },
  gallery: [
    { src: "/images/screens/today.webp", alt: "Calorie Today" },
    { src: "/images/screens/quick-log.webp", alt: "Calorie quick log" },
    { src: "/images/screens/foods.webp", alt: "Calorie foods" },
    { src: "/images/screens/progress.webp", alt: "Calorie progress" },
    { src: "/images/screens/you.webp", alt: "Calorie You settings" }
  ],
  applicationCategory: "HealthApplication",
  availability: "unreleased",
  heroCtaEvents: { primary: "cta_testflight", overview: "cta_look_inside" },
  betaNote: "The native journal is available to invited internal testers. There is no public TestFlight or App Store link yet.",
  tension: {
    statement: "A calorie total cannot explain your day.",
    title: "Every estimate shows its inputs.",
    copy: "Calorie uses food timestamps, four nutrients, water, routines, weight, and your own targets to estimate fasting, exercise, and sleep windows. The rules stay visible, and the result is never medical advice."
  },
  chaptersKicker: "One practical loop",
  chaptersTitle: "Log the meal. See the timing. Keep the trend.",
  chaptersLede: "Fast enough for the moment after eating; transparent enough to audit later.",
  chapters: [
    {
      name: "Today",
      title: "See what today is doing.",
      copy: "Food, four nutrients, water, routines, and weight share one daily view. Fasting, exercise, and sleep estimates sit beside the inputs and rules that produced them.",
      image: "/images/screens/today.webp",
      alt: "Calorie Today"
    },
    {
      name: "Log",
      title: "Log a familiar meal in seconds.",
      copy: "Reuse a saved food, add a one-off, choose an amount, and keep the real eating time. The journal is designed for one-handed logging immediately after a meal.",
      image: "/images/screens/quick-log.webp",
      alt: "Calorie quick log"
    },
    {
      name: "Progress",
      title: "Compare seven and thirty days.",
      copy: "Review intake, eating rhythm, timing, and weight with the sample size and missing days visible. Progress is context, not a streak or a moral score.",
      image: "/images/screens/progress.webp",
      alt: "Calorie progress"
    }
  ],
  fit: {
    kicker: "An honest fit",
    title: "A journal. Not a diet.",
    yes: "Calorie may fit if you are pursuing weight loss and want a private iPhone or iPad journal with fast logging and timing you can audit.",
    no: "It is not medical care, not a barcode scanner, and not a social feed. It will not prescribe a deficit."
  },
  privacy: {
    kicker: "Private by default",
    title: "The journal stays yours.",
    copy: "The default journal lives on the device and needs no account. Optional Sign in with Apple can keep a private, user-scoped copy in Cloudflare D1. This marketing page is static."
  },
  faqs: [
    {
      question: "Do I need an account?",
      answer: "No. The native journal works on this device without one. Sign in with Apple is optional private sync."
    },
    {
      question: "Where do I actually use it?",
      answer: "In the native iPhone or iPad app. This website is only the public product page."
    },
    {
      question: "Is it medical advice?",
      answer: "No. Timing suggestions are estimates from the numbers you enter. They are not diagnosis or treatment."
    },
    {
      question: "Is the iPhone app on the App Store?",
      answer: "Not yet. This site will not show Apple’s badge until a live apps.apple.com listing exists."
    },
    {
      question: "Is Calorie paid?",
      answer: "There is no paid plan or checkout. Access is currently limited to invited internal TestFlight testers, and no permanent free or paid model has been announced."
    }
  ],
  founder: {
    quote: "I was trying to lose weight, so I built this.",
    credit: "— Sarthak Agrawal, creator of Calorie",
    note: "A simple personal tracker for food, fasting, exercise windows, and how each day went."
  },
  closingTitle: ["Log the meal.", "See the timing."],
  footerFinePrint: "Private iPhone and iPad journal. Internal TestFlight only; no public invite, App Store listing, paid plan, or checkout. Timing estimates are informational, not medical advice. © 2026 Sarthak Agrawal.",
  capabilities: [
    "Today: food, calories, carbs, protein, fibre, water, routines, weight, and transparent timing for this date",
    "Foods: fast one-off entries and reusable items per 100 g or per unit",
    "Progress: visible-sample 7- and 30-day trends without streak scoring"
  ],
  boundaries: [
    "No social feed",
    "Not medical advice",
    "Default data is local-first; optional private cloud sync",
    "No App Store listing yet"
  ],
  agentFit: {
    bestFit: [
      "Understanding Calorie as a private native food and body journal",
      "Checking how food timestamps and personal targets produce transparent fasting, exercise, and sleep estimates",
      "Confirming current access, privacy, TestFlight, and non-medical boundaries"
    ],
    notAFit: [
      "Medical, nutrition, or weight-loss prescriptions",
      "Barcode scanning, social feeds, wearable sync, or workout programming",
      "Public App Store or TestFlight installation links"
    ]
  },
  lastUpdated: "2026-08-28",
  legal: {
    privacy: {
      title: "Your journal stays yours.",
      lede: "How Calorie handles local journal data, optional private cloud sync, and deletion.",
      sections: [
        {
          title: "The default journal stays on your device",
          body: "Foods, entries, calories, carbs, protein, fibre, water, routine check-offs, weight, goals, and profile fields are stored locally on your iPhone or iPad. You can use the journal without creating an account."
        },
        {
          title: "Optional private sync",
          body: "If you choose Sign in with Apple, Calorie can keep a private, user-scoped copy in Cloudflare D1. The service verifies the native app identity and does not expose one person’s foods or entries to another person. Sync is optional and is not required to open or use the local journal."
        },
        {
          title: "Account and service data",
          body: "Signed-in mode stores the account identifier and service records needed for authentication, synchronization, reliability, and abuse prevention. The static marketing pages never receive the contents of a local-only journal. Website analytics is disclosed separately and is not included in the native app.",
          paragraphs: [
            "When the optional service ingestion key is configured, App Health may receive a generic account-created event with the fixed title “New account created” and no account or profile properties.",
            "The same optional key enables endpoint health measurements for API performance: the HTTP method, matched route template, response status, duration, declared response size, and timestamp. Route parameters are represented by their template placeholders. These endpoint measurements do not include account or user identifiers, food or health records, request or response bodies, headers, cookies, or query values. Without the key, endpoint monitoring is disabled. Both App Health signals are separate from the marketing site's Microsoft Clarity analytics."
          ]
        },
        {
          title: "Your controls",
          body: "The native app includes local data export and deletion controls. Signing out does not silently delete a local journal. If you use sync, account and cloud-data deletion are handled through the app’s account controls or the support route. Exported files are your responsibility once they leave the app."
        },
        {
          title: "Sensitive information and estimates",
          body: "Calorie is a personal tracking tool, not medical care. Do not use it for diagnosis, treatment, dosage instructions, or emergencies. Timing and target estimates are derived from the information you enter and visible rules; they can be incomplete or wrong."
        },
        {
          title: "Effective date",
          body: "Last updated 28 August 2026. Material privacy changes will be reflected on this page before a public App Store release."
        }
      ]
    },
    support: {
      title: "Support, without a maze.",
      lede: "The fastest way to report a problem in the journal.",
      sections: [
        {
          title: "What to include",
          body: "Say whether you were on Today, the log sheet, Foods, or Progress, and whether you were local-only or signed in. Do not send food logs with someone else’s private details."
        },
        {
          title: "Before reporting a sync issue",
          body: "Confirm that the local journal still opens, note whether Sign in with Apple succeeds, and say whether the issue affects one entry or the whole account. Do not delete local data as a troubleshooting step unless you already have an export you can verify."
        },
        {
          title: "Current availability",
          body: "Calorie is available only to invited internal TestFlight testers. There is no public TestFlight invitation, App Store listing, paid support plan, or guaranteed response time. The public roadmap is maintained in the Calorie GitHub repository."
        },
        {
          title: "Safety boundary",
          body: "Support can help with the software and your data controls. It cannot interpret symptoms, prescribe a diet, change medication guidance, or provide urgent medical help."
        }
      ]
    },
    terms: {
      title: "Simple terms.",
      lede: "Personal use of the Calorie journal.",
      sections: [
        {
          title: "Personal tracking software",
          body: "Calorie records information you choose to enter and presents calculations, trends, and timing estimates. You remain responsible for what you enter, how you interpret it, and any decisions you make outside the app."
        },
        {
          title: "Not medical care",
          body: "Calorie does not diagnose, treat, prescribe, or replace a qualified professional. Do not use it for emergencies, medication dosage, eating-disorder treatment, or clinical nutrition decisions."
        },
        {
          title: "Availability and changes",
          body: "The app is currently an internal TestFlight beta and may change, stop working, or lose beta access. There is no public distribution promise, paid plan, service-level commitment, or warranty that estimates will be complete or accurate."
        },
        {
          title: "Your data",
          body: "Keep an export if the journal matters to you. You must not use Calorie to access another person’s account or upload information you do not have permission to store. Optional sync remains subject to the privacy policy."
        },
        { title: "Changes", body: "Last updated 28 August 2026." }
      ]
    },
    accessibility: {
      title: "Access is part of the journal.",
      lede: "The iPhone and iPad app uses native accessibility throughout the journal.",
      sections: [
        {
          title: "Current support",
          body: "The native app supports Dynamic Type, VoiceOver labels and reading order, comfortable touch targets, keyboard-contained sheets, and status cues that do not rely on color alone."
        },
        {
          title: "Motion, appearance, and charts",
          body: "Calorie respects Reduce Motion and offers Light, Dark, and System appearance choices. Progress charts include textual context and visible sample counts so the result is not conveyed by a shape or color alone."
        },
        {
          title: "Known scope",
          body: "Accessibility is tested across the maintained iPhone and iPad experience, but the internal beta may still contain defects. Report the screen, text size, assistive technology, and action that failed through the support route without including private journal details."
        }
      ]
    },
    testflight: {
      title: "The native beta is private.",
      lede: "Calorie has an internal TestFlight build, but no public invitation link. This page will not invent one.",
      testing: "Invited testers can complete onboarding, log a familiar food on iPhone or iPad, verify Today totals and timing, review Progress, and optionally confirm private Apple-sign-in sync without replacing the local journal.",
      notIncluded: "A public TestFlight invitation, App Store listing, paid plan, barcode scanning, social feed, wearable sync, and medical guidance are not in this beta.",
      sections: [
        {
          title: "Keep local data recoverable",
          body: "Beta software can change. Use the native export before deleting the app, clearing data, or testing account reconciliation. Do not assume TestFlight installation alone backs up a local journal."
        },
        {
          title: "Send bounded feedback",
          body: "Report the screen, action, device class, and whether you were local-only or signed in. Avoid screenshots or exports containing food, weight, routine, or account details you do not want included in a bug report."
        }
      ]
    }
  },
  requiredHomeCopy: ["private food journal", "fasting", "exercise", "internal TestFlight"],
  prohibitedClaims: ["diagnose", "guaranteed", "available on the app store"]
};
