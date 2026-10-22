import type { SiteConfig } from "../../src/lib/types";

export const site: SiteConfig = {
  name: "StorageDaddy",
  url: "https://storage.daddyrad.com",
  tagline: "Make room. Keep building.",
  headline: ["Make room.", "Keep building."],
  lede: "A Mac storage analyzer for developers. Find the caches, builds and AI files taking up space, inspect what matters, then review every cleanup before anything moves to Trash.",
  kicker: "Your disk, explained",
  summary: "An open-source native Mac storage analyzer with developer insights, local AI storage inspection, snapshots and reviewed cleanup.",
  status: "Public early-access beta · free to download",
  platforms: ["macOS 14+", "Apple silicon"],
  themeColor: "#000000",
  mark: "/images/icon.png",
  artwork: "/images/mark.png",
  socialImage: "/images/storage-explorer.png",
  tokens: {
    paper: "#000000", field: "#09120e", ink: "#f2f7f4", inkSoft: "#afc1b7", inkFaint: "#24392e",
    accent: "#74d4a6", accentDark: "#8ce0b8", accentSoft: "#98e9c3", lanternA: "#74d4a6",
    lanternB: "#78cbd5", lanternC: "#d8c78b", blush: "#101d16", inkOnDark: "#f2f7f4", inkOnAccent: "#07150e"
  },
  sceneArtwork: { src: "/images/story/storagedaddy-scene-v1.webp", alt: "An archive box, storage-map blocks and a separate review card on a dark workbench", width: 1536, height: 1024, caption: "Illustrative artwork · inspect the space before deciding what goes" },
  colorScheme: "dark",
  device: "desktop",
  hero: { image: "/images/storage-explorer.png", alt: "StorageDaddy storage explorer showing a sample folder tree and storage treemap", caption: "A real app capture of a sample folder. Scan results describe the selected area, not necessarily the entire volume.", width: 1405, height: 768 },
  gallery: [
    { src: "/images/storage-explorer.png", alt: "Browse the scanned folder tree and inspect its storage breakdown", width: 1405, height: 768 },
    { src: "/images/ai-context.png", alt: "StorageDaddy AI Context view for local skills and project instructions", width: 700, height: 466 }
  ],
  applicationCategory: "UtilitiesApplication",
  availability: "unreleased",
  macDownloadUrl: "https://storage.daddyrad.com/download",
  macDownloadLabel: "Download for Mac",
  betaNote: "The public beta is signed and notarized for Apple silicon Macs on macOS 14 or later. Early-access downloads include future versions free forever, with no trial expiry, account or checkout. The download uses StorageDaddy’s existing release service.",
  tension: { statement: "Know what is there before deciding what goes.", title: "Space has a backstory.", copy: "Builds, caches, installed packages and agent histories accumulate quietly. StorageDaddy brings their sizes and locations into one native workspace. A scan deletes nothing." },
  chaptersKicker: "Inspect, then decide",
  chaptersTitle: "From full disk to a clear decision.",
  chaptersLede: "Follow the folder tree, inspect developer storage, and keep every cleanup behind a separate review.",
  chapters: [
    { name: "Explore", title: "Follow the space.", copy: "Browse live scan results, folder graphs and the inspector. Developer Insights highlights caches, build outputs, packages, node_modules, .git and AI storage. Save snapshots to compare later scans.", image: "/images/storage-explorer.png", alt: "Storage explorer with folder navigation and size evidence", width: 1405, height: 768 },
    { name: "Understand", title: "See your AI footprint.", copy: "Inspect recognized local Claude and Codex histories, skills and project context. Context-load estimates are not measurements of an agent’s entire runtime context. Selected session exports are reading archives, not resumable backups.", image: "/images/ai-context.png", alt: "AI Context beta inspecting recognized local context sources", width: 700, height: 466 }
  ],
  fit: { kicker: "An honest fit", title: "For the Mac you build on.", yes: "Developers who want to understand disk usage and review specific cleanup candidates, with local evidence and readable paths.", no: "Automatic deletion, guaranteed reclaimed-space totals, an Intel build, or a replacement for a backup." },
  privacy: { kicker: "Your files stay on your Mac", title: "Local scans. Explicit cleanup.", copy: "Scanning, previews and archive validation run locally. The native app has no file uploads or app telemetry. Sparkle checks for updates over HTTPS; installation remains your choice." },
  faqs: [
    { question: "Does scanning delete anything?", answer: "No. Add candidates, review the list, then explicitly confirm moving them to Trash. StorageDaddy does not automatically empty Trash." },
    { question: "Why can totals differ from macOS Storage?", answer: "Allocated and logical sizes differ. Shared APFS blocks, snapshots, protected files and scan scope also affect totals. Allocated bytes are not a guarantee of space reclaimed." },
    { question: "Do I need Full Disk Access?", answer: "It is optional and enables broader coverage. Protected or unreadable locations may still be skipped. A folder scan is a useful starting point." },
    { question: "What does early access cost?", answer: "The current beta is free. Everyone who downloads during early access gets future versions free forever. There is no account, checkout, subscription or trial expiry today." }
  ],
  founder: { quote: "A scan deletes nothing.", credit: "The StorageDaddy cleanup rule", note: "Inspect first. Review candidates. Confirm separately." },
  closingTitle: ["Find the space.", "Make the call."],
  footerFinePrint: "An independent Mac app from Significant Hobbies. Published source is MIT-licensed; third-party components retain their own terms.",
  capabilities: ["Native folder and disk storage exploration", "Developer caches, builds, packages and AI storage insights", "Reviewed move-to-Trash cleanup", "Local Claude and Codex session inspection and selected archives", "Storage snapshots and comparisons"],
  boundaries: ["macOS 14 or later on Apple silicon; no Intel build", "No deletion during a scan; Trash is not automatically emptied", "Allocated bytes do not guarantee reclaimed space", "Context estimates are not full runtime-context measurements", "Session archives are lossy reading exports, not resumable backups"],
  lastUpdated: "2026-09-19",
  legal: {
    privacy: { title: "Privacy", lede: "StorageDaddy scans and inspects files locally on your Mac.", sections: [
      { title: "Native app", body: "Scanning, previews and archive validation run locally. The app has no file uploads or app telemetry. Sparkle checks an HTTPS update feed and downloads updates when you choose to install them." },
      { title: "Files you export", body: "Session exports can contain prompts, replies and recognized session details. Review an archive before sharing it. Originals remain until a separate confirmed cleanup." },
      { title: "This website", body: "This factory page loads shared Significant Hobbies footer scripts. Hosting requests can include ordinary connection data. The AI footer opens a question about the public product in your chosen assistant only when clicked; it does not attach local files. The existing live StorageDaddy site separately measures visits and download clicks. Those events do not contain disk contents or app activity." }
    ] },
    support: { title: "Support", lede: "Help us understand the storage problem without sharing private file contents.", sections: [{ title: "Report an issue", body: "Use https://github.com/sarthakagrawal927/storagedaddy/issues/new. Include your app version, macOS version, scan scope and what you expected. Remove personal paths and session contents before attaching screenshots or exports." }] },
    terms: { title: "Terms", lede: "StorageDaddy is early-access software. Review every cleanup and keep backups.", sections: [{ title: "Availability and license", body: "The current beta has no trial expiry, account or checkout. Early-access downloads include future versions free forever. Published source is MIT-licensed; third-party code and artwork retain their own terms." }, { title: "Your decisions", body: "Review selected files before confirming a move to Trash. Scan coverage and storage totals have limitations; no particular amount of reclaimed space is guaranteed." }] },
    accessibility: { title: "Accessibility", lede: "Readable information and deliberate actions matter in a storage tool.", sections: [{ title: "Website", body: "This page uses semantic headings, keyboard-operable links and disclosures, visible focus, screenshot descriptions and reduced-motion support." }, { title: "Native app feedback", body: "Report keyboard, VoiceOver or readability problems through the StorageDaddy GitHub issues. Complete assistive-technology coverage is not claimed by this page." }] },
    testflight: { title: "Release status", lede: "StorageDaddy is distributed directly for Mac, not through TestFlight.", sections: [], testing: "Storage exploration, developer insights, reviewed cleanup, application inspection, snapshots and local AI storage tools.", notIncluded: "Intel support, guaranteed reclaimed-space totals, automatic Trash emptying and resumable AI-session backups." }
  },
  requiredHomeCopy: ["StorageDaddy", "macOS 14+", "Apple silicon", "review"],
  prohibitedClaims: ["guaranteed space savings", "supports Intel Macs"]
};
