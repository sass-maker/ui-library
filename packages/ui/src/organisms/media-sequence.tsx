"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { MediaFrame } from "../molecules/media-frame";
import { cn } from "../lib/utils";

export type MediaChapter = { id: string; title: string; description: ReactNode; media: ReactNode; caption: ReactNode };

/** A browsable product story with native tab keyboard behavior and real media. */
export function MediaSequence({ label, chapters, className }: { label: string; chapters: MediaChapter[]; className?: string }) {
  if (!chapters.length) return null;
  return <Tabs defaultValue={chapters[0].id} className={cn("gap-7", className)}>
    <TabsList aria-label={label} variant="line" className="h-auto! w-full justify-start gap-2 overflow-x-auto border-b border-border p-0 pb-3">
      {chapters.map((chapter, index) => <TabsTrigger value={chapter.id} key={chapter.id} className="min-h-11 flex-none gap-2 px-3 py-2 text-sm sm:px-5">
        <span aria-hidden className="font-mono text-[0.625rem] text-muted-foreground">0{index + 1}</span>{chapter.title}
      </TabsTrigger>)}
    </TabsList>
    {chapters.map(chapter => <TabsContent key={chapter.id} value={chapter.id} className="min-w-0">
      <div className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <div className="max-w-md"><h3 className="font-display text-3xl leading-tight sm:text-4xl">{chapter.title}</h3><div className="mt-4 text-base leading-relaxed text-muted-foreground">{chapter.description}</div></div>
        <MediaFrame caption={chapter.caption}>{chapter.media}</MediaFrame>
      </div>
    </TabsContent>)}
  </Tabs>;
}
