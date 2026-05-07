"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, PenSquare, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import {
  createDraftQuote,
  emailQuoteToCustomer,
  markQuoteSent,
} from "../actions";

type CustomerOption = {
  id: string;
  name: string;
  subtitle: string;
  phone?: string | null;
};

type LineItemDraft = {
  id: string;
  description: string;
  qty: string;
  unitPrice: string;
};

function newLineItem(): LineItemDraft {
  return {
    id: Math.random().toString(36).slice(2, 10),
    description: "",
    qty: "1",
    unitPrice: "",
  };
}

function lineSubtotalCents(it: LineItemDraft): number {
  const qty = Number.parseFloat(it.qty);
  const unit = Number.parseFloat(it.unitPrice);
  if (!Number.isFinite(qty) || !Number.isFinite(unit)) return 0;
  return Math.round(qty * unit * 100);
}

function fmtMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface Props {
  customers: CustomerOption[];
  defaultLanguage: "en" | "es";
  tenantBilingual: boolean;
  defaultCustomerId: string | null;
}


export function DraftQuoteForm({
  customers,
  defaultLanguage,
  tenantBilingual,
  defaultCustomerId,
}: Props) {
  const router = useRouter();
  const [customerId, setCustomerId] = React.useState<string>(
    defaultCustomerId ?? "",
  );
  const [search, setSearch] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [total, setTotal] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [language, setLanguage] = React.useState<"en" | "es">(defaultLanguage);
  const [busy, setBusy] = React.useState(false);
  const [items, setItems] = React.useState<LineItemDraft[]>([]);
  const [isTest, setIsTest] = React.useState(false);

  const lineItemsTotalCents = React.useMemo(
    () => items.reduce((s, it) => s + lineSubtotalCents(it), 0),
    [items],
  );
  const itemsCleaned = React.useMemo(
    () =>
      items
        .map((it) => ({
          description: it.description.trim(),
          qty: Number.parseFloat(it.qty),
          unitPriceCents: Math.round(
            (Number.parseFloat(it.unitPrice) || 0) * 100,
          ),
        }))
        .filter(
          (it) =>
            it.description.length > 0 &&
            Number.isFinite(it.qty) &&
            it.qty > 0,
        ),
    [items],
  );
  const itemsTotalDollars = lineItemsTotalCents / 100;

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers.slice(0, 10);
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [customers, search]);

  const selected = customers.find((c) => c.id === customerId) ?? null;

  async function performCreate(thenSend: boolean) {
    if (busy) return;
    if (!customerId) {
      toast.error("Pick a customer first.");
      return;
    }
    if (!title.trim()) {
      toast.error("Add a short title for this quote.");
      return;
    }
    setBusy(true);
    try {
      const manualTotal = Number.parseFloat(total);
      // When line items are present they win — derive the total from them
      // so the customer-facing math is always self-consistent.
      const effectiveTotal =
        itemsCleaned.length > 0
          ? itemsTotalDollars
          : Number.isFinite(manualTotal)
            ? manualTotal
            : 0;
      const res = await createDraftQuote({
        customerId,
        title,
        totalDollars: effectiveTotal,
        language,
        notes: notes || null,
        items:
          itemsCleaned.length > 0
            ? itemsCleaned.map((it) => ({
                description: it.description,
                qty: it.qty,
                unitPriceCents: it.unitPriceCents,
              }))
            : null,
        isTest,
      });
      if ("error" in res) {
        toast.error(
          res.error === "missing_title"
            ? "Title is required."
            : res.error === "missing_customer"
              ? "Customer is required."
              : "Could not save the quote. Try again.",
        );
        return;
      }
      if (thenSend) {
        const send = await markQuoteSent(res.proposalId);
        if ("error" in send) {
          toast.warning(
            "Saved as draft — couldn't mark as sent. Flip status from /app/quotes.",
          );
        } else {
          const url =
            typeof window !== "undefined"
              ? `${window.location.origin}/quote/${res.proposalId}`
              : `/quote/${res.proposalId}`;

          // Best-effort auto-email via Resend behind the consent gate.
          // If consent is missing, no email on file, or RESEND_API_KEY
          // is unset, we fall back to clipboard-copy. The action's audit
          // entry records what actually happened.
          const emailRes = await emailQuoteToCustomer(res.proposalId);

          try {
            await navigator.clipboard?.writeText(url);
          } catch {
            // clipboard not available — non-fatal, the URL is in the toast
          }

          // SMS-share fallback: 80% of lighting installers SMS the link
          // rather than relying on email delivery. Offer one-tap to the
          // native composer if the customer has a phone on file.
          // Normalize: strip everything except digits + leading "+";
          // Android Chrome's intent handler chokes on parens / spaces.
          const rawPhone = selected?.phone ?? "";
          const cleanPhone = rawPhone.replace(/[^\d+]/g, "");
          const smsBody = `Hi ${selected?.name?.split(/\s+/)[0] ?? ""} — your quote: ${url}`;
          const smsHref =
            cleanPhone && cleanPhone.replace(/\D/g, "").length >= 10
              ? `sms:${cleanPhone}?body=${encodeURIComponent(smsBody)}`
              : null;
          const smsAction = smsHref
            ? {
                label: "Text it",
                onClick: () => {
                  if (typeof window !== "undefined") {
                    window.location.href = smsHref;
                  }
                },
              }
            : undefined;

          if ("error" in emailRes) {
            toast.success("Saved + sent. Customer link copied.", {
              description: url,
              action: smsAction,
            });
          } else if (emailRes.delivery === "sent") {
            toast.success("Saved, sent + emailed to customer.", {
              description: `Email delivered. Link also copied: ${url}`,
              action: smsAction,
            });
          } else if (emailRes.delivery === "dry_run") {
            toast.success("Saved + sent. Email previewed (dry-run).", {
              description: `Set RESEND_API_KEY to send for real. Link copied: ${url}`,
              action: smsAction,
            });
          } else {
            const why =
              emailRes.reason === "no_email_on_file"
                ? "no email on file"
                : emailRes.reason === "no_consent"
                  ? "no email consent yet"
                  : emailRes.reason === "opted_out"
                    ? "customer opted out"
                    : emailRes.reason === "quiet_hours"
                      ? "quiet hours"
                      : emailRes.reason === "blocked_day"
                        ? "blocked weekday"
                        : "skipped";
            toast.success("Saved + sent. Customer link copied.", {
              description: `Email skipped (${why}). ${url}`,
              action: smsAction,
            });
          }
        }
      } else {
        toast.success(`Quote drafted for ${selected?.name ?? "customer"}`, {
          description: title,
        });
      }
      router.push("/app/quotes");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await performCreate(false);
  }

  async function handleSubmitAndSend() {
    await performCreate(true);
  }

  if (customers.length === 0) {
    return (
      <div className="g-card p-8 text-center">
        <PenSquare className="mx-auto h-5 w-5 text-g-text-faint" />
        <p className="mt-3 text-[14px] text-g-text">No customers yet.</p>
        <p className="mt-1 text-[12px] text-g-text-muted">
          Add a customer first — quotes attach to a customer.
        </p>
        <Link href="/app/customers/new" prefetch>
          <Button variant="primary" size="md" type="button" className="mt-4">
            Add a customer
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <div className="g-card p-5 flex flex-col gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Customer *
          </label>
          {selected ? (
            <div className="mt-1.5 flex items-center justify-between rounded-md bg-g-surface-2 px-3 py-2">
              <div>
                <div className="text-[14px] font-medium text-g-text">
                  {selected.name}
                </div>
                {selected.subtitle && (
                  <div className="text-[12px] text-g-text-muted">
                    {selected.subtitle}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomerId("");
                  setSearch("");
                }}
                className="text-[12px] text-g-text-muted hover:text-g-text"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, city…"
                autoFocus
                className="mt-1.5"
              />
              <div className="mt-2 g-card max-h-[260px] overflow-y-auto divide-y divide-g-border-subtle bg-g-surface">
                {filtered.length === 0 ? (
                  <div className="px-3 py-3 text-[13px] text-g-text-muted">
                    No customers match.
                  </div>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCustomerId(c.id)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-g-surface-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-g-text truncate">
                          {c.name}
                        </div>
                        {c.subtitle && (
                          <div className="text-[11px] text-g-text-muted truncate">
                            {c.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Title *
            </label>
            <label
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-g-text-faint cursor-pointer select-none hover:text-g-text-muted"
              title="Mark as a test quote (excluded from KPIs and tagged with a chip on the quotes table)."
            >
              <input
                type="checkbox"
                checked={isTest}
                onChange={(e) => setIsTest(e.target.checked)}
                className="h-3 w-3 rounded border-g-border-subtle bg-g-surface accent-g-accent"
              />
              <span>🧪 Test mode</span>
            </label>
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cast LED retrofit · 8 path + 6 up-light"
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Total
            </label>
            {itemsCleaned.length > 0 ? (
              <div className="mt-1.5 flex h-9 items-center justify-between rounded-md bg-g-surface-2 px-3">
                <span className="font-serif text-[18px] tabular-nums text-g-text">
                  ${itemsTotalDollars.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-g-text-faint">
                  Auto-summed
                </span>
              </div>
            ) : (
              <div className="mt-1.5 relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-g-text-muted">
                  $
                </span>
                <Input
                  inputMode="decimal"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="3,250"
                  className="pl-6"
                />
              </div>
            )}
          </div>
          {tenantBilingual && (
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Language
              </label>
              <div className="mt-1.5 flex gap-2">
                {(["en", "es"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={
                      language === l
                        ? "h-9 px-3 rounded-md text-[12px] font-medium bg-g-accent text-black"
                        : "h-9 px-3 rounded-md text-[12px] font-medium bg-g-surface-2 text-g-text-muted hover:text-g-text"
                    }
                  >
                    {l === "en" ? "English" : "Español"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="g-card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Line items (optional)
          </label>
          {items.length > 0 && (
            <span className="text-[11px] font-geist-mono text-g-text-faint">
              Subtotal {fmtMoney(lineItemsTotalCents)}
            </span>
          )}
        </div>
        {items.length === 0 ? (
          <button
            type="button"
            onClick={() => setItems((arr) => [...arr, newLineItem()])}
            className="w-full rounded-md border border-dashed border-g-border-subtle bg-g-surface px-4 py-6 text-center transition-colors hover:bg-g-surface-2 hover:border-g-accent/40"
          >
            <span className="text-[14px] font-medium text-g-text">
              <Plus className="h-3.5 w-3.5 mr-1 inline-block" />
              Add the first line item
            </span>
            <span className="block mt-1 text-[11px] text-g-text-faint">
              Each item shows on the customer&apos;s quote page. Auto-sums into Total.
            </span>
          </button>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((it, idx) => {
              const subtotal = lineSubtotalCents(it);
              return (
                <li
                  key={it.id}
                  className="flex flex-col gap-2 rounded-md bg-g-surface px-3 py-3 md:bg-transparent md:px-0 md:py-0 md:grid md:grid-cols-[1fr_72px_104px_104px_32px] md:gap-2 md:items-start"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-g-text-faint md:hidden">
                      Description
                    </span>
                    <Input
                      value={it.description}
                      onChange={(e) =>
                        setItems((arr) =>
                          arr.map((x, i) =>
                            i === idx ? { ...x, description: e.target.value } : x,
                          ),
                        )
                      }
                      placeholder="Cast LED Path Light · 4W · brass"
                      aria-label={`Line item ${idx + 1} description`}
                    />
                  </div>
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-start gap-2 md:contents">
                    <div className="flex flex-col gap-1 md:contents">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-g-text-faint md:hidden">
                        Qty
                      </span>
                      <Input
                        inputMode="numeric"
                        value={it.qty}
                        onChange={(e) =>
                          setItems((arr) =>
                            arr.map((x, i) =>
                              i === idx ? { ...x, qty: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="1"
                        aria-label={`Line item ${idx + 1} quantity`}
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:contents">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-g-text-faint md:hidden">
                        Each
                      </span>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-g-text-muted">
                          $
                        </span>
                        <Input
                          inputMode="decimal"
                          value={it.unitPrice}
                          onChange={(e) =>
                            setItems((arr) =>
                              arr.map((x, i) =>
                                i === idx ? { ...x, unitPrice: e.target.value } : x,
                              ),
                            )
                          }
                          placeholder="0.00"
                          aria-label={`Line item ${idx + 1} unit price`}
                          className="pl-5"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 md:contents">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-g-text-faint md:hidden">
                        Subtotal
                      </span>
                      <div className="h-9 px-2 rounded-md bg-g-surface-2 flex items-center justify-end font-geist-mono text-[12px] text-g-text">
                        {fmtMoney(subtotal)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setItems((arr) => arr.filter((_, i) => i !== idx));
                        toast("Line removed", {
                          action: {
                            label: "Undo",
                            onClick: () =>
                              setItems((arr) => {
                                const restored = [...arr];
                                restored.splice(idx, 0, it);
                                return restored;
                              }),
                          },
                        });
                      }}
                      aria-label="Remove line item"
                      className="h-9 w-8 inline-flex items-center justify-center rounded-md text-g-text-faint hover:text-g-danger hover:bg-g-surface-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className={items.length === 0 ? "hidden" : ""}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setItems((arr) => [...arr, newLineItem()])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add line item
          </Button>
        </div>
      </div>

      <div className="g-card p-5">
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Notes (optional)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Scope, timing, any caveats. Visible to you; not auto-sent to the customer in this draft path."
          className="mt-1.5"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="submit"
          disabled={busy || !customerId || !title.trim()}
          className="text-[12px] text-g-text-faint underline-offset-4 hover:text-g-text hover:underline disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save as draft instead"}
        </button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleSubmitAndSend}
          disabled={busy || !customerId || !title.trim()}
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              {selected?.name
                ? `Send to ${selected.name.split(/\s+/)[0]}`
                : "Send quote"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
