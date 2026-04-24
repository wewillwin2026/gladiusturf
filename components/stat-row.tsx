import { AnimatedCounter } from "@/components/animated-counter";
import { Eyebrow } from "@/components/eyebrow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { cn } from "@/lib/cn";

type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  /** The MOSS-accented "winner" stat — only one per row. */
  accent?: boolean;
};

const DEFAULT_STATS: Stat[] = [
  {
    value: 232200,
    prefix: "$",
    label: "leaked from the average crew's books each year",
    accent: true,
  },
  {
    value: 21000,
    prefix: "$",
    label: "lost to missed calls per month at the average shop",
  },
  {
    value: 42,
    suffix: "%",
    label: "of requested callbacks that never happen industry-wide",
  },
  {
    value: 400,
    suffix: "%",
    label: "spring-rush call volume your stack wasn't built for",
  },
];

export function StatRow({ stats = DEFAULT_STATS }: { stats?: Stat[] }) {
  return (
    <section
      id="proof"
      className="relative border-y border-bone/10 bg-forest-mid py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <Eyebrow className="mb-3 text-center">
            The real cost of a leaky stack
          </Eyebrow>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <h2 className="mx-auto max-w-3xl text-center font-serif text-4xl font-semibold tracking-[-0.02em] text-bone md:text-5xl">
            <span className="text-moss-bright">$232,200</span> walks out of every
            crew&apos;s books each year.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-bone/70">
            Quotes that die in voicemail. Upsells nobody flagged. Referrals that
            got chased by a competitor first. Numbers from the 12 crews who
            audited their pipelines with us last quarter.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "rounded-2xl border p-8 text-center",
                  stat.accent
                    ? "border-moss/30 bg-gradient-to-b from-moss/10 to-transparent"
                    : "border-bone/10 bg-bone/[0.02]"
                )}
              >
                <div
                  className={cn(
                    "font-serif text-5xl font-semibold tracking-tight md:text-6xl",
                    stat.accent ? "text-moss-bright" : "text-honey-bright"
                  )}
                >
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <p className="mt-4 text-sm leading-[1.5] text-bone/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
