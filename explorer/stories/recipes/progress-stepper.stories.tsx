import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/progress-stepper';

const meta={title:"Feedback/Progress stepper",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/progress-stepper`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [step,setStep]=useState(0);return <div className="story-stack"><C.ProgressStepper steps={["Details","Review","Ready"]} current={step}/><div className="story-row"><Button variant="outline" disabled={step===0} onClick={()=>setStep(step-1)}>Back</Button><Button disabled={step===2} onClick={()=>setStep(step+1)}>Continue</Button></div></div>;}};
