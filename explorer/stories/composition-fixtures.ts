import type { LibraryFile } from "@saas-maker/ui/molecules/file-card";
import type { MetricCardProps } from "@saas-maker/ui/molecules/metric-card";
import type { ActivityEntry } from "@saas-maker/ui/molecules/activity-item";
import type { InboxMessage } from "@saas-maker/ui/organisms/notification-inbox";
import type { ProjectTask } from "@saas-maker/ui/organisms/project-overview";
import type { WorkspacePreferences } from "@saas-maker/ui/organisms/workspace-settings";

// All people, activity and metrics below are illustrative explorer fixtures.
export const sampleFiles: LibraryFile[] = [
  { id: "coast", name: "The long way home.webp", kind: "image", size: "284 KB", updated: "Today", preview: "./demo/kith/coastal-walk-v2.webp", collection: "Photography" },
  { id: "memory", name: "A table full of memories.webp", kind: "image", size: "392 KB", updated: "Today", preview: "./demo/kith/memory-table-v2.webp", collection: "Photography" },
  { id: "book", name: "Stories worth keeping.webp", kind: "image", size: "216 KB", updated: "Yesterday", preview: "./demo/kith/book-stage.webp", collection: "Brand" },
  { id: "sky", name: "A little constellation.webp", kind: "image", size: "168 KB", updated: "Yesterday", preview: "./demo/kith/constellation.webp", collection: "Brand" },
  { id: "notes", name: "Release notes.md", kind: "document", size: "4 KB", updated: "Oct 21", collection: "Documents" },
  { id: "brief", name: "The next chapter.pdf", kind: "document", size: "128 KB", updated: "Oct 20", collection: "Documents" },
];
export const sampleMetrics: MetricCardProps[] = [
  { label: "Components reviewed", value: "24", detail: "of 32 in this example workspace", trend: { direction: "up", label: "8 reviewed this week" }, series: [2,4,3,7,6,11,12,15,14,19,24] },
  { label: "Open feedback", value: "07", detail: "4 details · 3 interactions", trend: { direction: "down", label: "3 resolved since Monday" }, series: [18,17,19,15,14,14,11,12,9,8,7] },
  { label: "Ready for handoff", value: "75%", detail: "The next review is Friday", trend: { direction: "up", label: "25 points above last week" }, series: [10,15,15,27,34,36,49,52,61,68,75] },
];
export const sampleTasks: ProjectTask[] = [
  { id: "tokens", title: "Set the foundation", detail: "Colors, type, spacing, and the things we’ll share.", complete: true },
  { id: "states", title: "Give every state a little care", detail: "Loading, empty, error, and the moment it works.", complete: true },
  { id: "motion", title: "Make the transitions feel right", detail: "Try interruptions, quick changes, and reduced motion.", complete: false },
  { id: "review", title: "Take one last look together", detail: "A real review at phone, tablet, and desktop widths.", complete: false },
];
export const sampleActivity: ActivityEntry[] = [
  { id: "a", kind: "completed", actor: "Maya", action: "completed", subject: "the empty-state review", time: "12 minutes ago", dateTime: "2026-10-23T10:48:00Z" },
  { id: "b", kind: "upload", actor: "You", action: "added", subject: "Kith photography", time: "38 minutes ago", dateTime: "2026-10-23T10:22:00Z" },
  { id: "c", kind: "comment", actor: "Arjun", action: "left a note on", subject: "the upload flow", time: "1 hour ago", dateTime: "2026-10-23T10:00:00Z" },
  { id: "d", kind: "member", actor: "Leah", action: "joined", subject: "the workspace", time: "Yesterday", dateTime: "2026-10-22T09:00:00Z" },
];
export const samplePreferences: WorkspacePreferences = { name: "Kith Studio", email: "hello@example.com", releaseNotifications: true, weeklyDigest: false, securityAlerts: true };
export const sampleMessages: InboxMessage[] = [
  { id: "review", sender: "Maya Chen", initials: "MC", subject: "The small things are coming together", preview: "I left a few notes on the latest component review.", body: "Hey team,\n\nThe new empty states feel much calmer. I left two notes on the upload flow: keeping the filename visible while saving, and making the retry action a little clearer.\n\nCould we take a look at those before Friday’s review? Everything else is ready for another pair of eyes.\n\nThanks,\nMaya", time: "12 min", read: false },
  { id: "assets", sender: "Arjun Patel", initials: "AP", subject: "A few new images for Kith", preview: "The coastal walk and memory table are ready.", body: "The new photography is in the asset library.\n\nThere’s a quieter crop for the coastal walk and a warmer version of the memory table. Both have room for the heading without losing the focal point.\n\nLet me know which direction feels right.", time: "38 min", read: false },
  { id: "welcome", sender: "Leah Martin", initials: "LM", subject: "A good place to start", preview: "A few thoughts on the shared workspace.", body: "Happy to be here.\n\nI’m starting with the foundations today: type, spacing, and the components we touch most often. I’ll share a small set of examples before moving into the larger compositions.\n\nLooking forward to making this feel like one system.", time: "1 hr", read: true },
  { id: "weekly", sender: "Workspace digest", initials: "WS", subject: "A week of small improvements", preview: "What changed, what’s ready, and what comes next.", body: "This week’s illustrative workspace summary:\n\n• Foundation tokens reviewed\n• Empty and error states added\n• The next motion review is ready\n\nOpen the project overview to work through the remaining checklist.", time: "Yesterday", read: true },
];
