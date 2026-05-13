import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { JOBS, STAGE_LABEL, customerById } from "@/lib/demo-data/timbercare";

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
  const jobs = JOBS.filter((j) => j.customerName === customer.name);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/demo/timbercare/customers"
        className="inline-flex items-center gap-1.5 text-[12px]"
        style={{ color: "var(--tc-text-muted)" }}
      >
        <ArrowLeft className="h-3 w-3" /> All customers
      </Link>

      <header className="flex flex-col gap-2">
        <span className="tc-eyebrow-muted">Customer · {customer.id}</span>
        <h1 className="tc-serif text-[28px] leading-[1.1]" style={{ color: "var(--tc-text)" }}>
          {customer.name}
        </h1>
        <p className="text-[13px]" style={{ color: "var(--tc-text-muted)" }}>
          {customer.address} · {customer.zip} · {customer.customerKind}
        </p>
        {customer.coiOnFile && (
          <p
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12px]"
            style={{
              background: "rgba(110,155,90,0.08)",
              border: "1px solid rgba(110,155,90,0.30)",
              color: "var(--tc-text)",
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--tc-leaf)" }} />
            COI on file · expires {customer.coiExpiry}
          </p>
        )}
        {customer.notes && (
          <p
            className="rounded-md px-3 py-2 text-[12px]"
            style={{
              background: "rgba(180,138,75,0.08)",
              border: "1px solid rgba(180,138,75,0.30)",
              color: "var(--tc-text-muted)",
            }}
          >
            <strong style={{ color: "var(--tc-text)" }}>Note:</strong>{" "}
            {customer.notes}
          </p>
        )}
      </header>

      <section className="tc-card overflow-hidden">
        <header className="border-b px-5 py-3" style={{ borderColor: "var(--tc-border)" }}>
          <h2 className="tc-eyebrow">Job history</h2>
        </header>
        {jobs.length === 0 ? (
          <p className="px-5 py-6 text-[13px]" style={{ color: "var(--tc-text-muted)" }}>
            No jobs on file yet.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--tc-border)" }}>
            {jobs.map((j) => (
              <li
                key={j.id}
                className="grid grid-cols-1 gap-1 px-5 py-3 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-4"
              >
                <div>
                  <div style={{ color: "var(--tc-text)" }}>{j.scope}</div>
                  <div className="text-[11px]" style={{ color: "var(--tc-text-faint)" }}>
                    {j.isaArboristName} · ISA-cert ·{" "}
                    {j.estStartDate ? `start ${j.estStartDate}` : "not scheduled"}
                  </div>
                </div>
                <span
                  className="tc-pill"
                  style={{
                    color: "var(--tc-accent)",
                    background: "rgba(180,138,75,0.08)",
                    borderColor: "rgba(180,138,75,0.30)",
                  }}
                >
                  {STAGE_LABEL[j.stage]}
                </span>
                <span className="tc-mono text-right" style={{ color: "var(--tc-text)" }}>
                  {money(j.contractedCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
