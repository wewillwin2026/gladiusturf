import { KEEPING_TREND } from "@/content/retention-demo-data";

/**
 * Inline SVG line chart for the last 12 months of "Keeping customers %"
 * trending from 89% → 112%. RSC-only, no client interaction.
 */
export function KeepingTrendChart() {
  const W = 800;
  const H = 240;
  const PAD_L = 44;
  const PAD_R = 36;
  const PAD_T = 36;
  const PAD_B = 36;

  const points = KEEPING_TREND;
  const minPct = 86; // headroom under 89
  const maxPct = 116; // headroom over 112

  const xFor = (i: number) =>
    PAD_L + (i * (W - PAD_L - PAD_R)) / (points.length - 1);
  const yFor = (pct: number) =>
    PAD_T + ((maxPct - pct) * (H - PAD_T - PAD_B)) / (maxPct - minPct);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(p.pct).toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L${xFor(points.length - 1).toFixed(1)},${(H - PAD_B).toFixed(1)} L${xFor(0).toFixed(1)},${(H - PAD_B).toFixed(1)} Z`;

  return (
    <div className="rounded-2xl border border-bone/10 bg-obsidian/60 p-5 shadow-pop md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-bone/10 pb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/45">
            Keeping customers · last 12 months
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="font-serif text-4xl font-semibold tracking-tight text-champagne-bright md:text-5xl">
              112%
            </span>
            <span className="rounded-full border border-moss/30 bg-moss/10 px-2 py-0.5 font-mono text-[10px] text-moss-bright">
              +23 pts vs May
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {["3M", "6M", "12M", "ALL"].map((p) => (
            <span
              key={p}
              className={
                p === "12M"
                  ? "rounded-full border border-moss/30 bg-moss/10 px-2.5 py-0.5 font-mono text-[10px] text-moss-bright"
                  : "rounded-full border border-bone/15 bg-bone/[0.03] px-2.5 py-0.5 font-mono text-[10px] text-bone/55"
              }
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full"
        role="img"
        aria-label="Keeping-customers % trend across 12 months from 89% to 112%"
      >
        <defs>
          <linearGradient id="kt-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(201,168,122,0.35)" />
            <stop offset="1" stopColor="rgba(201,168,122,0)" />
          </linearGradient>
        </defs>

        {/* gridlines (every 10 pts) */}
        {[90, 100, 110].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={yFor(tick)}
              y2={yFor(tick)}
              stroke="rgba(245,241,232,0.06)"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 6}
              y={yFor(tick) + 3}
              fontFamily="ui-monospace, monospace"
              fontSize="10"
              fill="rgba(245,241,232,0.4)"
              textAnchor="end"
            >
              {tick}%
            </text>
          </g>
        ))}

        {/* 100% threshold dashed */}
        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={yFor(100)}
          y2={yFor(100)}
          stroke="rgba(157,255,138,0.32)"
          strokeDasharray="4 4"
        />

        {/* area + line */}
        <path d={areaPath} fill="url(#kt-area)" />
        <path
          d={linePath}
          fill="none"
          stroke="rgba(212,178,122,1)"
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* month ticks */}
        {points.map((p, i) => (
          <text
            key={p.month}
            x={xFor(i)}
            y={H - 10}
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            fill="rgba(245,241,232,0.4)"
            textAnchor="middle"
          >
            {p.month}
          </text>
        ))}

        {/* dots — moss-bright on annotated peaks, champagne otherwise */}
        {points.map((p, i) => {
          const isPeak = !!p.annotation || i === points.length - 1;
          const fill = isPeak ? "#9DFF8A" : "#D4B27A";
          const r = isPeak ? 4.5 : 2.75;
          return (
            <circle key={p.month} cx={xFor(i)} cy={yFor(p.pct)} r={r} fill={fill} />
          );
        })}

        {/* annotation callouts */}
        {points.map((p, i) => {
          if (!p.annotation) return null;
          const x = xFor(i);
          const y = yFor(p.pct);
          // place callout above the dot
          const tx = x + 8;
          const ty = y - 12;
          return (
            <g key={`ann-${p.month}`}>
              <line
                x1={x}
                y1={y - 6}
                x2={tx}
                y2={ty + 4}
                stroke="rgba(157,255,138,0.45)"
                strokeWidth="1"
              />
              <text
                x={tx}
                y={ty}
                fontFamily="ui-monospace, monospace"
                fontSize="10"
                fill="#9DFF8A"
              >
                {p.annotation} ({p.month})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
