// ---------------------------------------------------------------------------
// GladiusSentinel — Schema vs. Code Drift Scanner (gladiusturf.com)
// ---------------------------------------------------------------------------
// Why this exists:
//
//   When the Supabase schema and the code that reads/writes it drift apart,
//   the symptoms are silent until a Postgres "column does not exist" error
//   fires in production. The sister gladius-crm version of this scanner
//   reads `prisma/schema.prisma`; this gladiusturf-com version reads the
//   union of `supabase/migrations/*.sql` to reconstruct the live schema.
//
//   For each table we list the columns it currently has (after all
//   migrations apply in order), then walk `app/` and `lib/` looking for
//   `.from("<table>").select|insert|update|delete(...)` calls. For each
//   call we extract the column names referenced and report:
//
//     - `codeOnlyFields`   — columns referenced in code but NOT in schema
//                            (the dangerous one — would 500 at runtime).
//     - `schemaOnlyFields` — columns in schema but never read in code
//                            (a hygiene signal, not a fire).
//
//   A nightly cron at `/api/cron/sentinel-schema-drift` writes any
//   `codeOnlyFields` finding as a sentinel_events row of kind
//   `SCHEMA_DRIFT_DETECTED`, severity `CRITICAL`.
//
//   The parsing is intentionally lenient — both for migration SQL and code
//   field detection. False positives are filtered by a stoplist of
//   non-column tokens (`true`, `null`, `count`, etc.).
// ---------------------------------------------------------------------------

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const MIGRATIONS_DIR = "supabase/migrations";
const CODE_ROOTS = ["app", "lib"];

const NON_COLUMN_TOKENS = new Set([
  "true",
  "false",
  "null",
  "asc",
  "desc",
  "count",
  "in",
  "not",
  "is",
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "match",
  "contains",
  "containedBy",
  "rangeGt",
  "rangeGte",
  "rangeLt",
  "rangeLte",
  "rangeAdjacent",
  "overlaps",
  "textSearch",
  "filter",
  "or",
  "and",
  "from",
  "select",
  "insert",
  "update",
  "delete",
  "upsert",
  "single",
  "maybeSingle",
  "order",
  "limit",
  "range",
  "head",
  "returning",
  "onConflict",
  "ascending",
  "nullsFirst",
  "exact",
  "planned",
  "estimated",
  "data",
  "error",
  "table",
  "schema",
  "string",
  "number",
  "boolean",
  "object",
  "array",
]);

export interface DriftReport {
  table: string;
  codeOnlyFields: string[];
  schemaOnlyFields: string[];
}

interface TableSchema {
  name: string;
  columns: Set<string>;
}

/**
 * Parse `create table` + `alter table … add column` statements from every
 * migration file. Order matters: later files can add columns to earlier
 * tables. Drop column / drop table statements are honored.
 */
