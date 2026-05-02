import { ComingSoonCard } from "../../ComingSoonCard";

export const dynamic = "force-dynamic";

export default function QuickBooksPage() {
  return (
    <ComingSoonCard
      title="QuickBooks Sync"
      badge="Coming Q3 2026"
      description="Two-way sync with QuickBooks Online. Customers, invoices, payments, and payroll entries reconcile automatically. Your books stay your books — your accountant doesn't have to learn anything new."
      bullets={[
        "Connect your QuickBooks Online account in two clicks",
        "Invoices sync as they're issued · payments as they clear",
        "Maintenance plan recurring revenue posts on schedule",
      ]}
    />
  );
}
