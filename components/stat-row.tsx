import { HERO_STATS } from "@/content/stats";

export function StatRow() {
  return (
    <section id="proof" className="bg-obsidian text-bone">
      <div className="mx-auto max-w-content px-6 py-20 md:py-section">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {HERO_STATS.map((s) => (
            <div key={s.number} className="flex flex-col">
              <span className="font-mono text-stat-sm text-lime md:text-stat">
                {s.number}
              </span>
              <span className="mt-4 text-[14px] leading-[1.5] text-bone/70">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
