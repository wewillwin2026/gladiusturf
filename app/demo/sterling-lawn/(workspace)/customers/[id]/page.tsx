import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Beaker,
  Calendar,
  CircleDollarSign,
  MapPin,
  Repeat,
} from "lucide-react";
import {
  CHEMICAL_APPS,
  CLUSTERS,
  PLANS,
  colorForCluster,
  customerById,
} from "@/lib/demo-data/sterling-lawn";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = customerById(id);
  if (!customer) notFound();

  const cluster = CLUSTERS.find((c) => c.id === customer.cluster);
  const plan = PLANS.find((p) =>
    customer.plan.toLowerCase().includes(p.name.toLowerCase().split(" ")[0]),
  );

  const customerApps = CHEMICAL_APPS.filter(
    (a) => a.customerId === customer.id,
  );

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/demo/sterling-lawn/customers"
        className="inline-flex items-center gap-1.5 text-[12px]"
        style={{ color: "var(--sl-text-muted)" }}
      >
        <ArrowLeft className="h-3 w-3" /> Back to customers
      </Link>

      <header className="flex flex-col gap-2">
        <span className="sl-eyebrow-muted">Customer · {customer.id}</span>
        <h1
          className="sl-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--sl-text)" }}
        >
          {customer.name}
        </h1>
        <p
          className="text-[13px]"
          style={{ color: "var(--sl-text-muted)" }}
        >
          {customer.address} · {customer.zip}
        </p>
        {customer.notes && (
          <p
            className="rounded-md px-3 py-2 text-[12px]"
            style={{
              background: "rgba(244,184,96,0.08)",
              border: "1px solid rgba(244,184,96,0.30)",
              color: "var(--sl-text-muted)",
            }}
          >
            <strong style={{ color: "var(--sl-text)" }}>Note:</strong>{" "}
            {customer.notes}
          </p>
        )}
      </header>

      {/* Quick facts */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FactCard
          icon={MapPin}
          label="Route"
          value={
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: colorForCluster(customer.cluster) }}
              />
              {cluster?.weekday} · {cluster?.name}
            </span>
          }
        />
        <FactCard
          icon={Repeat}
          label="Plan"
          value={customer.plan}
          sub={plan ? `$${plan.monthlyPrice}/mo` : undefined}
        />
        <FactCard
          icon={CircleDollarSign}
          label="Lifetime revenue"
          value={`$${customer.lifetimeRevenue.toLocaleString()}`}
          sub={`$${customer.monthlyValue}/mo current`}
        />
        <FactCard
          icon={Calendar}
          label="Next service"
          value={customer.nextService}
          sub={`Last: ${customer.lastService}`}
        />
      </section>

      {/* Recent applications for this property */}
      <section className="sl-card flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Beaker className="h-4 w-4" style={{ color: "var(--sl-accent)" }} />
          <span className="sl-eyebrow">Chemical applications on this property</span>
        </div>
        {customerApps.length === 0 ? (
          <p
            className="text-[13px]"
            style={{ color: "var(--sl-text-muted)" }}
          >
            No applications recorded in the last 30 days.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {customerApps.map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-1 gap-1 rounded-md px-3 py-2 text-[12px] md:grid-cols-[1fr_auto_auto] md:items-center md:gap-3"
                style={{ background: "rgba(0,0,0,0.18)" }}
              >
                <div>
                  <div style={{ color: "var(--sl-text)" }}>
                    {a.productName}
                  </div>
                  <div style={{ color: "var(--sl-text-faint)" }}>
                    EPA #{a.productEpaNo} · {a.rate} · {a.applicator}
                  </div>
                </div>
                <span
                  className="sl-pill"
                  style={{ color: "var(--sl-text-muted)" }}
                >
                  {a.category}
                </span>
                <span
                  className="sl-mono text-right"
                  style={{ color: "var(--sl-text-faint)" }}
                >
                  {a.date}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--sl-text-faint)" }}
      >
        Sales demo. Customer data is fictional and used only to show how
        Gladius organizes a real lawn-care book.
      </p>
    </div>
  );
}

type LucideLikeIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

function FactCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideLikeIcon;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="sl-card flex flex-col gap-1.5 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--sl-accent)" }} />
        <span
          className="text-[10px] uppercase tracking-[0.16em]"
          style={{ color: "var(--sl-text-faint)" }}
        >
          {label}
        </span>
      </div>
      <div
        className="sl-serif text-[18px] leading-tight"
        style={{ color: "var(--sl-text)" }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="text-[11px]"
          style={{ color: "var(--sl-text-muted)" }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
