import { StepperContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/progress-stepper';

const meta={id: "feedback-progress-stepper", title: "Molecules/Patterns/Progress stepper",parameters:{docs:{description:{component:"Show where a multi-step task stands without making the progress indicator another task to understand.\n\nImport from `@saas-maker/ui/recipes/progress-stepper`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [step,setStep]=useState(0);return <div className="story-stack"><C.ProgressStepper steps={["Details","Review","Ready"]} current={step}/><div className="story-row"><Button variant="outline" disabled={step===0} onClick={()=>setStep(step-1)}>Back</Button><Button disabled={step===2} onClick={()=>setStep(step+1)}>Continue</Button></div></div>;}};

export const InContext: Story = { render: () => <StepperContext /> };
