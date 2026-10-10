"use client";

import * as React from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saas-maker/ui/components/card";
import { DataTableSkeleton } from "@saas-maker/ui/components/data-table";
import { SkeletonAvatar, SkeletonBlock, SkeletonImage, SkeletonText } from "@saas-maker/ui/components/skeleton";
import { CardGridSkeleton, CardSkeleton, ConsolePageSkeleton, QuoteListSkeleton, RecordDetailSkeleton, StatTileSkeleton } from "@saas-maker/ui/blocks/skeletons";
import { ResourceBoundary } from "@saas-maker/ui/blocks/resource-boundary";
import { useResource } from "@saas-maker/ui/lib/use-resource";

type Mode = "slow" | "error" | "empty" | "fast";
type Item = { id: string; name: string; description: string };
const columns = [{ id: "name", header: "name", minWidth: "10rem" }, { id: "kind", header: "kind", minWidth: "7rem" }];
const modes: Mode[] = ["slow", "error", "empty", "fast"];
const items: Item[] = [{ id: "sample", name: "sample record", description: "a generic record, ready to read" }];

function ResourceExample({ mode, run }: { mode: Mode; run: number }) {
  const attempts = React.useRef(0);
  const fetcher = React.useCallback((signal: AbortSignal) => new Promise<Item[]>((resolve, reject) => {
    attempts.current += 1;
    const attempt = attempts.current;
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      if (mode === "error" && attempt === 1) reject(Object.assign(new Error("the simulated request failed"), { status: 400 }));
      else resolve(mode === "empty" ? [] : items);
    }, mode === "fast" ? 40 : 1800);
    function abort() { clearTimeout(timer); reject(new DOMException("aborted", "AbortError")); }
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  }), [mode]);
  const resource = useResource(`loading-demo:${mode}:${run}`, fetcher, { staleTime: 60_000 });
  return <div className="loading-demo-result" data-resource-demo data-resource-status={resource.status}>
    <ResourceBoundary resource={resource} skeleton={<CardSkeleton lines={1} />}>
      {(data) => <Card data-loaded-record><CardHeader><CardDescription className="h-4 leading-4">example collection</CardDescription><CardTitle className="h-5 leading-5">{data[0]?.name}</CardTitle></CardHeader><CardContent><p className="text-sm leading-4">{data[0]?.description}</p></CardContent></Card>}
    </ResourceBoundary>
  </div>;
}

function Example({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="loading-example"><h3>{title}</h3>{children}</section>;
}

export default function LoadingDemo() {
  const [mode, setMode] = React.useState<Mode>("slow");
  const [run, setRun] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  return <>
    <section className="loading-playground" aria-labelledby="resource-heading">
      <div><h2 id="resource-heading">a resource, four outcomes</h2><p>Simulated requests take 1.8 seconds, or 40 ms in fast mode. The error fails once; “try again” recovers.</p></div>
      <div className="loading-controls" aria-label="request mode">{modes.map((value) => <Button key={value} variant={mode === value ? "default" : "outline"} aria-pressed={mode === value} data-mode={value} onClick={() => { setMode(value); setVisible(true); }}>{value}</Button>)}</div>
      <div className="loading-demo-stage">{visible ? <ResourceExample key={`${mode}:${run}`} mode={mode} run={run} /> : <p className="loading-away">the view is closed; its resource remains cached</p>}</div>
      <div className="loading-controls"><Button variant="outline" data-revisit onClick={() => setVisible(!visible)}>{visible ? "leave view" : "revisit"}</Button><Button variant="ghost" data-new-request onClick={() => { setRun(run + 1); setVisible(true); }}>new request</Button></div>
      <p className="loading-note">Load a record, leave the view, then revisit: cached content appears immediately.</p>
    </section>
    <section aria-labelledby="skeleton-heading"><h2 id="skeleton-heading">placeholders with a familiar shape</h2><p className="loading-note">Use the same widths, row count and image ratio as the arriving content.</p>
      <div className="loading-examples">
        <Example title="text and avatar"><div className="loading-person"><SkeletonAvatar /><SkeletonText lines={3} /></div></Example>
        <Example title="block and image"><div className="loading-two"><SkeletonBlock aspectRatio="4 / 3" /><SkeletonImage aspectRatio="4 / 3" /></div></Example>
        <Example title="card"><CardSkeleton image lines={2} /></Example>
        <Example title="stat tile"><StatTileSkeleton /></Example>
        <Example title="record detail"><RecordDetailSkeleton fields={3} /></Example>
        <Example title="quote list"><QuoteListSkeleton rows={3} /></Example>
      </div>
      <Example title="card grid"><CardGridSkeleton count={3} /></Example>
      <Example title="data table"><DataTableSkeleton columns={columns} rows={3} /></Example>
      <Example title="console content"><ConsolePageSkeleton columns={columns} rows={3} /></Example>
    </section>
  </>;
}
