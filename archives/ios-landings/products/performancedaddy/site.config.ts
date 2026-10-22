import type { SiteConfig } from "../../src/lib/types";
import { site as storage } from "../storagedaddy/site.config";

export const site: SiteConfig = {
  name: "PerformanceDaddy",
  url: "https://performance.daddyrad.com",
  tagline: "See what is slowing your Mac.",
  seoDescription: "Inspect Mac background apps, processes, listening ports and RAM. PerformanceDaddy records slowdown evidence and reviews targets before stopping work.",
  headline: ["A slow Mac.", "A clearer picture."],
  lede: "See what is running behind the scenes on your Mac. Inspect background apps and helpers, find the process holding a port, watch RAM and local coding agents, and record evidence while a slowdown is happening.",
  kicker: "Processes. Ports. Evidence.",
  summary: "A local Mac performance investigator for background apps, helpers and developer workloads, with process and port inspection, RAM and thermal evidence, startup clues, reviewed stops and bounded diagnostic recordings.",
  status: "Public early-access beta · free to download",
  platforms: ["macOS 14+", "Native Mac app"],
  themeColor: "#000000",
  mark: "/images/icon.png",
  artwork: "/images/mark.png",
  socialImage: "/images/ports.png",
  tokens: storage.tokens,
  sceneArtwork: { src: "/images/story/performancedaddy-scene-v2.webp", alt: "A magnifying lens over branching process relationships on indexed evidence papers", width: 1536, height: 1024, caption: "Illustrative artwork · following evidence, not guessing a cause" },
  colorScheme: "dark",
  device: "desktop",
  newsletterCapture: true,
  hero: { image: "/images/ports.png", alt: "PerformanceDaddy Ports view searching port 5000 and identifying ControlCenter as its owner", caption: "A real local capture: search a port, see its owner and resident RAM. Socket visibility depends on macOS permissions.", width: 1225, height: 768 },
  gallery: [
    { src: "/images/ports.png", alt: "Search a listening port and inspect the process that owns it", width: 1225, height: 768 },
    { src: "/images/diagnose.png", alt: "Start a 15-second or two-minute diagnostic recording while the slowdown happens", width: 1225, height: 768 }
  ],
  applicationCategory: "UtilitiesApplication",
  availability: "unreleased",
  macDownloadUrl: "https://performance.daddyrad.com/download",
  macDownloadLabel: "Download for Mac",
  betaNote: "The public beta is a signed and notarized universal build for macOS 14 or later, free during early access. A diagnostic report distinguishes measured signals from a confirmed cause; it cannot explain every slowdown.",
  tension: { statement: "A busy process is a clue. It is not the whole story.", title: "Start with what you can measure.", copy: "A port can be occupied while CPU is quiet. Allocated swap does not prove active paging. PerformanceDaddy puts the observations, their limits and the next check together." },
  chaptersKicker: "A daily Mac workbench",
  chaptersTitle: "Find it. Inspect it. Decide.",
  chaptersLede: "Move from the symptom you can see to the process and resource evidence behind it. Stopping a process always starts with a review.",
  chapters: [
    { name: "Ports & processes", title: "Find who owns the port.", copy: "Search listeners by port number or process. Sort CPU and RAM, inspect process duration and recognized local agent families, then review exact targets before a normal or force stop. No remote port scanning or cloud agent sessions.", image: "/images/ports.png", alt: "A real port search with process ownership and RAM evidence", width: 1225, height: 768 },
    { name: "Diagnosis", title: "Record the slow moment.", copy: "Capture CPU work, memory headroom, active swap-out, thermal state and disk capacity for 15 seconds or two minutes. Every run gets an evidence assessment and a next check, including when the measured signals cannot explain the delay.", image: "/images/diagnose.png", alt: "Diagnostic recording setup with explicit duration and measured domains", width: 1225, height: 768 }
  ],
  fit: { kicker: "An honest fit", title: "For a Mac full of moving parts.", yes: "Developers running local servers and coding agents who want visible ports, understandable processes, RAM evidence and deliberate stop controls.", no: "Automatic optimization, cloud-session monitoring, remote network scanning, fan control or a promise to identify every root cause." },
  privacy: { kicker: "Local investigation", title: "Your work is not the payload.", copy: "Process inspection does not collect command arguments, environment variables or agent conversations. Configuration inventory reads bounded file metadata, not contents. A separate terminal experiment runs your startup scripts only after explicit consent." },
  faqs: [
    { question: "Can I download it now?", answer: "Yes. The beta is a free, signed and notarized universal Mac build, distributed directly — no account, checkout, trial expiry, App Store or TestFlight." },
    { question: "Can it kill a process?", answer: "Yes, after review. Normal and force stops are separate choices, guarded by process identity and user restrictions. Stopping a process can interrupt work or lose unsaved data." },
    { question: "What about apps running in the background?", answer: "Inspect visible background processes and app helpers alongside foreground workloads. Compare their CPU and resident RAM, see how long a process has been running, and inspect available identity and startup metadata before deciding what to stop. Background does not mean unnecessary: macOS and your apps rely on many of these helpers." },
    { question: "Why did something come back after I stopped it?", answer: "An app, login item or service manager may launch another process. PerformanceDaddy shows matching launch-configuration clues and watches for matching executables after stops requested through the app. A match is not proof of an automatic restart or its cause. This history stays in memory for up to 24 hours and clears when you quit; the app does not disable startup items for you." },
    { question: "Which agents does it recognize?", answer: "Local metadata recognition covers Codex, Claude, Devin, Hermes, Aider, Gemini CLI, OpenCode and Cursor CLI. It cannot identify every wrapped launch or tell whether a conversation is active." },
    { question: "Does every report prove the root cause?", answer: "No. Reports separate observed signals, thresholds not met and missing evidence. CPU activity is not proof of why a task was slow. Network latency, blocked threads, GPU activity and disk latency are not measured by the standard recording." },
    { question: "Can it read fan speed or temperature?", answer: "The app reports macOS thermal state and available power evidence. Raw fan RPM, temperature and fan controls are not implemented." }
  ],
  founder: { quote: "Nothing stops until you review it.", credit: "The PerformanceDaddy action rule", note: "Observe by default. Make consequential actions explicit." },
  closingTitle: ["Understand the load.", "Choose the next move."],
  footerFinePrint: "An independent Mac app from Significant Hobbies. Free during early access.",
  capabilities: ["Background app and helper inspection", "Process duration, startup metadata clues and bounded post-stop observations", "Local process and listening-port inspection", "CPU, resident RAM, memory pressure and thermal evidence", "Recognized local coding-agent process families", "Reviewed process and family stops", "Timed diagnostic evidence assessments", "Bounded configuration metadata inventory", "Opt-in zsh startup profiling"],
  boundaries: ["Requires macOS 14 or later", "No cloud agent sessions or conversation inspection", "No remote port scan or automatic remediation", "Root cause is not guaranteed; blocked-thread, disk-latency and network-latency proof is unavailable", "Raw fan RPM, temperature and GPU monitoring are not implemented", "Configuration inventory is bounded metadata, not every file or effective configuration", "Terminal startup profiling executes scripts only after consent and may have side effects"],
  lastUpdated: "2026-09-28",
  legal: {
    privacy: { title: "Privacy", lede: "PerformanceDaddy investigates the local Mac. It does not read agent conversations.", sections: [
      { title: "Process evidence", body: "The app reads available process names, identities, resource measurements, executable and working-directory metadata, and local sockets. It does not collect command arguments, environment variables or agent transcripts. Visibility depends on macOS permissions." },
      { title: "Configuration and terminal experiments", body: "The configuration inventory checks bounded known filenames and metadata without reading their contents. Opt-in terminal profiling executes startup scripts and those scripts can read files, use credentials, access networks or start background jobs. Consent is required before that experiment." },
      { title: "Email updates", body: "Email updates are optional and sent through SaaS Maker. Signing up sends your email address and explicit consent, which SaaS Maker stores as subscription records to manage occasional PerformanceDaddy product updates. The form does not send process measurements, configuration metadata or native app data. You can unsubscribe at any time." },
      { title: "Exports and this page", body: "Default snapshot exports omit names, paths, raw PIDs and bind addresses. Review anything before sharing it. App Health collects website page views and named clicks on the Mac download and GitHub source links, with basic referral and campaign information; it does not receive local process data. Hosting requests can include ordinary connection data. The AI footer opens a question about the public product only when clicked." }
    ] },
    support: { title: "Support", lede: "Report problems with version, macOS release and what you measured.", sections: [{ title: "Report an issue", body: "Use https://github.com/sarthakagrawal927/performancedaddy/issues/new. Include your app version, macOS version, the task that was slow, the recording duration and which readings were unavailable. Remove private paths and project details before attaching screenshots or exports." }] },
    terms: { title: "Terms", lede: "PerformanceDaddy is early-access software. Review process targets before stopping anything.", sections: [{ title: "Evidence and actions", body: "Measurements can be incomplete and do not guarantee a diagnosis. Review exact process targets before stopping anything; termination can interrupt work and lose unsaved data. Force stop cannot be undone." }, { title: "Terminal profiling", body: "Startup scripts are executable code, not a read-only configuration inspection. Use the separate opt-in experiment only when you understand those scripts and their possible side effects." }] },
    accessibility: { title: "Accessibility", lede: "Performance evidence should remain understandable without relying on color alone.", sections: [{ title: "Website", body: "This page includes semantic headings, keyboard-operable controls, visible focus, screenshot descriptions and reduced-motion support." }, { title: "Native app", body: "The app provides labelled controls, sortable headings and measurement help. Full VoiceOver and minimum-window qualification remains in progress; this page does not claim completed native accessibility acceptance." }] },
    testflight: { title: "Release status", lede: "PerformanceDaddy is distributed directly for Mac, not through TestFlight.", sections: [], testing: "Local processes and ports, RAM evidence, recognized local agents, reviewed stops and timed diagnostic recordings.", notIncluded: "Guaranteed root-cause identification, raw fan or GPU monitoring, remote port scans and cloud agent sessions." }
  },
  requiredHomeCopy: ["PerformanceDaddy", "free to download", "macOS 14+", "review"],
  prohibitedClaims: ["guaranteed root cause"]
};
