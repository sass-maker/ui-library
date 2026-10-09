import * as React from "react";
import { QuoteList, QuoteTimestamp, QuoteSpeakerLabel, type QuoteItem } from "@saas-maker/ui/blocks/quote-list";
import { KeyValueList, Provenance, RecordDetail, RecordLayout } from "@saas-maker/ui/blocks/record-detail";
import data from "../data/podcast-claims.json";

/**
 * Claims from a small verbatim sample of High Signal Podcasts' public API
 * (podcasts.highsignal.app). The source marks each speaker as verified or
 * not; unverified speakers are never named.
 */

type Claim = (typeof data.claims)[number];

const toItem = (c: Claim): QuoteItem => ({
  id: c.id,
  quote: c.quote,
  speaker: { name: c.personName, verified: c.attributionStatus === "verified_speaker" },
  source: { label: c.showName },
  date: c.saidOn,
  timestamp: c.timestampS == null ? null : { seconds: c.timestampS, href: c.deepLinkUrl },
  type: c.claimType,
});

const items = data.claims.map(toItem);
const byId = new Map(data.claims.map((c) => [c.id, c]));

export default function ClaimsWorkbench() {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const open = openId ? byId.get(openId) : undefined;
  const item = open ? toItem(open) : undefined;

  return (
    <RecordLayout>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground">{items.length}</span> published claims, newest first
        </p>
        <QuoteList label="Claims" items={items} selectedId={openId} onOpen={(q) => setOpenId(q.id)} />
        <Provenance
          info={{
            source: data.source,
            url: data.sourceUrl,
            via: "public API",
            viaUrl: data.viaUrl,
            readAt: data.readAt,
            note: data.note,
          }}
        />
      </div>
      <RecordDetail open={!!open} onOpenChange={(v) => !v && setOpenId(null)} title="claim" subtitle={open?.episodeTitle}>
        {open && item && (
          <>
            <blockquote className="border-l-2 border-border pl-4 text-[0.9375rem] leading-relaxed text-pretty">“{open.quote}”</blockquote>
            <KeyValueList
              align="start"
              items={[
                { label: "speaker", value: <QuoteSpeakerLabel speaker={item.speaker} /> },
                { label: "attribution", value: item.speaker?.verified ? "verified speaker" : "speaker not verified" },
                { label: "said on", value: open.saidOn ? new Date(open.saidOn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : null },
                { label: "timestamp", value: item.timestamp ? <QuoteTimestamp timestamp={item.timestamp} /> : "not timed" },
                { label: "type", value: open.claimType },
                { label: "show", value: open.showName },
                { label: "episode", value: open.sourceUrl ? <a href={open.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{open.episodeTitle}</a> : open.episodeTitle },
              ]}
            />
            <Provenance info={{ source: data.source, url: `https://podcasts.highsignal.app/claims/${open.id}`, via: "public API", viaUrl: data.viaUrl, readAt: data.readAt }} />
          </>
        )}
      </RecordDetail>
    </RecordLayout>
  );
}
