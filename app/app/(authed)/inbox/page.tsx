import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/ui/KPICard";
import { InboxBrowser } from "@/components/app/InboxBrowser";
import { demoState } from "@/lib/demo/state";

export const dynamic = "force-dynamic";

export default function InboxPage() {
  const state = demoState();
  const unread = state.messages.filter((m) => !m.read && m.direction === "in").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cypress Lawn"
        title="Inbox"
        subtitle="Unified SMS · email · voice transcripts · portal. Reply on any channel."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Unread" value={String(unread)} delta="+4 today" trend="up" />
        <KPICard label="Avg. response" value="1m 12s" delta="−18s" trend="down" />
        <KPICard
          label="SMS · this week"
          value={String(state.messages.filter((m) => m.channel === "sms").slice(0, 60).length)}
          trend="flat"
        />
        <KPICard
          label="Voice · this week"
          value={String(state.messages.filter((m) => m.channel === "voice").slice(0, 60).length)}
          trend="flat"
        />
      </section>

      <InboxBrowser
        messages={state.messages}
        customers={state.customers}
      />
    </div>
  );
}
