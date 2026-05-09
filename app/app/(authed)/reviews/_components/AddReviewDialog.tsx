"use client";

import * as React from "react";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/app/ui/Dialog";
import { addReview } from "../actions";

/**
 * Manual review entry — Cristian uses this to backfill the 171 Google
 * reviews while we wait on the GBP integration. Validation is server-
 * side via the action; this dialog is a thin shell.
 */
export function AddReviewDialog() {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await addReview(fd);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Plus className="h-3.5 w-3.5" />
          Add review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          title="Backfill a review"
          description="Paste the review body. Spam-suspect rows land in moderation instead of the published feed."
        />
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Source
              </span>
              <select
                name="source"
                required
                defaultValue="google"
                className="h-9 rounded-md bg-g-surface border border-g-border px-3 text-[13px] text-g-text"
              >
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
                <option value="yelp">Yelp</option>
                <option value="nextdoor">Nextdoor</option>
                <option value="manual">Manual / Other</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Rating
              </span>
              <select
                name="rating"
                required
                defaultValue="5"
                className="h-9 rounded-md bg-g-surface border border-g-border px-3 text-[13px] text-g-text"
              >
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Reviewer name
            </span>
            <Input name="reviewer_name" required placeholder="Jane M." />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Review body
            </span>
            <Textarea
              name="body"
              required
              rows={5}
              placeholder="Paste the review text here..."
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Source URL (optional)
              </span>
              <Input
                name="source_url"
                type="url"
                placeholder="https://g.page/..."
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Submitted at (optional)
              </span>
              <Input name="submitted_at" type="date" />
            </label>
          </div>
          {error && (
            <div className="text-[12px] text-g-danger">
              <Star className="inline h-3 w-3 mr-1" />
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="ghost" size="sm" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="primary" size="sm" type="submit" disabled={pending}>
              {pending ? "Adding..." : "Add review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
