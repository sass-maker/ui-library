import { ProjectDetailsContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/morphing-button';

const meta={id: "interactions-morphing-button", title: "Molecules/Patterns/Morphing button",parameters:{docs:{description:{component:"An action that keeps focus while moving between idle, pending, success, and retry.\n\nImport from `@saas-maker/ui/recipes/morphing-button`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [fail,setFail]=useState(false); return <div className="story-stack"><label className="story-row"><input type="checkbox" checked={fail} onChange={e=>setFail(e.target.checked)}/> Reject save</label><C.MorphingButton onSave={async()=>{if(fail)throw new Error("Save rejected");}}/><p className="story-caption">Local promise only. Toggle rejection to inspect retry.</p></div>;}};

export const InContext: Story = { render: () => <ProjectDetailsContext /> };
