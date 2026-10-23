import type {Meta,StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {ConsolePage} from '@saas-maker/templates/console-page';
import {GalleryPage} from '@saas-maker/templates/gallery-page';
import {WorkbenchPage} from '@saas-maker/templates/workbench-page';
import {galleryContent,workbenchContent} from '@saas-maker/templates/schema';
import {Button} from '@saas-maker/ui/components/button';
import {DataTable} from '@saas-maker/ui/components/data-table';
import {FilterBar,FilterSearch} from '@saas-maker/ui/blocks/filter-bar';
import {SearchPalette} from '@saas-maker/ui/blocks/search-palette';
import {Box} from 'lucide-react';
import kith from '../../site/src/content/kith.json';
import codevetter from '../../site/src/content/codevetter.json';
const meta={title:'Templates/Console',parameters:{layout:'fullscreen',docs:{description:{component:'Complete compositions using the shipped templates. Landing pages use existing repository content snapshots, with local assets. Follow product links to verify current availability.'}}}} satisfies Meta;export default meta;
const rows=[{name:'Button',kind:'Component',path:'components/button'},{name:'Dialog',kind:'Component',path:'components/dialog'},{name:'Kanban board',kind:'Interaction',path:'recipes/kanban-board'},{name:'Globe',kind:'Effect',path:'effects/globe'}];
export const Workspace:StoryObj={render:function Render(){const [query,setQuery]=useState('');const [selected,setSelected]=useState('');return <ConsolePage brand={{name:'Fleet UI',mark:<Box className="size-5"/>,href:'#'}} title="Library" description="Explore the shared source. This workspace uses local example data." nav={[{title:'Library',items:[{label:'All modules',href:'#',active:true,count:rows.length},{label:'Source',href:'https://github.com/sass-maker/ui-library',external:true}]}]} breadcrumbs={[{label:'Fleet'},{label:'UI library'}]} actions={<Button asChild variant="outline"><a href="https://github.com/sass-maker/ui-library">View source</a></Button>} sidebarFooter={<span className="text-xs text-muted-foreground">Example workspace</span>}><div className="space-y-6"><FilterBar><FilterSearch value={query} onChange={setQuery} placeholder="Filter modules…"/></FilterBar><DataTable label="UI module examples" data={rows.filter(row=>row.name.toLowerCase().includes(query.toLowerCase()))} columns={[{id:'name',header:'Name',value:row=>row.name},{id:'kind',header:'Kind',value:row=>row.kind},{id:'path',header:'Import path',value:row=>row.path}]} getRowId={row=>row.path}/><p role="status" className="text-sm text-muted-foreground">{selected}</p></div><SearchPalette sources={[{id:'modules',label:'Modules',search:q=>rows.filter(row=>row.name.toLowerCase().includes(q.toLowerCase())).map(row=>({id:row.path,title:row.name,subtitle:row.kind}))}]} onSelect={row=>setSelected(`Selected ${row.title}`)}/></ConsolePage>;}};
// Keep asset requests relative so the same stories work under GitHub Pages /ui-library/.
function relativeAssets<T>(data:T):T{return JSON.parse(JSON.stringify(data).replaceAll('"/demo/','"./demo/'));}
export const Gallery:StoryObj={name:'Gallery · Kith',render:()=> <GalleryPage content={galleryContent.parse(relativeAssets(kith))}/>};
export const Workbench:StoryObj={name:'Workbench · CodeVetter',render:()=> <WorkbenchPage content={workbenchContent.parse(relativeAssets(codevetter))}/>};
