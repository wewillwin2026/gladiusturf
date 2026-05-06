"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, PenSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { createDraftQuote } from "../actions";

type CustomerOption = { id: string; name: string; subtitle: string };

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      const totalDollars = Number.parseFloat(total);
      const res = await createDraftQuote({
        customerId,
        title,
        totalDollars: Number.isFinite(totalDollars) ? totalDollars : 0,
        language,
        notes: notes || null,
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
      toast.success(`Quote drafted for ${selected?.name ?? "customer"}`, {
        description: title,
      });
      router.push("/app/quotes");
      router.refresh();
    } finally {
      setBusy(false);
    }
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
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Title *
          </label>
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
              Total ($)
            </label>
            <Input
              inputMode="decimal"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="3,250"
              className="mt-1.5"
            />
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

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/app/quotes")}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={busy || !customerId || !title.trim()}
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <PenSquare className="h-3.5 w-3.5" />
              Save draft
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
