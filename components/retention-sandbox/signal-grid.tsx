import {
  AlertCircle,
  Clock,
  Inbox,
  Leaf,
  MessageSquare,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  SIGNAL_SUMMARIES,
  type SaveSignalKey,
} from "@/content/retention-demo-data";

const ICON: Record<SaveSignalKey, LucideIcon> = {
  "payment-lag": Clock,
  "reply-lag": MessageSquare,
  "revenue-down": TrendingDown,
  complaints: AlertCircle,
  "seasonal-lapse": Leaf,
  "slow-inbound": Inbox,
};

export function SignalGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SIGNAL_SUMMARIES.map((s, i) => {
        const Icon = ICON[s.key];
        return (
          <ScrollReveal key={s.key} delay={(i % 3) * 0.05}>
            <article className="flex h-full items-start gap-4 rounded-2xl border border-bone/10 bg-bone/[0.02] p-5">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-champagne/30 bg-champagne/5 text-champagne-bright">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-semibold tracking-tight text-bone">
                    {s.count}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-bone/45">
                    customers
                  </span>
                </div>
                <h3 className="mt-1 font-serif text-base font-semibold tracking-tight text-bone">
                  {s.label}
                </h3>
                <p className="mt-1 text-[12px] leading-[1.55] text-bone/55">
                  {s.detail}
                </p>
              </div>
            </article>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
