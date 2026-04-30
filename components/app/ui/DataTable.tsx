"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  width?: string;
  className?: string;
  align?: "left" | "right" | "center";
  mono?: boolean;
};

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string | null;
  empty?: React.ReactNode;
  caption?: React.ReactNode;
  pageSize?: number;
  rowKey?: (row: T, idx: number) => string;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowHref,
  empty,
  caption,
  pageSize = 50,
  rowKey,
  className,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0);
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = rows.slice(page * pageSize, (page + 1) * pageSize);

  if (!total)
    return (
      <div className="g-card p-10 flex items-center justify-center text-g-text-muted text-[13px]">
        {empty ?? "No rows yet."}
      </div>
    );

  return (
    <div className={cn("g-card overflow-hidden", className)}>
      {caption && (
        <div className="px-4 py-2.5 border-b border-g-border-subtle text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          {caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-g-border-subtle">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.className,
                  )}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => {
              const href = rowHref?.(row) ?? null;
              const k = rowKey?.(row, i) ?? `${page}-${i}`;
              const cells = columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-2.5 text-g-text border-b border-g-border-subtle last:border-b-0",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.mono && "font-geist-mono tabular-nums",
                    c.className,
                  )}
                >
                  {c.cell(row)}
                </td>
              ));
              return (
                <tr
                  key={k}
                  className={cn(
                    "transition-colors",
                    href && "hover:bg-g-surface-2 cursor-pointer",
                  )}
                >
                  {href ? (
                    <td colSpan={columns.length} className="p-0">
                      <Link
                        href={href}
                        prefetch
                        className="grid w-full"
                        style={{
                          gridTemplateColumns: columns
                            .map((c) => c.width ?? "1fr")
                            .join(" "),
                        }}
                      >
                        {cells.map((cell, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "px-4 py-2.5 text-g-text border-b border-g-border-subtle last:border-b-0 flex items-center",
                              columns[idx]!.align === "right" && "justify-end",
                              columns[idx]!.align === "center" && "justify-center",
                              columns[idx]!.mono && "font-geist-mono tabular-nums",
                              columns[idx]!.className,
                            )}
                          >
                            {(cell as React.ReactElement<{ children?: React.ReactNode }>).props.children}
                          </div>
                        ))}
                      </Link>
                    </td>
                  ) : (
                    cells
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-g-border-subtle text-[11px] text-g-text-muted">
          <span className="font-geist-mono tabular-nums">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of{" "}
            {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-2 py-1 rounded hover:bg-g-surface-2 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="px-2 py-1 rounded hover:bg-g-surface-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
