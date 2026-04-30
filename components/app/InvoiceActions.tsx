"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, FileText, Mail, RotateCcw } from "lucide-react";
import { Button } from "./ui/Button";
import type { InvoiceStatus } from "@/lib/shared/types";

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const [paid, setPaid] = React.useState(status === "Paid");

  function sendReminder() {
    toast.success("Reminder sent", {
      description: `${invoiceId} · SMS + email · same template as last reminder.`,
    });
  }

  function markPaid() {
    setPaid(true);
    toast.success("Marked paid", {
      description: `${invoiceId} · reconciled to QuickBooks.`,
    });
  }

  function void_() {
    toast.warning("Invoice voided", {
      description: `${invoiceId} · removed from AR aging.`,
    });
  }

  function downloadPDF() {
    toast.success("PDF downloaded");
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="secondary" onClick={downloadPDF}>
        <FileText className="h-3.5 w-3.5" />
        PDF
      </Button>
      {(status === "Sent" || status === "Overdue") && (
        <Button variant="secondary" onClick={sendReminder}>
          <Mail className="h-3.5 w-3.5" />
          Send reminder
        </Button>
      )}
      {status !== "Void" && status !== "Paid" && (
        <Button variant="ghost" onClick={void_}>
          <RotateCcw className="h-3.5 w-3.5" />
          Void
        </Button>
      )}
      <Button
        variant={paid ? "secondary" : "primary"}
        onClick={markPaid}
        disabled={paid}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {paid ? "Paid" : "Mark paid"}
      </Button>
    </div>
  );
}
