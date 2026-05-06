"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";

/**
 * Activate button — currently a confirmation toast that explains what would
 * happen if the user proceeded. Wired to a real campaign-queue server action
 * once the messaging-cadence engine ships behind the canSend() consent gate.
 */
export function StormActivateButton({
  inStormCount,
  guardianCount,
}: {
  inStormCount: number;
  guardianCount: number;
}) {
  const [busy, setBusy] = React.useState(false);

  function handleActivate() {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.info("Storm Mode preview", {
        description: `Would queue ${inStormCount} bilingual check-ins (${guardianCount} priority). Send pipeline ships behind the consent gate; until then, this is preview only.`,
      });
    }, 600);
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={handleActivate}
      disabled={busy || inStormCount === 0}
    >
      {busy ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Arming…
        </>
      ) : (
        <>
          <Send className="h-3.5 w-3.5" />
          Preview activate
        </>
      )}
    </Button>
  );
}
