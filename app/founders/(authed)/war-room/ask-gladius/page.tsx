import { PageHeader } from "@/components/app/PageHeader";
import { AskGladius } from "@/components/app/AskGladius";

export const dynamic = "force-dynamic";

export default function AskGladiusFoundersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="War Room · Live AI"
        title="Ask Gladius"
        subtitle="Same surface as the demo CRM, but the snapshot is your own real Supabase data — demo bookings, real Stripe receipts, real funnel events. Phase 6 wires the real-data snapshot; for now Cypress Lawn data fills in."
      />
      <AskGladius variant="page" product="founders" />
    </div>
  );
}
