/**
 * Client-side export of the rows a view currently shows. No dependencies.
 */

export type ExportColumn<T> = { id: string; label?: string; value: (row: T) => unknown };

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
  // Neutralize spreadsheet formulas, then quote when needed (RFC 4180).
  const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** CSV with a header row of column ids (or labels with `useLabels`). */
export function toCSV<T>(rows: T[], columns: ExportColumn<T>[], opts: { useLabels?: boolean } = {}): string {
  const head = columns.map((c) => csvCell(opts.useLabels ? (c.label ?? c.id) : c.id)).join(",");
  const body = rows.map((r) => columns.map((c) => csvCell(c.value(r))).join(","));
  return [head, ...body].join("\r\n") + "\r\n";
}

/** JSON array of objects keyed by column id; `meta` wraps it as { meta, rows }. */
export function toJSON<T>(rows: T[], columns: ExportColumn<T>[], meta?: Record<string, unknown>): string {
  const out = rows.map((r) => Object.fromEntries(columns.map((c) => [c.id, c.value(r) ?? null])));
  return JSON.stringify(meta ? { meta, rows: out } : out, null, 2) + "\n";
}

/** Saves text as a file in the browser. */
export function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([mime.startsWith("text/csv") ? "﻿" + text : text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
