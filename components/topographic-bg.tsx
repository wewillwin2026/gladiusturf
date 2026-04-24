// Subtle moss SVG contour pattern used behind hero/CTA bands.
// Server component, no client JS, no photo. Tuned for dark backgrounds.
export function TopographicBg() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="#7FE27A"
      strokeWidth="0.8"
      aria-hidden="true"
      style={{ opacity: 0.12 }}
    >
      {Array.from({ length: 10 }).map((_, i) => {
        const offset = 40 + i * 34;
        const d = `M -100 ${offset + 320} C 200 ${offset + 240}, 420 ${offset + 420}, 640 ${offset + 300} S 1000 ${offset + 240}, 1320 ${offset + 360}`;
        return <path key={i} d={d} />;
      })}
    </svg>
  );
}
