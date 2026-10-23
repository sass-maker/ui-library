import { sourceSnippets } from "virtual:fleet-example-source";
import { OnboardingContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/multi-step-form';

const meta={id: "interactions-multi-step-form", title: "Organisms/Patterns/Multi-step form",parameters:{docs:{description:{component:"Keep choices in place across steps and failed creation attempts. Completion awaits the application callback.\n\nImport from `@saas-maker/ui/recipes/multi-step-form`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [reject,setReject]=useState(false);return <div className="story-stack"><label className="story-row"><input type="checkbox" checked={reject} onChange={e=>setReject(e.target.checked)}/> Reject creation</label><C.MultiStepForm plans={[{id:"local",name:"Local",note:"Example workspace",price:"Free"},{id:"team",name:"Team",note:"Example team workspace",price:"Demo"}]} onCreate={async()=>{if(reject)throw new Error("Example request rejected. Your choices are preserved.");}}/><p className="story-caption">Demonstrates a local callback. No account is created.</p></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.OnboardingContext, type: "code", language: "tsx" } } }, render: () => <OnboardingContext /> };
