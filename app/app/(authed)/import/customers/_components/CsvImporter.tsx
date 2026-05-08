"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input } from "@/components/app/ui/Input";
import {
  bulkSetCustomerLanguage,
  importCustomers,
  type ImportedCustomerSummary,
  type ImportLanguage,
  type ImportRow,
} from "../actions";

type Field =
  | "display_name"
  | "primary_email"
  | "primary_phone"
  | "street"
  | "city"
  | "state"
  | "zip"
  | "notes"
  | "preferred_language"
  | "ignore";

const FIELD_LABELS: Record<Field, string> = {
  display_name: "Customer name *",
  primary_email: "Email",
  primary_phone: "Phone",
  street: "Street",
  city: "City",
  state: "State",
  zip: "Zip",
  notes: "Notes",
  preferred_language: "Language (en/es)",
  ignore: "Ignore",
};

const HEADER_GUESSES: Record<string, Field> = {
  name: "display_name",
  customer: "display_name",
  "customer name": "display_name",
  "first name": "display_name",
  email: "primary_email",
  "email address": "primary_email",
  phone: "primary_phone",
  "phone number": "primary_phone",
  mobile: "primary_phone",
  address: "street",
  street: "street",
  "street address": "street",
  city: "city",
  state: "state",
  zip: "zip",
  "zip code": "zip",
  postal: "zip",
  notes: "notes",
  note: "notes",
  comment: "notes",
  language: "preferred_language",
  lang: "preferred_language",
  "preferred language": "preferred_language",
  idioma: "preferred_language",
  locale: "preferred_language",
};

/**
 * Client-side mirror of normalizeLanguage in actions.ts. Kept inline so
 * the parsed-row preview can show the resolved language without a
 * round-trip. Server runs the same logic on submit, so any drift just
 * costs one preview disagreement, not bad data.
 */
function previewLanguage(raw: string | null | undefined): ImportLanguage {
  if (raw == null) return "en";
  const s = String(raw).trim().toLowerCase();
  if (s.length === 0) return "en";
  if (
    s === "es" ||
    s.startsWith("es") ||
    s.startsWith("sp") ||
    s.includes("español") ||
    s.includes("espanol") ||
    s.includes("spanish")
  ) {
    return "es";
  }
  return "en";
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  // Minimal RFC-4180-ish parser. Handles quoted fields with escaped quotes
  // and embedded commas. Good enough for the export formats Jobber / LMN /
  // ServicePro / QuickBooks emit.
  const lines: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cur.push(field);
        field = "";
      } else if (ch === "\r") {
        // skip
      } else if (ch === "\n") {
        cur.push(field);
        lines.push(cur);
        cur = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    lines.push(cur);
  }
  const cleaned = lines.filter((l) => l.some((c) => c.trim().length > 0));
  const headers = (cleaned.shift() ?? []).map((h) => h.trim());
  return { headers, rows: cleaned };
}

type SuccessState = {
  inserted: number;
  skipped: number;
  consentsRecorded: number;
  languageMapped: boolean;
  customers: ImportedCustomerSummary[];
};

