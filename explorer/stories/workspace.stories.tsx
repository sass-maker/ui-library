import type { Meta, StoryObj } from "@storybook/react-vite";
import { sourceSnippets } from "virtual:fleet-example-source";
import { CopyButton } from "@saas-maker/ui/recipes/copy-button";
import { CompleteWorkspaceExample, WorkspaceFirstRun } from "./workspace-examples";

const meta = { title: "Start here/Workspace", tags: ["!autodocs"], parameters: { layout: "fullscreen", docs: { description: { component: "One connected local workspace. Shared atoms, molecules and organisms compose navigation, search, files, messages, a release checklist and recoverable settings. All data is illustrative; no account, upload or server is involved." } } } } satisfies Meta;
export default meta;

export const CompleteWorkflow: StoryObj = {
  parameters: { docs: { source: { code: sourceSnippets.CompleteWorkspaceExample, type: "code", language: "tsx" } } },
  render: () => <CompleteWorkspaceExample sourceAction={<CopyButton value={sourceSnippets.CompleteWorkspaceExample} label="Copy complete workspace source" className="[&_button]:size-11" />} />,
};

export const FirstRunToWorkspace: StoryObj = {
  parameters: { docs: { source: { code: sourceSnippets.WorkspaceFirstRun, type: "code", language: "tsx" } } },
  render: () => <WorkspaceFirstRun sourceAction={<CopyButton value={sourceSnippets.WorkspaceFirstRun} label="Copy first-run workflow source" className="[&_button]:size-11" />} />,
};
