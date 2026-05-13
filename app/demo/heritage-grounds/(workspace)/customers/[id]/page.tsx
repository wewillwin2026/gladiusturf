import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList, MapPin, User } from "lucide-react";
import {
  PROJECTS,
  STAGE_LABEL,
  customerById,
} from "@/lib/demo-data/heritage-grounds";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = customerById(id);
  if (!customer) notFound();

  const projects = PROJECTS.filter((p) => p.customerName === customer.name);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/demo/heritage-grounds/customers"
        className="inline-flex items-center gap-1.5 text-[12px]"
        style={{ color: "var(--hg-text-muted)" }}
      >
        <ArrowLeft className="h-3 w-3" /> All customers
      </Link>

      <header className="flex flex-col gap-2">
        <span className="hg-eyebrow-muted">Customer · {customer.id}</span>
        <h1
          className="hg-serif text-[28px] leading-[1.1]"
          style={{ color: "var(--hg-text)" }}
        >
          {customer.name}
        </h1>
        <p className="text-[13px]" style={{ color: "var(--hg-text-muted)" }}>
          {customer.address} · {customer.zip}
        </p>
        {customer.notes && (
          <p
            className="rounded-md px-3 py-2 text-[12px]"
            style={{
              background: "rgba(217,131,106,0.08)",
              border: "1px solid rgba(217,131,106,0.30)",
              color: "var(--hg-text-muted)",
            }}
          >
            <strong style={{ color: "var(--hg-text)" }}>Note:</strong>{" "}
            {customer.notes}
          </p>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Fact icon={User} label="Primary designer" value={customer.primaryDesigner} />
        <Fact icon={MapPin} label="Address" value={`${customer.address} · ${customer.zip}`} />
        <Fact
          icon={ClipboardList}
          label="Lifetime revenue"
          value={`$${customer.lifetimeRevenue.toLocaleString()}`}
        />
      </section>

      <section className="hg-card overflow-hidden">
        <header className="border-b border-hg-border-strong px-5 py-3" style={{ borderColor: "var(--hg-border)" }}>
          <h2 className="hg-eyebrow">Project history</h2>
        </header>
        {projects.length === 0 ? (
          <p className="px-5 py-6 text-[13px]" style={{ color: "var(--hg-text-muted)" }}>
            No projects on file yet.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--hg-border)" }}>
            {projects.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-1 px-5 py-3 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-4"
              >
                <div>
                  <div style={{ color: "var(--hg-text)" }}>{p.scope}</div>
                  <div className="text-[11px]" style={{ color: "var(--hg-text-faint)" }}>
                    {p.startDate ? `Started ${p.startDate}` : "Not yet started"}
                    {p.estCompleteDate && ` · est. complete ${p.estCompleteDate}`}
                  </div>
                </div>
                <span
                  className="hg-pill"
                  style={{
                    color: "var(--hg-accent)",
                    background: "rgba(217,131,106,0.08)",
                    borderColor: "rgba(217,131,106,0.30)",
                  }}
                >
                  {STAGE_LABEL[p.stage]}
                </span>
                <span className="hg-mono text-right" style={{ color: "var(--hg-text)" }}>
                  {money(p.contractedCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type LucideLikeIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideLikeIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="hg-card flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--hg-accent)" }} />
        <span
          className="text-[10px] uppercase tracking-[0.16em]"
          style={{ color: "var(--hg-text-faint)" }}
        >
          {label}
        </span>
      </div>
      <div className="hg-serif text-[16px]" style={{ color: "var(--hg-text)" }}>
        {value}
      </div>
    </div>
  );
}
