import type { Meta, StoryObj } from '@storybook/react-vite';
import { sourceSnippets } from 'virtual:fleet-example-source';
import { ModuleCatalogExample } from './module-catalog-examples';
import { GalleryPage } from '@saas-maker/templates/gallery-page';
import { WorkbenchPage } from '@saas-maker/templates/workbench-page';
import { galleryContent, workbenchContent } from '@saas-maker/templates/schema';
import kith from '../../site/src/content/kith.json';
import codevetter from '../../site/src/content/codevetter.json';
const meta={title:'Templates/Console',parameters:{layout:'fullscreen',docs:{description:{component:'Complete compositions using the shipped templates. Landing pages use existing repository content snapshots, with local assets. Follow product links to verify current availability.'}}}} satisfies Meta;export default meta;
export const Workspace: StoryObj = {
  parameters: { docs: { source: { code: sourceSnippets.ModuleCatalogExample, type: 'code', language: 'tsx' } } },
  render: () => <ModuleCatalogExample />,
};
// Keep asset requests relative so the same stories work under GitHub Pages /ui-library/.
function relativeAssets<T>(data:T):T{return JSON.parse(JSON.stringify(data).replaceAll('"/demo/','"./demo/'));}
export const Gallery:StoryObj={name:'Gallery · Kith',render:()=> <GalleryPage assetBase="./" content={galleryContent.parse(relativeAssets(kith))}/>};
export const Workbench:StoryObj={name:'Workbench · CodeVetter',render:()=> <WorkbenchPage assetBase="./" content={workbenchContent.parse(relativeAssets(codevetter))}/>};
