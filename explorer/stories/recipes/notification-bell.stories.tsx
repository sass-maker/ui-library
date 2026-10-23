import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/notification-bell';

const meta={title:"Feedback/Notification bell",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/notification-bell`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [items,setItems]=useState([{id:"1",title:"Explorer preview is ready",time:"Example notification"}]);return <div className="story-stack min-h-80"><div className="story-row"><C.NotificationBell notifications={items}/><Button variant="outline" onClick={()=>setItems([{id:String(Date.now()),title:"New example notification",time:"Just now"},...items])}>Add notification</Button></div></div>;}};
