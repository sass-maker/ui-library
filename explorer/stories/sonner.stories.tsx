import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/sonner";
import { toast } from "sonner";
const meta = { id: "feedback-toast", title: "Molecules/Feedback/Toast", component: C.Toaster, parameters: {"docs": {"description": {"component": "Transient feedback for completed actions, progress and failures, rendered through a shared toast host.\n\nImport from `@saas-maker/ui/components/sonner`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack"><C.Toaster/><div className="story-row"><Button variant="outline" onClick={()=>toast.success("Example saved")}>Success toast</Button><Button variant="outline" onClick={()=>toast.error("Could not save",{description:"Your draft is retained."})}>Error toast</Button><Button variant="outline" onClick={()=>toast("Example removed",{action:{label:"Undo",onClick:()=>toast.success("Example restored")}})}>Undo toast</Button><Button variant="outline" onClick={()=>toast.promise(new Promise(resolve=>setTimeout(resolve,800)),{loading:"Previewing pending state…",success:"Preview complete",error:"Preview failed"})}>Promise toast</Button></div><p className="story-caption">Local preview only; no product data changes.</p></div>; } };
