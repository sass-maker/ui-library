import type { SiteConfig } from "../../src/lib/types";
export type { Chapter, Faq, LegalSection, LegalPage, SiteConfig } from "../../src/lib/types";

export const site: SiteConfig = {
  name: "Motion",
  url: "https://motion.significanthobbies.com",
  tagline: "Your body is the controller.",
  headline: ["Move.", "Play."],
  lede: "A held iPhone prototype reads movement on-device and turns it into game input. Camera frames stay on the phone.",
  kicker: "A held body-controlled game prototype.",
  summary: "Motion is a held iPhone-hosted game prototype: on-device pose tracking turns movement into play and can mirror the rendered game to a larger screen without uploading camera frames.",
  status: "Held internal prototype. No public TestFlight invite or App Store listing.",
  platforms: ["iPhone"],
  themeColor: "#05070d",
  mark: "/images/brand/mark.png",
  socialImage: "/images/brand/social.png",
  tokens: {
    paper: "#05070d", field: "#0c111a", ink: "#e8eef7", inkSoft: "#8b97a8", inkFaint: "rgba(255,255,255,0.08)",
    accent: "#2dd4bf", accentDark: "#0f766e", accentSoft: "#5eead4", lanternA: "#2dd4bf", lanternB: "#38bdf8", lanternC: "#a78bfa",
    blush: "#111827", inkOnDark: "#e8eef7", inkOnAccent: "#05070d"
  },
  sceneArtwork: { src: "/images/story/motion-scene-v1.webp", alt: "An orange ball following a mint paper path between indigo arcade obstacles", width: 1536, height: 1024, caption: "Illustrative artwork · movement becomes play" },
  colorScheme: "dark",
  hero: { image: "/images/screens/motion-maker-clean.webp", alt: "Motion Maker running in the internal iPhone build", caption: "The phone tracks the body and renders the game. Only that rendered screen is mirrored to a TV." },
  gallery: [
    { src: "/images/screens/motion-maker-clean.webp", alt: "Motion Maker running in the internal iPhone build" }
  ],
  galleryTitle: ["A working build.", "An unproven control loop."],
  applicationCategory: "GameApplication",
  availability: "unreleased",
  newsletterCapture: true,
  betaNote: "The internal build runs on an iPhone, but physical control feel and fun remain unproven. Work is on hold until one control loop can be tested properly on a real device.",
  tension: { statement: "The room should stay off a server.", title: "Camera frames stay on the phone.", copy: "Vision extracts pose on-device. Screen mirroring sends the rendered game to a TV; Motion does not upload the camera stream." },
  chaptersKicker: "One mechanic",
  chaptersTitle: "Move, and the game answers.",
  chaptersLede: "You should not need to understand pose estimation before it makes sense.",
  chapters: [
    { name: "Play", title: "The body is the controller.", copy: "The iPhone reads pose locally and drives the game. A keyboard debug path exists for the web renderer, not as the product.", image: "/images/screens/motion-maker-clean.webp", alt: "Motion Maker" }
  ],
  fit: { kicker: "An honest fit", title: "A held prototype, not a console.", yes: "Motion is for iPhone owners interested in active, social play on a larger screen without buying a dedicated motion-console system—and who understand that the control loop is unfinished.", no: "It is not a public beta, a shipped App Store game, a wearable sensor kit, or a cloud camera service." },
  privacy: { kicker: "On the phone", title: "Frames do not leave the device.", copy: "Pose is extracted on-device. There is no Motion account and no uploaded camera stream. Separate from the app, this site uses App Health for page visits and named actions, and offers optional email updates only after explicit consent." },
  faqs: [
    { question: "Does video go to a server?", answer: "No. Tracking runs on the iPhone. Mirroring uses the system screen, not our servers." },
    { question: "Is it on the App Store?", answer: "Not yet. This site will not show Apple’s App Store badge until a live apps.apple.com page exists." },
    { question: "Do I need extra hardware?", answer: "An iPhone. A TV is optional if you already know how to mirror a screen." }
  ],
  founder: { quote: "I wanted the room to stay in the room.", credit: "— Sarthak Agrawal, creator of Motion", note: "A held independent prototype from Significant Hobbies." },
  closingTitle: ["Move.", "Keep the camera."],
  footerFinePrint: "A held internal game prototype, not a public beta or console. © 2026 Sarthak Agrawal.",
  capabilities: ["On-device pose tracking", "Phone-hosted game", "Optional screen mirroring"],
  boundaries: ["No Motion account", "No uploaded camera stream", "No public TestFlight invite or App Store listing", "Physical-device control feel and fun remain unproven"],
  agentFit: {
    bestFit: [
      "body-controlled games where an iPhone reads movement on-device and turns it into game input",
      "screen-mirroring phone gameplay to a larger display without uploading camera frames"
    ],
    notAFit: [
      "cloud-based motion capture or remote pose processing",
      "games that require transmitting or storing camera frames"
    ]
  },
  agentCli: [
    "Local development: `pnpm install && pnpm run dev` (relay :1999 + web :5173)",
    "Debug game: `http://localhost:5173/?debug=1` (keyboard/mouse, no phone required)",
    "Quality gate: `pnpm check` (TypeScript, formatting, debt ratchets)"
  ],
  lastUpdated: "2026-09-28",
  legal: {
    privacy: { title: "The camera stays on the phone.", lede: "Motion is a local-first game experiment.", sections: [
      { title: "What the app stores", body: "Game settings and local recordings you choose to save. Pose is computed on-device." },
      { title: "What we collect", body: "There is no Motion account and no camera upload. Pose is processed on the iPhone and camera frames are not sent to Motion servers." },
      { title: "Motion website analytics", body: "The marketing site uses App Health to count page visits and named actions such as opening the product guide or TestFlight status. It records a newsletter signup click only after a valid email and the separate explicit newsletter consent checkbox are present. Its browser tracker stores a random site-scoped identifier in local storage (not a cookie) and sends page paths without query strings or fragments, plus referrer hostnames. App Health does not receive camera frames, pose data, game state, email addresses, form values, or subscription records." },
      { title: "Email updates", body: "If you opt in through the footer form, SaaS Maker receives your email address, newsletter type, footer source, and explicit consent record to manage Motion updates. The required checkbox starts unchecked; you can unsubscribe at any time." },
      { title: "Effective date", body: "Last updated 28 September 2026." }
    ]},
    support: { title: "Support, without a maze.", lede: "How to report a problem in the experiment.", sections: [
      { title: "Send feedback", body: "Use TestFlight’s Send Beta Feedback when a build exists. Describe the game, lighting, and what the body input did." }
    ]},
    terms: { title: "Simple beta terms.", lede: "Pre-release software for personal evaluation.", sections: [
      { title: "Beta software", body: "This is an experiment. Features may change." },
      { title: "Changes", body: "Last updated 17 August 2026." }
    ]},
    accessibility: { title: "Access is part of the experiment.", lede: "Body input is the point, so alternatives are documented honestly.", sections: [
      { title: "Current support", body: "A keyboard debug path exists for the web renderer. The intended product is body-controlled play on an iPhone." }
    ]},
    testflight: { title: "The beta is taking shape.", lede: "We only link to Apple after the enrollment URL is verified.", testing: "Launch a game, move, and confirm the playfield responds. Try screen mirroring if you already use it.", notIncluded: "An App Store listing and a finished multiplayer product are not in this experiment.", sections: [] }
  },
  requiredHomeCopy: [],
  prohibitedClaims: ["available on the app store"]
};
export const links = {
  home: `${site.url}/`, privacy: `${site.url}/privacy/`, support: `${site.url}/support/`,
  terms: `${site.url}/terms/`, accessibility: `${site.url}/accessibility/`, testflight: `${site.url}/testflight/`
};
