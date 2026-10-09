"use client";

import * as React from "react";
import { DownloadIcon } from "lucide-react";
import { downloadText, toCSV, toJSON, type ExportColumn } from "../lib/export";
import { Button } from "../components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/dropdown-menu";

/**
 * Exports exactly the rows passed in (the current filtered, sorted view) as
 * CSV or JSON, in the browser. `meta` (source, collected-at, filters) is
 * written into the JSON wrapper so exports keep their provenance.
 */
export function ExportMenu<T>({
  rows,
  columns,
  filename,
  meta,
  label = "export",
}: {
  rows: T[];
  columns: ExportColumn<T>[];
  /** Without extension, e.g. "places-2026-10-09". */
  filename: string;
  meta?: Record<string, unknown>;
  label?: string;
}) {
  const n = rows.length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground" disabled={n === 0}>
          <DownloadIcon />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {n.toLocaleString()} {n === 1 ? "row" : "rows"} in this view
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => downloadText(`${filename}.csv`, toCSV(rows, columns), "text/csv;charset=utf-8")}>
          <span className="ui-case">csv</span>
          <span className="ml-auto text-xs text-muted-foreground">spreadsheets</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            downloadText(`${filename}.json`, toJSON(rows, columns, meta ? { ...meta, exportedAt: new Date().toISOString(), rowCount: n } : undefined), "application/json")
          }
        >
          <span className="ui-case">json</span>
          <span className="ml-auto text-xs text-muted-foreground">with source</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
