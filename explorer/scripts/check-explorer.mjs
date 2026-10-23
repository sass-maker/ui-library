import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]))).flat();}
const storyFiles=(await files(path.join(root,'explorer/stories'))).filter(file=>file.endsWith('.stories.tsx'));
const stories=(await Promise.all(storyFiles.map(file=>readFile(file,'utf8')))).join('\n');
const missing=[];let modules=0;
for(const category of ['components','recipes','effects','blocks','molecules','organisms']){
 for(const file of await readdir(path.join(root,'packages/ui/src',category))){
  if(!file.endsWith('.tsx')||file==='upload-types.tsx')continue;
  modules++;
  const module=`@saas-maker/ui/${category}/${file.slice(0,-4)}`;
  if(!stories.includes(module))missing.push(module);
 }
}
if(missing.length)throw new Error(`Missing explorer examples:\n${missing.join('\n')}`);
const upstream=JSON.parse(await readFile(path.join(root,'packages/ui/upstream.json'),'utf8'));
const entries=Array.isArray(upstream)?upstream:upstream.components;
if(entries)for(const entry of entries)if(entry.file)await readFile(path.join(root,entry.file),'utf8');
console.log(`${modules} UI modules covered by ${storyFiles.length} story files.`);
if(process.argv.includes('--built')){
 const index=JSON.parse(await readFile(path.join(root,'explorer/storybook-static/index.json'),'utf8'));
 const entries=Object.values(index.entries);
 const count=entries.filter(entry=>entry.type==='story').length;
 if(count<storyFiles.length)throw new Error('Built story index lost examples.');
 console.log(`${count} built stories; ${entries.filter(entry=>entry.type==='docs').length} guides.`);
}
