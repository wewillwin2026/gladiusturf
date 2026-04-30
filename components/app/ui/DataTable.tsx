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
  /** Maximum rows to render. Beyond this, a footer hint shows the total. */
  maxRows?: number;
  rowKey?: (row: T, idx: number) => string;
  className?: string;
}

/**
 * Server component table. Renders up to `maxRows` rows; for full pagination
 * we'd switch to a client island, but Phase 2 only needs ≥8 rendered rows
 * with a "+ N more" hint.
 */
export function DataTable<T>({
  columns,
  rows,
  rowHref,
  empty,
  caption,
  maxRows = 50,
  rowKey,
  className,
}: DataTableProps<T>) {
  const total = rows.length;

  if (!total)
    return (
      <div className="g-card p-10 flex items-center justify-center text-g-text-muted text-[13px]">
        {empty ?? "No rows yet."}
      </div>
    );

  const visible = rows.slice(0, maxRows);

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
              const k = rowKey?.(row, i) ?? `${i}`;
              return (
                <tr
                  key={k}
                  className={cn(
                    "border-b border-g-border-subtle last:border-b-0 transition-colors",
                    href && "hover:bg-g-surface-2",
                  )}
                >
                  {columns.map((c, ci) => {
                    const cls = cn(
                      "px-4 py-2.5 text-g-text",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      c.mono && "font-geist-mono tabular-nums",
                      c.className,
                    );
                    return (
                      <td key={c.key} className={cls}>
                        {href && ci === 0 ? (
                          <Link
                            href={href}
                            prefetch
                            className="block text-g-text hover:text-g-accent"
                          >
                            {c.cell(row)}
                          </Link>
                        ) : (
                          c.cell(row)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {total > maxRows && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-g-border-subtle text-[11px] text-g-text-muted">
          <span className="font-geist-mono tabular-nums">
            Showing 1–{maxRows} of {total}
          </span>
          <span className="text-g-text-faint">
            (full pagination ships in Phase 4 — Reports)
          </span>
        </div>
      )}
    </div>
  );
}
