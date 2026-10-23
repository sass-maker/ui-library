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

const meta = { component: ProjectOverview, title: "Organisms/Workspaces/Project overview", parameters: { docs: { description: { component: "Import from `@saas-maker/ui/organisms/project-overview`. A complete section composed from shared molecules and atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Overview: Story = { parameters: { docs: { source: { code: sourceSnippets.ProjectOverviewExample, type: "code", language: "tsx" } } }, render: () => <div className="w-full space-y-4"><ProjectOverviewExample /><p className="story-caption">Illustrative review-workspace data. Toggle the checklist to see the composed progress state.</p></div> };
