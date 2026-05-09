"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { updateReviewUrl } from "../actions";

/**
 * Small inline form on /app/settings to edit tenants.review_url. The
 * value is substituted into the {review_url} token in the review-ask
 * SMS body and the auto-review-ask cron email. Empty input clears the
 * column and the system falls back to the placeholder URL.
 */
export function ReviewUrlForm({ initial }: { initial: string | null }) {
  const [value, setValue] = React.useState(initial ?? "");
  const [pending, startTransition] = React.useTransition();
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  const dirty = (initial ?? "") !== value;

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const result = await updateReviewUrl(fd);
          if ("ok" in result) {
            setSavedAt(Date.now());
            toast.success(value.length > 0 ? "Review URL saved" : "Review URL cleared");
          } else if (result.error === "must_be_https") {
            toast.error("URL must start with https://");
          } else if (result.error === "too_long") {
            toast.error("URL is too long (max 1024 chars)");
          } else if (result.error === "column_not_ready") {
            toast.error(
              "Migration not applied yet — email founders@gladiusturf.com",
            );
          } else {
            toast.error("Save failed — try again");
          }
        })
      }
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-g-accent" />
        <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Google review URL
        </span>
      </div>
      <p className="text-[12px] text-g-text-muted leading-relaxed">
        The link customers tap to leave you a Google review. Substituted
        into the <code className="font-geist-mono">{"{review_url}"}</code>{" "}
        token in review-ask SMS and email. Find it in your Google
        Business Profile under <em>Get more reviews</em>.
      </p>
      <div className="flex gap-2">
        <input
          name="review_url"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://g.page/r/..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[13px] text-g-text placeholder:text-g-text-faint focus:border-g-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !dirty}
          className="rounded-md bg-g-accent px-4 py-2 text-[12px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {savedAt !== null && !dirty && (
        <span className="text-[11px] text-g-accent">Saved.</span>
      )}
      {!savedAt && initial === null && (
        <span className="text-[11px] text-g-text-faint italic">
          Currently using placeholder URL — review-asks will look broken
          until you set this.
        </span>
      )}
    </form>
  );
}
