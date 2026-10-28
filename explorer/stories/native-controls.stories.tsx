import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { NativeSelect, NativeDisclosure, NativeSummary, NativeDialog, NativeProgress, NativeInput } from "@saas-maker/ui/components/native-controls";

const meta = {
  id: "inputs-native-controls",
  title: "Atoms/Inputs/Native Controls",
  component: NativeSelect,
  parameters: { docs: { description: { component: "Native select, disclosure, dialog, progress and input controls retain browser form behavior and native refs. Use these when the native HTMLElement interface is required; existing Button, Input, Textarea and Table remain the normal React choices. The imperative createUiControl adapter uses the same library style contract." } } },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = {
  render: function Render() {
    const dialog = useRef<HTMLDialogElement>(null);
    return <div className="story-stack max-w-sm">
      <label className="story-label">Project status<NativeSelect className="mt-2" defaultValue="active"><option value="active">Active</option><option value="parked">Parked</option></NativeSelect></label>
      <label className="story-row"><NativeInput type="checkbox" defaultChecked /> Include archived evidence</label>
      <label className="story-label">Import evidence<NativeInput className="mt-2" type="file" accept=".json" /></label>
      <label className="story-label">Completed checks<NativeProgress className="mt-2" max={8} value={3} /></label>
      <NativeDisclosure><NativeSummary>Review evidence</NativeSummary><p className="px-3 pb-3 text-sm text-muted-foreground">Native disclosure content remains in the document.</p></NativeDisclosure>
      <Button variant="outline" onClick={() => dialog.current?.showModal()}>Open native dialog</Button>
      <NativeDialog ref={dialog} aria-labelledby="native-dialog-title"><form method="dialog" className="space-y-4"><h2 id="native-dialog-title" className="text-lg font-semibold">Review evidence</h2><p className="text-sm text-muted-foreground">Escape, focus management and form submission use the browser dialog.</p><Button value="done">Done</Button></form></NativeDialog>
    </div>;
  },
};
