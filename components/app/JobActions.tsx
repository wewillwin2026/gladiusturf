"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, MessageSquare, Receipt } from "lucide-react";
import { Button } from "./ui/Button";
import type { JobStatus } from "@/lib/shared/types";

export function JobActions({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const [completed, setCompleted] = React.useState(status === "Complete");

  function markComplete() {
    setCompleted(true);
    toast.success("Job marked complete", {
      description: `Invoice ${jobId.replace("jb_", "INV-")} drafted · customer notified via portal.`,
    });
  }

  function notifyCustomer() {
    toast.success("Customer notified", {
      description: "SMS sent: 'Crew is wrapping up your visit. Photos in your portal.'",
    });
  }

  function generateInvoice() {
    toast.success("Invoice generated", {
      description: "Sent to customer for review.",
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={notifyCustomer}>
        <MessageSquare className="h-3.5 w-3.5" />
        Notify
      </Button>
      <Button variant="secondary" onClick={generateInvoice}>
        <Receipt className="h-3.5 w-3.5" />
        Invoice
      </Button>
      <Button
        variant={completed ? "secondary" : "primary"}
        onClick={markComplete}
        disabled={completed}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {completed ? "Completed" : "Mark complete"}
      </Button>
    </div>
  );
}
