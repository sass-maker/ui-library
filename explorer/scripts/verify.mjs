import { spawnSync } from 'node:child_process';
const commands = process.argv.includes('--build-only') ? [['storybook:check']] : [['check']];
commands.push(['tokens:build'],['storybook:build'],['check:explorer','--built'],['exec','shadcn','build','--output','explorer/storybook-static/r']);
for (const args of commands) {
 const result=spawnSync('pnpm',args,{stdio:'inherit',shell:false});
 if(result.status!==0)process.exit(result.status??1);
}
// Run locally on macOS; the web workflow runs the platform-independent steps above.
if(process.platform==='darwin' && process.argv.includes('--native')){
 const result=spawnSync('swift',['build'],{stdio:'inherit',shell:false});
 if(result.status!==0)process.exit(result.status??1);
}
