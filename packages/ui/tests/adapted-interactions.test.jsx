// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FileDropzone } from "../src/recipes/file-dropzone";
import { MorphingButton } from "../src/recipes/morphing-button";
import { CodeComparison } from "../src/effects/code-comparison";
import {Slider} from "../src/components/slider";
import {Calendar} from "../src/components/calendar";
import {TextMorph} from "../src/recipes/text-morph";
import {HoldToDelete} from "../src/recipes/hold-to-delete";
import { Disclosure, DisclosureTrigger, DisclosureContent } from "../src/recipes/disclosure";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const roots=[];
function mount(node){const container=document.createElement('div');document.body.append(container);const root=createRoot(container);roots.push({root,container});act(()=>root.render(node));return container;}
function pick(container,files){const input=container.querySelector('input[type=file]');Object.defineProperty(input,'files',{value:files,configurable:true});act(()=>input.dispatchEvent(new Event('change',{bubbles:true})));}
beforeEach(()=>{vi.stubGlobal('matchMedia',()=>({matches:true,addEventListener(){},removeEventListener(){}}));});
afterEach(()=>{for(const {root,container} of roots.splice(0)){act(()=>root.unmount());container.remove();}vi.useRealTimers();vi.unstubAllGlobals();});

describe('adapted upload contract',()=>{
 it('keeps selection local without inventing completion',()=>{const selected=vi.fn();const container=mount(<FileDropzone onFiles={selected}/>);pick(container,[new File(['hello'],'notes.txt')]);expect(selected).toHaveBeenCalledOnce();expect(container.textContent).toContain('selected');expect(container.textContent).not.toContain('uploaded');expect(container.querySelector('progress')).toBeNull();});
 it('waits for the transport, clamps progress, and permits retry after failure',async()=>{let resolve,reject,context;const upload=vi.fn((file,ctx)=>{context=ctx;return new Promise((yes,no)=>{resolve=yes;reject=no;});});const container=mount(<FileDropzone onUpload={upload}/>);pick(container,[new File(['hello'],'notes.txt')]);expect(container.textContent).toContain('uploading');act(()=>context.onProgress(180));expect(container.querySelector('progress').value).toBe(100);expect(container.textContent).not.toContain('uploaded');await act(async()=>reject(new Error('offline')));expect(container.textContent).toContain('upload failed');await act(async()=>container.querySelector('[aria-label="Retry notes.txt"]').click());expect(upload).toHaveBeenCalledTimes(2);await act(async()=>resolve());expect(container.textContent).toContain('uploaded');});
 it('aborts a removed job and ignores its late completion',async()=>{let resolve,signal;const container=mount(<FileDropzone onUpload={(file,ctx)=>{signal=ctx.signal;return new Promise(yes=>{resolve=yes;});}}/>);pick(container,[new File(['hello'],'notes.txt')]);act(()=>container.querySelector('[aria-label="Cancel notes.txt"]').click());expect(signal.aborted).toBe(true);await act(async()=>resolve());expect(container.querySelector('[role=status]').textContent).toBe('Removed notes.txt');expect(container.textContent).not.toContain('Uploaded');});
 it('rejects invalid types and oversized files before transport',()=>{const upload=vi.fn();const container=mount(<FileDropzone accept=".json" maxSize={3} onUpload={upload}/>);pick(container,[new File(['large'],'data.json'),new File(['x'],'notes.txt')]);expect(upload).not.toHaveBeenCalled();expect(container.querySelector('[role=alert]')).not.toBeNull();});
});
describe('adapted display and action semantics',()=>{
 it('renders untrusted code as text',()=>{const html=renderToStaticMarkup(<CodeComparison beforeCode={'<img src=x onerror="alert(1)">'} afterCode={'<script>alert(1)</script>'}/>);const node=document.createElement('div');node.innerHTML=html;expect(node.querySelector('img,script')).toBeNull();expect(node.textContent).toContain('<script>alert(1)</script>');});
 it('does not report a rejected save as success and retries',async()=>{let resolve,reject;const save=vi.fn(()=>new Promise((yes,no)=>{resolve=yes;reject=no;}));const container=mount(<MorphingButton onSave={save}/>);act(()=>container.querySelector('button').click());act(()=>container.querySelector('button').click());expect(save).toHaveBeenCalledOnce();await act(async()=>reject(new Error('offline')));expect(container.textContent).toContain('Try again');act(()=>container.querySelector('button').click());expect(save).toHaveBeenCalledTimes(2);await act(async()=>resolve());expect(container.querySelector('button').getAttribute('aria-label')).toBe('Saved');});
 it('composes child handlers and native disclosure state',()=>{const click=vi.fn();const container=mount(<Disclosure><DisclosureTrigger><button onClick={click}>Details</button></DisclosureTrigger><DisclosureContent>More information</DisclosureContent></Disclosure>);const trigger=container.querySelector('button');expect(trigger.getAttribute('aria-expanded')).toBe('false');act(()=>trigger.click());expect(click).toHaveBeenCalledOnce();expect(trigger.getAttribute('aria-expanded')).toBe('true');expect(container.textContent).toContain('More information');});
});

describe('hold confirmation',()=>{
 it('keeps the full hold time under reduced motion and waits for deletion',async()=>{vi.useFakeTimers();let resolve;const remove=vi.fn(()=>new Promise(yes=>{resolve=yes;}));const container=mount(<HoldToDelete onDelete={remove}/>);const button=container.querySelector('button');act(()=>button.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true})));act(()=>vi.advanceTimersByTime(1999));expect(remove).not.toHaveBeenCalled();act(()=>vi.advanceTimersByTime(1));expect(remove).toHaveBeenCalledOnce();expect(button.textContent).toContain('Deleting');await act(async()=>resolve());expect(button.textContent).toContain('Deleted');});
 it('cancels on release and permits retry after rejection',async()=>{vi.useFakeTimers();const remove=vi.fn().mockRejectedValue(new Error('offline'));const container=mount(<HoldToDelete onDelete={remove}/>);const button=container.querySelector('button');const key=type=>button.dispatchEvent(new KeyboardEvent(type,{key:' ',bubbles:true}));act(()=>key('keydown'));act(()=>vi.advanceTimersByTime(500));act(()=>key('keyup'));act(()=>vi.advanceTimersByTime(2000));expect(remove).not.toHaveBeenCalled();act(()=>key('keydown'));await act(async()=>vi.advanceTimersByTime(2000));expect(button.textContent).toContain('Hold to retry');});
});

describe('accessible names',()=>{
 it('labels every slider thumb, including disabled single values',()=>{const container=mount(<Slider aria-label="Playback position" defaultValue={[50]} disabled/>);expect(container.querySelector('[role=slider]').getAttribute('aria-label')).toBe('Playback position');});
 it('keeps the visible calendar number in its accessible name',()=>{const container=mount(<Calendar mode="single" defaultMonth={new Date(2026,9,1)}/>);const day=container.querySelector('[data-day="'+new Date(2026,9,1).toLocaleDateString()+'"]');expect(day.getAttribute('aria-label')).toContain('October 1, 2026');});
 it('exposes morphing text as normal text without an invalid paragraph label',()=>{const container=mount(<TextMorph>Components</TextMorph>);expect(container.querySelector('p').hasAttribute('aria-label')).toBe(false);expect(container.querySelector('.sr-only').textContent).toBe('Components');});
});
