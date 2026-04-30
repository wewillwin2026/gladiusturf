import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  FlaskConical,
  MapPin,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusPill } from "@/components/app/ui/StatusPill";
import { JobActions } from "@/components/app/JobActions";
import { demoState } from "@/lib/demo/state";
import { money, shortDate, timeOfDay } from "@/lib/shared/format";

export const dynamic = "force-dynamic";

const PHOTO_PAIRS = [
  ["photo-1558904541-efa843a96f01", "photo-1558904541-efa843a96f01"],
  ["photo-1416879595882-3373a0480b5b", "photo-1592595896616-c37162298647"],
  ["photo-1530973428-5bf2db2e4d71", "photo-1416879595882-3373a0480b5b"],
];

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = demoState();
  const job = state.jobs.find((j) => j.id === id);
  if (!job) notFound();

  const customer = state.customers.find((c) => c.id === job.customerId);
  const crew = state.crews.find((c) => c.id === job.crewId);
  if (!customer || !crew) notFound();

  const tone =
    job.status === "Complete" || job.status === "OnSite"
      ? "accent"
      : job.status === "EnRoute"
        ? "info"
        : job.status === "Skipped" || job.status === "Rescheduled"
          ? "warning"
          : "neutral";

  // Crew check-in timestamps (simulated relative to scheduledAt).
  const sched = new Date(job.scheduledAt);
  const enRoute = new Date(sched.getTime() - 12 * 60_000);
  const arrived = new Date(sched.getTime() + 4 * 60_000);
  const completed = new Date(sched.getTime() + job.durationMin * 60_000);

  const showCompleted = job.status === "Complete";
  const showOnsite = job.status === "OnSite" || job.status === "Complete";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/jobs"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to jobs
      </Link>

      <PageHeader
        eyebrow={`${shortDate(job.scheduledAt)} · ${timeOfDay(job.scheduledAt)}`}
        title={`${job.service} · ${customer.name}`}
        subtitle={
          <span className="inline-flex items-center gap-3 text-[12px]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {customer.address}, {customer.city} {customer.zip}
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3 w-3" />
              {crew.name} · {crew.vehiclePlate}
            </span>
            <StatusPill tone={tone}>{job.status}</StatusPill>
          </span>
        }
        actions={<JobActions jobId={job.id} status={job.status} />}
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="g-card p-5">
            <div className="flex items-baseline justify-between">
              <h2>Crew check-in</h2>
              <span className="font-geist-mono text-[10px] text-g-text-faint">
                {crew.name}
              </span>
            </div>
            <ol className="mt-4 flex flex-col gap-3">
              <CheckIn
                label="En-route"
                ts={enRoute.toISOString()}
                done
                detail={`Left from ${crew.vehiclePlate} yard`}
              />
              <CheckIn
                label="Arrived on site"
                ts={showOnsite ? arrived.toISOString() : null}
                done={showOnsite}
                detail={`GPS clock-in · ${customer.address.split(",")[0]}`}
              />
              <CheckIn
                label="Completed"
                ts={showCompleted ? completed.toISOString() : null}
                done={showCompleted}
                detail={`Duration ${job.durationMin}m · ${money(job.priceCents)} invoiced`}
              />
            </ol>
          </div>

          <div className="g-card p-5">
            <div className="flex items-baseline justify-between">
              <h2>Before / after</h2>
              <span className="text-[11px] text-g-text-faint">
                Auto-uploaded by crew lead
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {PHOTO_PAIRS.map(([before, after], idx) => (
                <React.Fragment key={idx}>
                  <PhotoTile id={before} label="BEFORE" />
                  <PhotoTile id={after} label="AFTER" />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="g-card p-5">
            <h2>Materials</h2>
            <ul className="mt-3 flex flex-col gap-2 text-[12px]">
              <Material name="Lesco 24-0-11 Pre-emerge" qty="42 lbs" tone="accent" />
              <Material name="Bifenthrin 7.9% EC" qty="6 oz" tone="info" />
              <Material name="Spreader-Sticker" qty="2 oz" tone="info" />
              <Material name="Mulch · cypress brown" qty="0.5 yd" tone="neutral" />
            </ul>
          </div>

          <div className="g-card p-5">
            <h2>Customer signature</h2>
            <div className="mt-3 h-32 rounded-md border border-g-border bg-g-surface-2/40 flex items-end justify-end p-3 relative overflow-hidden">
              <svg
                viewBox="0 0 200 80"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M 20 50 Q 40 20 60 50 T 100 50 Q 120 25 145 55 T 180 45"
                  fill="none"
                  stroke="var(--g-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="relative font-geist-mono text-[10px] text-g-text-faint">
                {showCompleted
                  ? `Signed ${timeOfDay(completed.toISOString())}`
                  : "Awaiting signature"}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-g-text-muted">
              {customer.name} confirmed work complete to spec.
            </p>
          </div>

          <div className="g-card p-5">
            <h2>Activity</h2>
            <ul className="mt-3 flex flex-col gap-2 text-[12px]">
              <li className="flex items-center justify-between text-g-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Camera className="h-3 w-3 text-g-accent" />
                  6 photos uploaded
                </span>
                <span className="text-g-text-faint font-geist-mono">
                  {timeOfDay(arrived.toISOString())}
                </span>
              </li>
              <li className="flex items-center justify-between text-g-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <FlaskConical className="h-3 w-3 text-g-info" />
                  4 chemical applications logged
                </span>
                <span className="text-g-text-faint font-geist-mono">
                  {timeOfDay(arrived.toISOString())}
                </span>
              </li>
              <li className="flex items-center justify-between text-g-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-g-text-muted" />
                  GPS clock-out
                </span>
                <span className="text-g-text-faint font-geist-mono">
                  {showCompleted
                    ? timeOfDay(completed.toISOString())
                    : "—"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function CheckIn({
  label,
  ts,
  done,
  detail,
}: {
  label: string;
  ts: string | null;
  done: boolean;
  detail: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={
          done
            ? "h-6 w-6 rounded-full bg-g-accent text-black inline-flex items-center justify-center"
            : "h-6 w-6 rounded-full border border-g-border-subtle text-g-text-faint inline-flex items-center justify-center"
        }
      >
        {done ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      </span>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className={done ? "text-g-text" : "text-g-text-muted"}>{label}</span>
          <span className="font-geist-mono text-[11px] text-g-text-faint">
            {ts ? timeOfDay(ts) : "—"}
          </span>
        </div>
        <div className="text-[11px] text-g-text-faint">{detail}</div>
      </div>
    </li>
  );
}

function PhotoTile({ id, label }: { id: string; label: string }) {
  return (
    <div className="relative aspect-square rounded-md overflow-hidden border border-g-border-subtle bg-g-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`}
        alt=""
        className="w-full h-full object-cover"
      />
      <span className="absolute top-2 left-2 font-geist-mono text-[9px] uppercase tracking-[0.18em] bg-black/70 text-white border border-white/10 rounded px-1.5 py-0.5">
        {label}
      </span>
    </div>
  );
}

function Material({
  name,
  qty,
  tone,
}: {
  name: string;
  qty: string;
  tone: "accent" | "info" | "neutral";
}) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="text-g-text truncate">{name}</span>
      <StatusPill tone={tone}>{qty}</StatusPill>
    </li>
  );
}
