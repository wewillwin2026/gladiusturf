"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { markQuoteSent } from "../draft/actions";

export function MarkSentButton({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  async function handleClick() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await markQuoteSent(proposalId);
      if ("error" in res) {
        toast.error("Could not flip status to sent.");
        return;
      }
      toast.success("Quote marked as sent — customer link is live.", {
        description: `/quote/${proposalId}`,
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="inline-flex items-center gap-1 text-[11px] text-g-accent hover:underline font-medium disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
      Mark as sent
    </button>
  );
}
