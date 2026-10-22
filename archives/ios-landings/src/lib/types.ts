export type Chapter = {
  name: string;
  title: string;
  copy: string;
  image: string;
  alt: string;
  width?: number;
  height?: number;
};

export type Faq = { question: string; answer: string };
/** `paragraphs` follow `body` as further paragraphs in the same section. */
export type LegalSection = {
  title: string;
  body: string;
  paragraphs?: string[];
  links?: { label: string; href: string }[];
};
export type LegalPage = { title: string; lede: string; sections: LegalSection[] };
export type StoryImage = { src: string; alt: string; width: number; height: number };

export type SiteConfig = {
  name: string;
  url: string;
  tagline: string;
  headline: [string, string];
  lede: string;
  seoDescription?: string;
  kicker: string;
  summary: string;
  status: string;
  platforms: string[];
  themeColor: string;
  mark: string;
  artwork?: string;
  socialImage: string;
  tokens: {
    paper: string;
    field: string;
    ink: string;
    inkSoft: string;
    inkFaint: string;
    accent: string;
    accentDark: string;
    accentSoft: string;
    lanternA: string;
    lanternB: string;
    lanternC: string;
    blush: string;
    inkOnDark: string;
    inkOnAccent?: string;
  };
  colorScheme: "light" | "dark";
  device?: "phone" | "desktop";
  hero: { image: string; alt: string; caption: string; width?: number; height?: number; kind?: "screenshot" | "artwork" | "historical" };
  illustration?: { src: string; alt: string };
  /** A product-owned editorial scene, separate from screenshots and app artwork. */
  sceneArtwork?: StoryImage & { caption: string };
  /** Optional product-owned ingredients for the shared Living Memory Book system. */
  story?: {
    ink: string;
    paper?: StoryImage;
    cover: StoryImage;
    moment: StoryImage & { caption: string };
    scene: StoryImage;
    note: string;
  };
  gallery: { src: string; alt: string; width?: number; height?: number }[];
  galleryTitle?: [string, string];
  applicationCategory: string;
  availability: "unreleased" | "testflight" | "app-store" | "web-app" | "successor";
  newsletterCapture?: boolean;
  appStoreUrl?: string;
  appStoreId?: string;
  appUrl?: string;
  appCtaLabel?: string;
  /**
   * App Health event names for the landing hero CTAs. When set, the hero links
   * carry `data-cta` and the landing tracks clicks, flushing before same-tab
   * navigation.
   */
  heroCtaEvents?: { primary: string; overview: string };
  macDownloadUrl?: string;
  macDownloadLabel?: string;
  betaNote: string;
  tension: { statement: string; title: string; copy: string };
  chaptersKicker: string;
  chaptersTitle: string;
  chaptersLede: string;
  chapters: Chapter[];
  fit: { kicker: string; title: string; yes: string; no: string };
  privacy: { kicker: string; title: string; copy: string };
  faqs: Faq[];
  founder: { quote: string; credit: string; note: string };
  closingTitle: [string, string];
  footerFinePrint: string;
  capabilities: string[];
  boundaries: string[];
  /**
   * Override the generic "When to use this" lines in llms.txt. Without this a
   * product gets boilerplate derived from its tagline, which tells an agent
   * nothing it could not read off the page. State what the product is actually
   * good for and what it is not.
   */
  agentFit?: { bestFit: string[]; notAFit: string[] };
  /** Local commands worth exposing to an agent, rendered as a `## CLI` block. */
  agentCli?: string[];
  lastUpdated: string;
  legal: {
    privacy: LegalPage;
    support: LegalPage;
    terms: LegalPage;
    accessibility: LegalPage;
    testflight: LegalPage & { testing: string; notIncluded: string };
  };
  requiredHomeCopy: string[];
  prohibitedClaims: string[];
};
