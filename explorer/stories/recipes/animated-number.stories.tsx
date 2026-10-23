import { SegmentedContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/animated-number';

const meta={id: "motion-animated-number", title: "Molecules/Motion/Animated number",parameters:{docs:{description:{component:"Connect changing numerical values without shifting the surrounding text.\n\nImport from `@saas-maker/ui/recipes/animated-number`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [value,setValue]=useState(24);return <div className="story-stack"><C.AnimatedNumber value={value} className="text-5xl font-semibold tabular-nums"/><div className="story-row"><Button variant="outline" onClick={()=>setValue(Math.max(0,value-1))}>Decrease</Button><Button onClick={()=>setValue(value+1)}>Increase</Button></div></div>;}};

export const InContext: Story = { render: () => <SegmentedContext /> };
