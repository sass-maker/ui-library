import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { Badge } from "@saas-maker/ui/atoms/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@saas-maker/ui/molecules/dialog";
import { SearchField } from "@saas-maker/ui/molecules/search-field";
import { InputField } from "@saas-maker/ui/molecules/input-field";
import { SettingRow } from "@saas-maker/ui/molecules/setting-row";
import { MetricCard } from "@saas-maker/ui/molecules/metric-card";
import { FileCard } from "@saas-maker/ui/molecules/file-card";
import { ActivityItem } from "@saas-maker/ui/molecules/activity-item";
import { sampleActivity, sampleFiles, sampleMetrics } from "../composition-fixtures";


const meta = { title: "Molecules/Compositions/File card", parameters: { docs: { description: { component: "A file preview, filename and metadata with selectable state and contextual actions in grid or list layouts.\n\nImport from `@saas-maker/ui/molecules/file-card`. A focused composition of shared atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Files: Story = { render: function Render() {
  const [selected, setSelected] = useState<string[]>([]);
  const [opened, setOpened] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const file = sampleFiles.find(file => file.id === opened);
  return <div className="w-full max-w-3xl space-y-4"><div className="grid gap-4 sm:grid-cols-3">{sampleFiles.slice(0,3).map(file => <FileCard key={file.id} file={file} selected={selected.includes(file.id)} onSelectedChange={checked => setSelected(current => checked ? [...current, file.id] : current.filter(id => id !== file.id))} onOpen={trigger => { opener.current = trigger; setOpened(file.id); }} />)}</div><p role="status" className="story-caption">{selected.length} selected. Selection, preview, and file actions are separate interactions.</p>
    <Dialog open={!!file} onOpenChange={open => { if (!open) setOpened(null); }}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus(); }}><DialogHeader><DialogTitle>{file?.name}</DialogTitle><DialogDescription>{file?.collection} · {file?.size}</DialogDescription></DialogHeader>{file?.preview && <img src={file.preview} alt={file.name} className="max-h-[60dvh] w-full rounded-lg object-contain" />}</DialogContent></Dialog>
  </div>;
} };

