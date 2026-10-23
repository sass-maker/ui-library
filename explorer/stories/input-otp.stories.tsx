import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/input-otp";

const meta = { id: "inputs-one-time-code", title: "Molecules/Inputs/One-time code", component: C.InputOTP, parameters: {"docs": {"description": {"component": "A segmented code entry that keeps native text editing and a single accessible input.\n\nImport from `@saas-maker/ui/molecules/input-otp`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [code,setCode]=useState("");return <div className="story-stack"><label className="story-label" id="code-label">verification code</label><C.InputOTP aria-labelledby="code-label" maxLength={6} value={code} onChange={setCode}><C.InputOTPGroup>{[0,1,2].map(index => <C.InputOTPSlot key={index} index={index}/>)}</C.InputOTPGroup><C.InputOTPSeparator/><C.InputOTPGroup>{[3,4,5].map(index => <C.InputOTPSlot key={index} index={index}/>)}</C.InputOTPGroup></C.InputOTP><p className="story-caption">Example only. Paste a six-digit code; nothing is sent.</p></div>; } };
