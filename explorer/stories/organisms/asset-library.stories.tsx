import { sourceSnippets } from "virtual:fleet-example-source";
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

const meta = { component: AssetLibrary, title: "Organisms/Workspaces/Asset library", parameters: { docs: { description: { component: "A searchable file library with collections, grid and list views, selection, previews and recoverable loading states.\n\nImport from `@saas-maker/ui/organisms/asset-library`. A complete section composed from shared molecules and atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Files: Story = { parameters: { docs: { source: { code: sourceSnippets.AssetLibraryExample, type: "code", language: "tsx" } } }, render: () => <AssetLibraryExample /> };

export const FilesLoading: Story = { render: () => <AssetLibrary state={{ kind: "loading" }} /> };

export const FilesEmpty: Story = { render: function Render() {
  const [files, setFiles] = useState<typeof sampleFiles>([]);
  return <AssetLibrary state={{ kind: "ready", files }} action={files.length
    ? <Button variant="outline" onClick={() => setFiles([])}><RotateCcw />Reset example</Button>
    : <Button onClick={() => setFiles(sampleFiles.slice(0, 1))}><Upload />Add example file</Button>} />;
} };

export const FilesError: Story = { render: function Render() { const [failed, setFailed] = useState(true); return <AssetLibrary state={failed ? { kind: "error", message: "The example connection was interrupted. Your files are still safe.", onRetry: () => setFailed(false) } : { kind: "ready", files: sampleFiles }} />; } };

