import type { LibraryFile } from "@saas-maker/ui/molecules/file-card";
import type { MetricCardProps } from "@saas-maker/ui/molecules/metric-card";
import type { ActivityEntry } from "@saas-maker/ui/molecules/activity-item";
import type { InboxMessage } from "@saas-maker/ui/organisms/notification-inbox";
import type { ProjectTask } from "@saas-maker/ui/organisms/project-overview";
import type { WorkspacePreferences } from "@saas-maker/ui/organisms/workspace-settings";

// All people, activity and metrics below are illustrative explorer fixtures.
export const sampleFiles: LibraryFile[] = [
  { id: "coast", name: "The long way home.webp", kind: "image", size: "284 KB", updated: "Today", preview: "./demo/kith/coastal-walk-v2.webp", collection: "Artwork" },
  { id: "memory", name: "A table full of memories.webp", kind: "image", size: "392 KB", updated: "Today", preview: "./demo/kith/memory-table-v2.webp", collection: "Artwork" },
  { id: "book", name: "Stories worth keeping.webp", kind: "image", size: "216 KB", updated: "Yesterday", preview: "./demo/kith/book-stage.webp", collection: "Brand" },
  { id: "sky", name: "A little constellation.webp", kind: "image", size: "168 KB", updated: "Yesterday", preview: "./demo/kith/constellation.webp", previewFit: "contain", collection: "Brand" },
  { id: "notes", name: "Release notes.md", kind: "document", size: "4 KB", updated: "Oct 21", collection: "Documents" },
  { id: "brief", name: "The next chapter.pdf", kind: "document", size: "128 KB", updated: "Oct 20", collection: "Documents" },
];
export const sampleTasks: ProjectTask[] = [
  { id: "coast", title: "Approve the coastal cover", detail: "Check the crop and the room around the two walkers.", complete: false },
  { id: "memory", title: "Review the memory table", detail: "Keep the photograph and book in the frame.", complete: false },
  { id: "sky", title: "Check the constellation screen", detail: "Show the whole app screen, with readable edges.", complete: false },
  { id: "notes", title: "Proof the release notes", detail: "Read the final copy before the handoff.", complete: false },
];
export const sampleActivity: ActivityEntry[] = [
  { id: "a", kind: "completed", actor: "Maya", action: "completed", subject: "the empty-state review", time: "12 minutes ago", dateTime: "2026-10-23T10:48:00Z" },
  { id: "b", kind: "upload", actor: "You", action: "added", subject: "Kith photography", time: "38 minutes ago", dateTime: "2026-10-23T10:22:00Z" },
  { id: "c", kind: "comment", actor: "Arjun", action: "left a note on", subject: "the upload flow", time: "1 hour ago", dateTime: "2026-10-23T10:00:00Z" },
  { id: "d", kind: "member", actor: "Leah", action: "joined", subject: "the workspace", time: "Yesterday", dateTime: "2026-10-22T09:00:00Z" },
];
export const samplePreferences: WorkspacePreferences = { name: "Kith Studio", email: "hello@example.com", releaseNotifications: true, weeklyDigest: false, securityAlerts: true };
export const sampleMessages: InboxMessage[] = [
  { id: "review", sender: "Maya Chen", initials: "MC", subject: "The small things are coming together", preview: "The release artwork is ready for a final look.", body: "Hey team,\n\nThe coastal cover has the quieter crop we discussed. Please check the space around the walkers and the way the book sits in the memory-table artwork.\n\nCould we take a look at those before Friday’s review? Everything else is ready for another pair of eyes.\n\nThanks,\nMaya", time: "12 min", read: false },
  { id: "assets", sender: "Arjun Patel", initials: "AP", subject: "A few new images for Kith", preview: "The coastal walk and memory table are ready.", body: "The new illustrations are in the asset library.\n\nThere’s a quieter crop for the coastal walk and a warmer version of the memory table. Both have room for the heading without losing the focal point.\n\nLet me know which direction feels right.", time: "38 min", read: false },
  { id: "welcome", sender: "Leah Martin", initials: "LM", subject: "A good place to start", preview: "A few thoughts on the shared workspace.", body: "Happy to be here.\n\nI’m gathering the release notes and checking the final image crops today. I’ll share feedback here before the handoff.\n\nLooking forward to making this feel like one system.", time: "1 hr", read: true },
  { id: "weekly", sender: "Workspace digest", initials: "WS", subject: "A week of small improvements", preview: "What changed, what’s ready, and what comes next.", body: "This week’s illustrative workspace summary:\n\n• Coastal and memory-table artwork added\n• App screens collected\n• Release notes ready for proofreading\n\nOpen the project overview to work through the remaining checklist.", time: "Yesterday", read: true },
];

export const sampleMetrics: MetricCardProps[] = [
  { label: "Release files", value: String(sampleFiles.length), detail: "In the shared library" },
  { label: "Checklist", value: `${sampleTasks.filter(task => task.complete).length}/${sampleTasks.length}`, detail: "Steps completed" },
  { label: "Unread", value: String(sampleMessages.filter(message => !message.read).length), detail: "Inbox messages" },
];
