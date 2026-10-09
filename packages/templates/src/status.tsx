import * as React from "react";

/** The hero's honest availability line: a brand dot and the state, linked to its status or release page. */
export function HeroStatus({ status }: { status: { label: string; href?: string } }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
      {status.href ? (
        <a href={status.href} className="underline decoration-current/30 underline-offset-[0.2em] transition-colors hover:decoration-current">
          {status.label}
        </a>
      ) : (
        status.label
      )}
    </span>
  );
}

/** Status and note on one quiet line. */
export function heroNote(status: React.ReactNode, note?: string): React.ReactNode {
  if (!status) return note;
  return note ? (
    <>
      {status}
      <span aria-hidden> · </span>
      {note}
    </>
  ) : (
    status
  );
}
