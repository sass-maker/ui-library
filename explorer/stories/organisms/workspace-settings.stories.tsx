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

const meta = { component: WorkspaceSettings, title: "Organisms/Workspaces/Workspace settings", parameters: { docs: { description: { component: "Import from `@saas-maker/ui/organisms/workspace-settings`. A complete section composed from shared molecules and atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Settings: Story = { render: function Render() {
  const [reject, setReject] = useState(false);
  return <div className="w-full space-y-5"><WorkspaceSettings initial={samplePreferences} onSave={async () => { await new Promise(resolve => setTimeout(resolve, 900)); if (reject) throw new Error("The example connection dropped. Your changes are still here."); }} />
    <label className="story-caption flex items-center gap-2"><input type="checkbox" checked={reject} onChange={event => setReject(event.target.checked)} />Make the next save fail to inspect recovery</label></div>;
} };

