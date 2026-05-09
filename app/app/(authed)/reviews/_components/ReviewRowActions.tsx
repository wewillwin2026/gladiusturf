"use client";

import * as React from "react";
import { Flag, MessageSquare, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/app/ui/Button";
import { Textarea } from "@/components/app/ui/Input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/app/ui/Dialog";
import {
  deleteReview,
  markReviewSpam,
  replyToReview,
  unmarkSpam,
} from "../actions";

/**
 * Per-row action group. Variant decides which buttons render:
 *   - "published": Reply, Mark spam, Delete
 *   - "spam":      Mark legit, Delete
 *
 * Reply lives behind a dialog; the rest are immediate one-click
 * server-action calls (no confirm — actions are reversible except
 * delete, which we guard with a native confirm()).
 */
export function ReviewRowActions({
  reviewId,
  variant,
  replyBody,
}: {
  reviewId: string;
  variant: "published" | "spam";
  replyBody: string | null;
}) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function handleSpam() {
    setError(null);
    const fd = new FormData();
    fd.set("id", reviewId);
    startTransition(async () => {
      const r = await markReviewSpam(fd);
      if ("error" in r) setError(r.error);
    });
  }

  function handleUnspam() {
    setError(null);
    const fd = new FormData();
    fd.set("id", reviewId);
    startTransition(async () => {
      const r = await unmarkSpam(fd);
      if ("error" in r) setError(r.error);
    });
  }

  function handleDelete() {
    if (!confirm("Hard-delete this review? This cannot be undone.")) return;
    setError(null);
    const fd = new FormData();
    fd.set("id", reviewId);
    startTransition(async () => {
      const r = await deleteReview(fd);
      if ("error" in r) setError(r.error);
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {variant === "published" && (
        <ReplyDialog reviewId={reviewId} initial={replyBody} />
      )}
      {variant === "published" ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSpam}
          disabled={pending}
          title="Mark as spam"
        >
          <Flag className="h-3.5 w-3.5" />
          Spam
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUnspam}
          disabled={pending}
          title="Mark as legit"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Legit
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={pending}
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      {error && <span className="text-[11px] text-g-danger">{error}</span>}
    </div>
  );
}

function ReplyDialog({
  reviewId,
  initial,
}: {
  reviewId: string;
  initial: string | null;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("id", reviewId);
    const r = await replyToReview(fd);
    setPending(false);
    if ("error" in r) {
      setError(r.error);
      return;
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <MessageSquare className="h-3.5 w-3.5" />
          {initial ? "Edit reply" : "Reply"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          title={initial ? "Edit your reply" : "Reply publicly"}
          description="Saved here for now — once Google Business Profile is connected, replies post to the original review."
        />
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Textarea
            name="reply_body"
            required
            rows={5}
            defaultValue={initial ?? ""}
            placeholder="Thanks for the kind words..."
          />
          {error && <span className="text-[12px] text-g-danger">{error}</span>}
          <div className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="sm" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={pending}
            >
              {pending ? "Saving..." : "Save reply"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
