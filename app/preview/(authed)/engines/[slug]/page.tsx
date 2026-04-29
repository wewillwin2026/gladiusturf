import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { ENGINES } from "@/content/engines";
import { ENGINE_TIERS } from "@/content/engine-tiers";
import { mockUiFor, type EngineMockRow } from "./mock-ui";

export const dynamic = "force-static";

export function generateStaticParams() {
  return ENGINES.map((engine) => ({ slug: engine.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const engine = ENGINES.find((e) => e.slug === slug);
  if (!engine) return { title: "Engine · GladiusTurf" };
  return {
    title: `${engine.name} · GladiusTurf`,
    robots: { index: false, follow: false },
  };
}

const accentText: Record<string, string> = {
  moss: "text-moss-bright",
  honey: "text-honey-bright",
  champagne: "text-champagne-bright",
};

const accentBg: Record<string, string> = {
  moss: "bg-moss-bright/10",
  honey: "bg-honey-bright/10",
  champagne: "bg-champagne-bright/10",
};

export default async function EnginePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const engine = ENGINES.find((e) => e.slug === slug);
  if (!engine) notFound();

  const tier = ENGINE_TIERS.find((t) => t.slug === engine.tier);
  const accent = tier?.accent ?? "moss";

  const tierEngines = ENGINES.filter((e) => e.tier === engine.tier);
  const idx = tierEngines.findIndex((e) => e.slug === engine.slug);
  const prev = idx > 0 ? tierEngines[idx - 1] : null;
  const next = idx >= 0 && idx < tierEngines.length - 1 ? tierEngines[idx + 1] : null;
  const related = ENGINES.filter(
    (e) => e.tier === engine.tier && e.slug !== engine.slug,
  ).slice(0, 3);

  const mock = mockUiFor(engine.slug, engine.tier);

  return (
    <div className="flex flex-col gap-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-bone/45">
        <Link href="/preview" className="hover:text-bone/80">
          Dashboard
        </Link>
        <span>/</span>
        <span className={accentText[accent]}>{tier?.name ?? "Engine"}</span>
        <span>/</span>
        <span className="text-bone/80">{engine.name}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-bone/40">
            ENGINE {engine.number}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${accentBg[accent]} ${accentText[accent]}`}
          >
            {tier?.name}
          </span>
        </div>
        <h1 className="font-serif text-5xl tracking-[-0.02em] text-bone">
          {engine.name}
        </h1>
        <p
          className={`text-base font-semibold ${accentText[accent]}`}
        >
          {engine.outcome}
        </p>
        <p className="max-w-3xl text-[16px] leading-[1.6] text-bone/70">
          {engine.description}
        </p>
      </header>

      {/* Status row */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-moss/30 bg-moss/[0.05] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-bright opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-bright"></span>
          </span>
          <span className="text-sm font-medium text-bone">
            Live in your shop
          </span>
        </div>
        <span className="text-bone/30">|</span>
        <span className="text-[13px] text-bone/65">
          Last fired <strong className="text-bone">12 min ago</strong>
        </span>
        <span className="text-bone/30">|</span>
        <span className="text-[13px] text-bone/65">
          {mock.todayFires} fires today · {mock.weeklyFires} this week
        </span>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-champagne/30 bg-champagne-bright/10 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-champagne-bright transition-colors hover:bg-champagne-bright/20"
        >
          <Sparkles className="h-3 w-3" />
          Run it now
        </button>
      </div>

      {/* Mock UI section */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-bone">{mock.title}</h2>
          <span className="text-[11px] uppercase tracking-[0.18em] text-bone/45">
            {mock.subtitle}
          </span>
        </div>

        {/* KPI strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {mock.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-bone/10 bg-bone/[0.02] p-4"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-bone/45">
                {kpi.label}
              </div>
              <div className="mt-1 font-serif text-2xl text-bone">{kpi.value}</div>
              <div className={`mt-1 text-[11px] ${accentText[accent]}`}>
                {kpi.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Sample rows table */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-bone/10 text-[10px] uppercase tracking-[0.18em] text-bone/45">
              <tr>
                {mock.columns.map((col) => (
                  <th key={col} className="px-4 py-3 font-normal">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mock.rows.map((row, idx) => (
                <MockRow key={idx} row={row} accent={accent} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="font-serif text-2xl text-bone">How it works</h2>
        <ol className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {mock.steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li
                key={idx}
                className="rounded-2xl border border-bone/10 bg-bone/[0.02] p-5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-md ${accentBg[accent]}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${accentText[accent]}`} />
                  </div>
                  <span className="font-mono text-[10px] text-bone/40">
                    STEP {idx + 1}
                  </span>
                </div>
                <p className="mt-3 font-serif text-lg text-bone">{step.title}</p>
                <p className="mt-2 text-[13px] leading-[1.5] text-bone/60">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Footer nav */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="font-serif text-xl text-bone">Related engines</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/preview/engines/${rel.slug}`}
                className="group rounded-2xl border border-bone/10 bg-bone/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-champagne/30"
              >
                <span className="font-mono text-[10px] text-bone/35">
                  {rel.number}
                </span>
                <p className="mt-1 font-serif text-base text-bone">{rel.name}</p>
                <p
                  className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${accentText[accent]}`}
                >
                  {rel.outcome}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {prev && (
            <Link
              href={`/preview/engines/${prev.slug}`}
              className="group rounded-2xl border border-bone/10 bg-bone/[0.02] p-4 transition-colors hover:border-champagne/30"
            >
              <span className="text-[10px] uppercase tracking-[0.18em] text-bone/45">
                ← Previous
              </span>
              <p className="mt-1 font-serif text-base text-bone group-hover:text-champagne-bright">
                {prev.name}
              </p>
            </Link>
          )}
          {next && (
            <Link
              href={`/preview/engines/${next.slug}`}
              className="group rounded-2xl border border-bone/10 bg-bone/[0.02] p-4 transition-colors hover:border-champagne/30"
            >
              <span className="text-[10px] uppercase tracking-[0.18em] text-bone/45">
                Next →
              </span>
              <p className="mt-1 font-serif text-base text-bone group-hover:text-champagne-bright">
                {next.name}
              </p>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function MockRow({
  row,
  accent,
}: {
  row: EngineMockRow;
  accent: "moss" | "honey" | "champagne";
}) {
  return (
    <tr className="border-b border-bone/10 last:border-b-0 transition-colors hover:bg-bone/[0.02]">
      {row.cells.map((cell, i) => (
        <td key={i} className="px-4 py-3 align-middle">
          {cell.kind === "text" && (
            <span className="text-bone/85">{cell.value}</span>
          )}
          {cell.kind === "muted" && (
            <span className="text-bone/55">{cell.value}</span>
          )}
          {cell.kind === "money" && (
            <span className={`font-mono text-[13px] ${accentText[accent]}`}>
              {cell.value}
            </span>
          )}
          {cell.kind === "pill" && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${accentBg[accent]} ${accentText[accent]}`}
            >
              {cell.value}
            </span>
          )}
          {cell.kind === "score" && (
            <span className="font-mono text-[13px] text-bone">{cell.value}</span>
          )}
        </td>
      ))}
    </tr>
  );
}
