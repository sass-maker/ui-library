export type StudioLink = { label: string; href: string; id?: string };
export type StudioProject = { id: string; name: string; url: string };
/** ReactNode props become escaped text in the framework-free build. */
export interface StudioFooterProps {
  product: string;
  url: string;
  summary?: string;
  cta?: { label: string; href: string };
  groups?: { title: string; links: { label: string; href: string }[] }[];
  art?: { src: string; alt: string; position?: string; width?: number; height?: number; credit?: string; creditHref?: string };
  feedbackKey?: string;
  subscribeKey?: string;
  catalogId?: string;
  capture?: "newsletter" | "waitlist" | false;
  studio?: StudioLink[];
  legal?: string;
  privacyUrl?: string;
  artMode?: "panel" | "scene";
  wordmark?: "stack" | "fill" | "poster";
  variant?: "studio" | "gallery";
  mark?: string;
  className?: string;
  projects?: StudioProject[];
  studioLimit?: number;
  studioFromProjects?: boolean | string;
  ref?: string;
}
export function renderStudioFooterHtml(props: StudioFooterProps): string;
export function studioFromProjects(
  projects: unknown,
  options?: { current?: string; limit?: number },
): StudioLink[];
export function withRef(href: string, ref?: string): string;
export const defaultStudio: StudioLink[];
export const studioProjectsFeed: string;
export const studioProjectsPage: string;