export function CsvImporter() {
  const router = useRouter();
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<string[][]>([]);
  const [mapping, setMapping] = React.useState<Record<number, Field>>({});
  const [attestation, setAttestation] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [success, setSuccess] = React.useState<SuccessState | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Index of the column the tenant mapped to preferred_language, or null.
  const languageColumnIdx = React.useMemo<number | null>(() => {
    const entry = Object.entries(mapping).find(
      ([, f]) => f === "preferred_language",
    );
    return entry ? Number(entry[0]) : null;
  }, [mapping]);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const { headers: h, rows: r } = parseCsv(text);
      if (h.length === 0) {
        toast.error("Couldn't read any columns from that CSV.");
        return;
      }
      const guessed: Record<number, Field> = {};
      h.forEach((header, idx) => {
        const guess = HEADER_GUESSES[header.toLowerCase()] ?? "ignore";
        guessed[idx] = guess;
      });
      setHeaders(h);
      setRows(r);
      setMapping(guessed);
    };
    reader.readAsText(file);
  }

  function setColumn(idx: number, field: Field) {
    setMapping((prev) => {
      const next = { ...prev };
      // Each non-ignore field is single-assign — if the tenant picks a new
      // column for an already-mapped field, clear the old one. Keeps the
      // resulting payload deterministic.
      if (field !== "ignore") {
        for (const [k, v] of Object.entries(next)) {
          if (v === field && Number(k) !== idx) {
            next[Number(k)] = "ignore";
          }
        }
      }
      next[idx] = field;
      return next;
    });
  }

  const hasName = Object.values(mapping).includes("display_name");

  async function handleImport() {
    if (!hasName) {
      toast.error("Map one column to Customer name before importing.");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const payload: ImportRow[] = rows
        .map((cells) => {
          const out: Record<Field, string | null> = {
            display_name: null,
            primary_email: null,
            primary_phone: null,
            street: null,
            city: null,
            state: null,
            zip: null,
            notes: null,
            preferred_language: null,
            ignore: null,
          };
          headers.forEach((_, idx) => {
            const f = mapping[idx];
            if (!f || f === "ignore") return;
            const v = cells[idx]?.trim() ?? "";
            if (v.length === 0) return;
            out[f] = v;
          });
          return {
            display_name: out.display_name ?? "",
            primary_email: out.primary_email,
            primary_phone: out.primary_phone,
            street: out.street,
            city: out.city,
            state: out.state,
            zip: out.zip,
            notes: out.notes,
            preferred_language: out.preferred_language
              ? previewLanguage(out.preferred_language)
              : null,
          } satisfies ImportRow;
        })
        .filter((r) => r.display_name.length > 0);

      if (payload.length === 0) {
        toast.error("No rows have a customer name after mapping.");
        return;
      }

      const res = await importCustomers({
        rows: payload,
        messagingAttestation: attestation,
      });
      if ("error" in res) {
        toast.error(
          res.error === "no_rows"
            ? "No rows to import."
            : res.error === "too_many_rows"
              ? "Too many rows — split into batches under 5000."
              : "Import failed. Try again or email founders@gladiusturf.com.",
        );
        return;
      }
      toast.success(
        `Imported ${res.inserted} customer${res.inserted === 1 ? "" : "s"}` +
          (res.skipped ? ` · ${res.skipped} duplicates skipped` : "") +
          (res.consentsRecorded
            ? ` · ${res.consentsRecorded} consent attestations logged`
            : ""),
      );
      // Stay on the page so Felipe can use the bulk-language fallback if
      // he didn't map a language column. He can always navigate away.
      setSuccess({
        inserted: res.inserted,
        skipped: res.skipped,
        consentsRecorded: res.consentsRecorded,
        languageMapped: res.languageMapped,
        customers: res.customers,
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------- success / bulk-set screen
  if (success) {
    return (
      <BulkLanguageStep
        success={success}
        onDone={() => router.push("/app/customers")}
        onAnother={() => {
          setSuccess(null);
          setHeaders([]);
          setRows([]);
          setMapping({});
          setAttestation(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />
    );
  }

  if (headers.length === 0) {
    return (
      <div className="g-card flex flex-col items-center justify-center gap-3 p-12 text-center">
        <FileText className="h-6 w-6 text-g-text-faint" />
        <div className="text-g-text">Drop a CSV here, or pick one</div>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="max-w-sm"
        />
        <p className="text-[12px] text-g-text-faint">
          Header row required · max 5000 rows per import
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="g-card overflow-x-auto p-4">
        <div className="mb-3 flex items-center gap-2 text-[12px]">
          <CheckCircle2 className="h-3.5 w-3.5 text-g-accent" />
          <span className="text-g-text">
            {rows.length} row{rows.length === 1 ? "" : "s"} ready
          </span>
          <span className="text-g-text-faint">·</span>
          <button
            type="button"
            onClick={() => {
              setHeaders([]);
              setRows([]);
              setMapping({});
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-g-text-muted hover:text-g-text"
          >
            Pick a different file
          </button>
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-g-border-subtle">
              <th className="px-2 py-2 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                CSV column
              </th>
              <th className="px-2 py-2 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                Map to
              </th>
              <th className="px-2 py-2 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                Sample
              </th>
            </tr>
          </thead>
          <tbody>
            {headers.map((h, idx) => {
              const mapped = mapping[idx] ?? "ignore";
              const sampleRaw = rows[0]?.[idx] ?? "";
              const isLang = mapped === "preferred_language";
              const sampleLang = isLang ? previewLanguage(sampleRaw) : null;
              return (
                <tr
                  key={idx}
                  className="border-b border-g-border-subtle last:border-b-0"
                >
                  <td className="px-2 py-2 text-g-text">
                    {h || `Column ${idx + 1}`}
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={mapped}
                      onChange={(e) => setColumn(idx, e.target.value as Field)}
                      className="h-8 rounded-md bg-g-surface border border-g-border px-2 text-[13px] text-g-text"
                    >
                      {(Object.keys(FIELD_LABELS) as Field[]).map((f) => (
                        <option key={f} value={f}>
                          {FIELD_LABELS[f]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-g-text-muted truncate max-w-[280px]">
                    {sampleLang ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-g-text-muted">{sampleRaw}</span>
                        <span
                          className={
                            sampleLang === "es"
                              ? "inline-flex h-5 items-center rounded-full bg-g-accent-faint px-2 text-[11px] font-medium text-g-accent"
                              : "inline-flex h-5 items-center rounded-full bg-g-surface-2 px-2 text-[11px] font-medium text-g-text-muted"
                          }
                        >
                          {sampleLang === "es" ? "Español" : "English"}
                        </span>
                      </span>
                    ) : (
                      sampleRaw
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {languageColumnIdx == null && (
        <div className="g-card flex items-start gap-3 p-4">
          <Languages className="mt-0.5 h-4 w-4 shrink-0 text-g-text-faint" />
          <div className="text-[12px] text-g-text-muted leading-relaxed">
            <strong className="text-g-text">No language column mapped.</strong>{" "}
            All imported customers will default to{" "}
            <strong className="text-g-text">English</strong>. If your book is
            bilingual, map a column to <em>Language (en/es)</em> above — or set
            language in bulk on the next step after import.
          </div>
        </div>
      )}

      <label className="g-card flex items-start gap-3 p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={attestation}
          onChange={(e) => setAttestation(e.target.checked)}
          className="mt-1 h-4 w-4 accent-g-accent shrink-0"
        />
        <span className="text-[13px] text-g-text leading-relaxed">
          <strong className="font-medium">Messaging attestation (optional but recommended).</strong>{" "}
          I have lawful basis (consent, contract, or legitimate interest) to
          message these contacts on behalf of my business via SMS or email.
          Ticking this records a pending consent row per contact for audit
          purposes — outbound sends still require explicit opt-in (a reply,
          portal confirmation click, etc.) before they fire.
        </span>
      </label>

      <div className="flex items-center justify-end gap-2">
        {!hasName && (
          <span className="text-[12px] text-g-warning">
            Map one column to Customer name to continue.
          </span>
        )}
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={busy || !hasName}
          onClick={handleImport}
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Importing…
            </>
          ) : (
            <>Import {rows.length} row{rows.length === 1 ? "" : "s"}</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Bulk-language post-import step
// ----------------------------------------------------------------------------

interface BulkLanguageStepProps {
  success: SuccessState;
  onDone: () => void;
  onAnother: () => void;
}

function BulkLanguageStep({ success, onDone, onAnother }: BulkLanguageStepProps) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState(false);
  // Track which customers we already applied an override to in this
  // session so the table can show "set" badges and avoid double-counting.
  const [overrides, setOverrides] = React.useState<
    Record<string, ImportLanguage>
  >({});

  const customers = success.customers;
  const allSelected =
    customers.length > 0 && selected.size === customers.length;
  const someSelected = selected.size > 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(customers.map((c) => c.id)));
    }
  }

  async function applyLanguage(language: ImportLanguage) {
    if (busy || !someSelected) return;
    const ids = Array.from(selected);
    setBusy(true);
    try {
      const res = await bulkSetCustomerLanguage({
        customerIds: ids,
        language,
      });
      if ("error" in res) {
        toast.error(
          res.error === "no_ids"
            ? "Pick at least one customer first."
            : "Couldn't update — try again.",
        );
        return;
      }
      toast.success(
        `Set ${res.updated} customer${res.updated === 1 ? "" : "s"} to ${
          language === "es" ? "Español" : "English"
        }`,
      );
      setOverrides((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = language;
        return next;
      });
      setSelected(new Set());
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="g-card flex items-start gap-3 p-4">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-g-accent-faint text-g-accent">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <div className="text-g-text font-medium">
            Imported {success.inserted} customer
            {success.inserted === 1 ? "" : "s"}
            {success.skipped
              ? ` · ${success.skipped} duplicate${success.skipped === 1 ? "" : "s"} skipped`
              : ""}
          </div>
          {!success.languageMapped && success.customers.length > 0 && (
            <p className="mt-1 text-[12px] text-g-text-muted leading-relaxed">
              You didn&apos;t map a language column, so everyone landed as{" "}
              <strong className="text-g-text">English</strong>. If your book is
              bilingual, tick the Spanish-speaking customers below and tap{" "}
              <em>Set Español</em>. Storm Mode and other automated messages
              honor this per-customer.
            </p>
          )}
        </div>
      </div>

      {customers.length > 0 ? (
        <div className="g-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-g-border-subtle px-4 py-3">
            <div className="flex items-center gap-3 text-[12px] text-g-text-muted">
              <button
                type="button"
                onClick={toggleAll}
                className="text-g-text-muted hover:text-g-text"
              >
                {allSelected ? "Clear selection" : "Select all"}
              </button>
              <span className="text-g-text-faint">·</span>
              <span>
                {selected.size} selected of {customers.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy || !someSelected}
                onClick={() => applyLanguage("en")}
              >
                Set English
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={busy || !someSelected}
                onClick={() => applyLanguage("es")}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>Set Español</>
                )}
              </Button>
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-g-surface">
                <tr className="border-b border-g-border-subtle">
                  <th className="w-10 px-3 py-2"></th>
                  <th className="px-2 py-2 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Customer
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Language
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const current = overrides[c.id] ?? c.preferred_language;
                  const isChecked = selected.has(c.id);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-g-border-subtle last:border-b-0"
                    >
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(c.id)}
                          className="h-4 w-4 accent-g-accent"
                          aria-label={`Select ${c.display_name}`}
                        />
                      </td>
                      <td className="px-2 py-2 text-g-text">{c.display_name}</td>
                      <td className="px-2 py-2">
                        <span
                          className={
                            current === "es"
                              ? "inline-flex h-5 items-center rounded-full bg-g-accent-faint px-2 text-[11px] font-medium text-g-accent"
                              : "inline-flex h-5 items-center rounded-full bg-g-surface-2 px-2 text-[11px] font-medium text-g-text-muted"
                          }
                        >
                          {current === "es" ? "Español" : "English"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="g-card p-6 text-center text-[13px] text-g-text-muted">
          Nothing new was inserted (all rows were duplicates of existing
          customers).
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onAnother}>
          Import another file
        </Button>
        <Button type="button" variant="primary" onClick={onDone}>
          Done — go to Customers
        </Button>
      </div>
    </div>
  );
}
