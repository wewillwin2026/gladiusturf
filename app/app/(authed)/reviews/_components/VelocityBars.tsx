/**
 * Reviews-per-month bar chart for the last 12 months. Server component,
 * pure SVG, no client JS.
 */
export function VelocityBars({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="text-[12px] text-g-text-muted">
        No reviews yet — your first one will plot here.
      </div>
    );
  }
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 480;
  const height = 96;
  const pad = 24;
  const innerW = width - pad * 2;
  const innerH = height - pad - 12;
  const barW = innerW / data.length - 6;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-24 max-w-full"
      aria-hidden
    >
      {data.map((d, i) => {
        const h = (d.count / max) * innerH;
        const x = pad + i * (barW + 6);
        const y = height - 12 - h;
        return (
          <g key={`${d.label}-${i}`}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={2}
              fill="var(--g-accent)"
              opacity={0.85}
            />
            <text
              x={x + barW / 2}
              y={height - 2}
              textAnchor="middle"
              fontSize={9}
              fill="var(--g-text-faint)"
              fontFamily="var(--font-geist-mono)"
            >
              {d.label}
            </text>
            {d.count > 0 && (
              <text
                x={x + barW / 2}
                y={y - 2}
                textAnchor="middle"
                fontSize={9}
                fill="var(--g-text-muted)"
                fontFamily="var(--font-geist-mono)"
              >
                {d.count}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
