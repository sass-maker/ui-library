import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Upload, RotateCcw } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { AssetLibrary } from "@saas-maker/ui/organisms/asset-library";
import { WorkspaceSettings } from "@saas-maker/ui/organisms/workspace-settings";
import { NotificationInbox } from "@saas-maker/ui/organisms/notification-inbox";
import { ProjectOverview } from "@saas-maker/ui/organisms/project-overview";
import { sampleFiles, samplePreferences, sampleMessages, sampleMetrics, sampleTasks, sampleActivity } from "./composition-fixtures";


export function AssetLibraryExample() {
  const [files, setFiles] = useState(sampleFiles);
  const input = useRef<HTMLInputElement>(null);
  return <div className="w-full space-y-4">
    <AssetLibrary state={{ kind: "ready", files }} onRemove={ids => setFiles(current => current.filter(file => !ids.includes(file.id)))}
      action={<><Button onClick={() => input.current?.click()}><Upload />Add files</Button><input ref={input} type="file" multiple className="sr-only" aria-label="Add local files" onChange={event => {
        const additions = Array.from(event.target.files ?? []).map((file, index) => ({ id: `local-${file.name}-${Date.now()}-${index}`, name: file.name, kind: "document" as const, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, updated: "Just now", collection: "Local files" }));
        setFiles(current => [...current, ...additions]); event.target.value = "";
      }} /></>} />
    <p className="story-caption flex flex-wrap items-center justify-between gap-3"><span>Explore collections, search, switch views, select files, and open a preview. Added files stay local.</span><Button variant="ghost" size="sm" onClick={() => setFiles(sampleFiles)}><RotateCcw />Reset example</Button></p>
  </div>;
}


export function ProjectOverviewExample() {
  const [tasks, setTasks] = useState(sampleTasks);
  return <ProjectOverview name="Kith · October release" description="Track the component review, handoff checklist, and team feedback." metrics={sampleMetrics} tasks={tasks} activity={sampleActivity}
    onTaskChange={(id, complete) => setTasks(current => current.map(task => task.id === id ? { ...task, complete } : task))} />;
}
