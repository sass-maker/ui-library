import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Upload, RotateCcw } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { AssetLibrary } from "@saas-maker/ui/organisms/asset-library";
import { WorkspaceSettings } from "@saas-maker/ui/organisms/workspace-settings";
import { NotificationInbox } from "@saas-maker/ui/organisms/notification-inbox";
import { ProjectOverview } from "@saas-maker/ui/organisms/project-overview";
import { sampleFiles, samplePreferences, sampleMessages, sampleMetrics, sampleTasks, sampleActivity } from "../composition-fixtures";

import { AssetLibraryExample, ProjectOverviewExample } from "../workspace-examples";

const meta = { component: NotificationInbox, title: "Organisms/Workspaces/Notification inbox", parameters: { docs: { description: { component: "Import from `@saas-maker/ui/organisms/notification-inbox`. A complete section composed from shared molecules and atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Inbox: Story = { render: function Render() {
  const [messages, setMessages] = useState(sampleMessages);
  return <div className="w-full space-y-4"><NotificationInbox messages={messages} onReadChange={(ids, read) => setMessages(current => current.map(message => ids.includes(message.id) ? { ...message, read } : message))} />
    <p className="story-caption">Read and unread state is controlled by the story. On phones, the detail view replaces the list and provides a back action.</p></div>;
} };

export const InboxEmpty: Story = { render: () => <NotificationInbox messages={[]} onReadChange={() => {}} /> };

