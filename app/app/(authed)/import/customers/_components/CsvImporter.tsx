"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input } from "@/components/app/ui/Input";
import { importCustomers, type ImportRow } from "../actions";

type Field =
  | "display_name"
  | "primary_email"
  | "primary_phone"
  | "street"
  | "city"
  | "state"
  | "zip"
  | "notes"
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
};

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

export function CsvImporter() {
  const router = useRouter();
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<string[][]>([]);
  const [mapping, setMapping] = React.useState<Record<number, Field>>({});
  const [attestation, setAttestation] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    setMapping((prev) => ({ ...prev, [idx]: field }));
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
      router.push("/app/customers");
      router.refresh();
    } finally {
      setBusy(false);
    }
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
            {headers.map((h, idx) => (
              <tr key={idx} className="border-b border-g-border-subtle last:border-b-0">
                <td className="px-2 py-2 text-g-text">{h || `Column ${idx + 1}`}</td>
                <td className="px-2 py-2">
                  <select
                    value={mapping[idx] ?? "ignore"}
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
                  {rows[0]?.[idx] ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
