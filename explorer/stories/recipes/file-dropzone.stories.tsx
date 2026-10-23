import { UploadContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/file-dropzone';

const meta={id: "interactions-file-dropzone", title: "Molecules/Patterns/File dropzone",parameters:{docs:{description:{component:"Keep selection, upload progress, cancellation, failure, and retry distinct. The application supplies the transport.\n\nImport from `@saas-maker/ui/recipes/file-dropzone`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [files,setFiles]=useState<string[]>([]);return <div className="story-stack"><C.FileDropzone accept=".json,.txt,.md" maxSize={2*1024*1024} onFiles={files=>setFiles(files.map(file=>file.name))} hint="JSON, text or Markdown · up to 2 MB per file"/><p className="story-caption">Selection only. No file contents are transmitted.</p><output>{files.join(", ")}</output></div>;}};

export const UploadLifecycle:Story={render:function Render(){
 const job=useRef<{resolve:()=>void;reject:(error:Error)=>void;progress:(percent:number)=>void}|null>(null);
 const [pending,setPending]=useState(false);
 return <div className="story-stack"><C.FileDropzone multiple={false} onUpload={async(file,{signal,onProgress})=>{setPending(true);try{await new Promise<void>((resolve,reject)=>{job.current={resolve,reject,progress:onProgress};signal.addEventListener('abort',()=>reject(new Error('Cancelled')),{once:true});});}finally{job.current=null;setPending(false);}}}/><div className="story-row"><Button disabled={!pending} variant="outline" onClick={()=>job.current?.progress(50)}>Report 50%</Button><Button disabled={!pending} onClick={()=>job.current?.resolve()}>Resolve upload</Button><Button disabled={!pending} variant="destructive" onClick={()=>job.current?.reject(new Error('Example failure'))}>Reject upload</Button></div><p className="story-caption">Manual transport harness. Resolve or reject the actual pending promise. Nothing is sent over the network.</p></div>;
}};

export const InContext: Story = { render: () => <UploadContext /> };
