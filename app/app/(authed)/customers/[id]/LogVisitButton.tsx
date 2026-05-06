"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/app/ui/Dialog";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { logServiceVisit } from "./actions";

const VISIT_TYPES = [
  { value: "service", label: "Service / maintenance" },
  { value: "install", label: "Install" },
  { value: "warranty", label: "Warranty visit" },
  { value: "storm_response", label: "Storm response" },
  { value: "inspection", label: "Inspection" },
] as const;

type VisitType = (typeof VISIT_TYPES)[number]["value"];

function localDatetimeNow(): string {
  // datetime-local needs `YYYY-MM-DDTHH:mm` in local time, no timezone
  // suffix. The Date constructor converts to UTC under the hood, so we
  // hand-pad each component to avoid TZ drift.
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function LogVisitButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [type, setType] = React.useState<VisitType>("service");
  const [title, setTitle] = React.useState("");
  const [startsAt, setStartsAt] = React.useState(localDatetimeNow());
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setType("service");
      setTitle("");
      setStartsAt(localDatetimeNow());
      setNotes("");
      setBusy(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!title.trim()) {
      toast.error("Add a short title for this visit.");
      return;
    }
    setBusy(true);
    try {
      const res = await logServiceVisit({
        customerId,
        type,
        title,
        startsAt,
        notes: notes || null,
      });
      if ("error" in res) {
        toast.error(
          res.error === "not_found_in_tenant"
            ? "Customer not in your workspace."
            : "Could not log the visit. Try again.",
        );
        return;
      }
      toast.success(`Logged: ${title}`, {
        description: `${customerName} · ${new Date(startsAt).toLocaleDateString()}`,
      });
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={() => setOpen(true)}
      >
        <Calendar className="h-3.5 w-3.5" />
        Log a visit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader
            title={`Log a visit · ${customerName}`}
            description="Service history, scheduled drops, warranty touches, storm response — all live in one timeline."
          />
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Type
              </label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {VISIT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={
                      type === t.value
                        ? "h-8 px-3 rounded-md text-[12px] font-medium bg-g-accent text-black"
                        : "h-8 px-3 rounded-md text-[12px] font-medium bg-g-surface-2 text-g-text-muted hover:text-g-text"
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Re-aimed all path lights, replaced two MR16 LEDs"
                autoFocus
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                When
              </label>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-1.5"
              />
              <p className="mt-1 text-[11px] text-g-text-faint">
                Past dates log as <strong className="text-g-text-muted">completed</strong>; future
                dates log as <strong className="text-g-text-muted">scheduled</strong>.
              </p>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What did you find, what did you do, what should the next visit watch for?"
                className="mt-1.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={busy || !title.trim()}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Logging…
                  </>
                ) : (
                  <>
                    <Calendar className="h-3.5 w-3.5" />
                    Log visit
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