export async function parseSupabaseSchema(
  migrationsDir = MIGRATIONS_DIR,
): Promise<Map<string, Set<string>>> {
  const tables = new Map<string, TableSchema>();
  let files: string[] = [];
  try {
    files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql"));
    files.sort();
  } catch {
    return new Map();
  }

  for (const f of files) {
    let sql: string;
    try {
      sql = await readFile(path.join(migrationsDir, f), "utf8");
    } catch {
      continue;
    }

    // Strip line comments first
    const cleaned = sql.replace(/--.*$/gm, "");

    // create table [if not exists] "name"|name ( ... );
    const createRe =
      /create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?([a-z0-9_]+)["`]?\s*\(([\s\S]*?)\)\s*;/gi;
    let m: RegExpExecArray | null;
    while ((m = createRe.exec(cleaned)) !== null) {
      const name = m[1]!.toLowerCase();
      const body = m[2]!;
      const cols = extractColumnsFromCreateBody(body);
      const existing = tables.get(name);
      if (existing) {
        for (const c of cols) existing.columns.add(c);
      } else {
        tables.set(name, { name, columns: new Set(cols) });
      }
    }

    // alter table "name" add column "col" type ...
    const alterAddRe =
      /alter\s+table\s+(?:only\s+)?["`]?([a-z0-9_]+)["`]?\s+add\s+(?:column\s+)?(?:if\s+not\s+exists\s+)?["`]?([a-z0-9_]+)["`]?/gi;
    while ((m = alterAddRe.exec(cleaned)) !== null) {
      const t = m[1]!.toLowerCase();
      const col = m[2]!.toLowerCase();
      const existing = tables.get(t);
      if (existing) existing.columns.add(col);
      else tables.set(t, { name: t, columns: new Set([col]) });
    }

    // alter table "name" drop column "col"
    const alterDropRe =
      /alter\s+table\s+(?:only\s+)?["`]?([a-z0-9_]+)["`]?\s+drop\s+(?:column\s+)?(?:if\s+exists\s+)?["`]?([a-z0-9_]+)["`]?/gi;
    while ((m = alterDropRe.exec(cleaned)) !== null) {
      const t = m[1]!.toLowerCase();
      const col = m[2]!.toLowerCase();
      tables.get(t)?.columns.delete(col);
    }

    // drop table [if exists] "name"
    const dropTableRe =
      /drop\s+table\s+(?:if\s+exists\s+)?["`]?([a-z0-9_]+)["`]?/gi;
    while ((m = dropTableRe.exec(cleaned)) !== null) {
      tables.delete(m[1]!.toLowerCase());
    }
  }

  const out = new Map<string, Set<string>>();
  for (const [k, v] of tables) out.set(k, v.columns);
  return out;
}

function extractColumnsFromCreateBody(body: string): string[] {
  const cols: string[] = [];
  // Split on top-level commas
  const parts = splitTopLevelCommas(body);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const head = trimmed.split(/\s+/, 2)[0]!.toLowerCase();
    // Skip table-level constraints
    if (
      head === "primary" ||
      head === "foreign" ||
      head === "unique" ||
      head === "check" ||
      head === "constraint" ||
      head === "exclude"
    ) {
      continue;
    }
    const name = head.replace(/^["`]/, "").replace(/["`]$/, "");
    if (/^[a-z_][a-z0-9_]*$/.test(name)) cols.push(name);
  }
  return cols;
}

function splitTopLevelCommas(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  for (const c of s) {
    if (c === "(") {
      depth++;
      buf += c;
    } else if (c === ")") {
      depth--;
      buf += c;
    } else if (c === "," && depth === 0) {
      out.push(buf);
      buf = "";
    } else {
      buf += c;
    }
  }
  if (buf.trim()) out.push(buf);
  return out;
}

async function listSourceFiles(roots: string[]): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (name === "node_modules" || name === ".next") continue;
      const full = path.join(dir, name);
      let s;
      try {
        s = await stat(full);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        await walk(full);
      } else if (
        s.isFile() &&
        (name.endsWith(".ts") || name.endsWith(".tsx"))
      ) {
        out.push(full);
      }
    }
  }
  for (const r of roots) await walk(r);
  return out;
}

/**
 * For every table, find the column names referenced in code via
 * `.from("table").select("...")` / `.insert({col:...})` / `.update({...})`
 * / `.eq("col", ...)` / `.order("col", ...)`.
 *
 * Permissive regex-based extraction; false positives don't fire alerts
 * (we only flag code-only fields that are NOT in schema).
 */
export async function scanCodeFieldReferences(
  tables: Iterable<string>,
  codeRoots = CODE_ROOTS,
): Promise<Map<string, Set<string>>> {
  const tableSet = new Set(tables);
  const refs = new Map<string, Set<string>>();
  for (const t of tableSet) refs.set(t, new Set());

  const files = await listSourceFiles(codeRoots);

  // For each table, the regex looks for .from("<table>") and captures the
  // chained method calls afterward to extract column tokens.
  for (const file of files) {
    let src: string;
    try {
      src = await readFile(file, "utf8");
    } catch {
      continue;
    }
    if (!src.includes(".from(")) continue;
    for (const table of tableSet) {
      const re = new RegExp(
        `\\.from\\(\\s*["'\`]${escapeRegex(table)}["'\`]\\s*\\)([^;]{0,2000})`,
        "g",
      );
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) {
        const tail = m[1] ?? "";
        for (const col of extractColumnsFromTail(tail)) {
          if (NON_COLUMN_TOKENS.has(col)) continue;
          if (!/^[a-z_][a-z0-9_]*$/.test(col)) continue;
          refs.get(table)!.add(col);
        }
      }
    }
  }
  return refs;
}

function extractColumnsFromTail(tail: string): string[] {
  const cols: string[] = [];
  // .select("col1, col2, col3")
  const selectRe = /\.select\(\s*["'`]([^"'`]+)["'`]/g;
  let m: RegExpExecArray | null;
  while ((m = selectRe.exec(tail)) !== null) {
    for (const part of m[1]!.split(",")) {
      const tok = part.trim().split(/[\s\(:]/, 1)[0]!;
      if (tok && tok !== "*") cols.push(tok);
    }
  }
  // .eq("col", ...) / .neq / .gt / .lt etc
  const filterRe =
    /\.(eq|neq|gt|gte|lt|lte|like|ilike|in|is|contains|order)\(\s*["'`]([a-z0-9_]+)["'`]/g;
  while ((m = filterRe.exec(tail)) !== null) {
    cols.push(m[2]!);
  }
  // .insert({ col: ..., col2: ... }) / .update({...}) / .upsert({...})
  const writeRe = /\.(insert|update|upsert)\(\s*\{([^}]{0,1000})\}/g;
  while ((m = writeRe.exec(tail)) !== null) {
    for (const k of extractObjectKeys(m[2]!)) cols.push(k);
  }
  return cols;
}

function extractObjectKeys(body: string): string[] {
  const keys: string[] = [];
  const re = /([a-z_][a-z0-9_]*)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) keys.push(m[1]!);
  return keys;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Top-level entry — used by `/api/cron/sentinel-schema-drift`. Returns
 * one DriftReport per table with at least one drift signal.
 */
export async function findSchemaDrift(opts?: {
  migrationsDir?: string;
  codeRoots?: string[];
}): Promise<DriftReport[]> {
  const schema = await parseSupabaseSchema(opts?.migrationsDir ?? MIGRATIONS_DIR);
  const refs = await scanCodeFieldReferences(
    schema.keys(),
    opts?.codeRoots ?? CODE_ROOTS,
  );
  const reports: DriftReport[] = [];
  for (const [table, cols] of schema) {
    const codeCols = refs.get(table) ?? new Set<string>();
    const codeOnly: string[] = [];
    for (const f of codeCols) {
      if (!cols.has(f)) codeOnly.push(f);
    }
    const schemaOnly: string[] = [];
    for (const f of cols) {
      if (codeCols.size > 0 && !codeCols.has(f)) schemaOnly.push(f);
    }
    if (codeOnly.length > 0 || schemaOnly.length > 0) {
      reports.push({
        table,
        codeOnlyFields: codeOnly.sort(),
        schemaOnlyFields: schemaOnly.sort(),
      });
    }
  }
  return reports;
}
