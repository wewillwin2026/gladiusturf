import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Sparkles,
} from "lucide-react";
import type { Activity } from "@/lib/demo-data/bright-lights";

const ICON = {
  info: Cloud,
  warning: AlertTriangle,
  success: CheckCircle2,
  alert: Sparkles,
} as const;

const COLOR = {
  info: "var(--bl-info)",
  warning: "var(--bl-accent)",
  success: "var(--bl-success)",
  alert: "var(--bl-alert)",
} as const;

export function ActivityRow({
  activity,
  last,
}: {
  activity: Activity;
  last?: boolean;
}) {
  const Icon = ICON[activity.tone];
  const color = COLOR[activity.tone];
  return (
    <li
      className="flex items-start gap-3 px-4 py-3"
      style={{
        borderBottom: last ? "none" : "1px solid var(--bl-border)",
      }}
    >
      <div
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `${color}1F`,
          color,
          border: `1px solid ${color}55`,
        }}
      >
        <Icon className="h-3 w-3" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] leading-[1.45]"
          style={{ color: "var(--bl-text)" }}
        >
          {activity.text}
        </p>
        <span
          className="bl-mono mt-1 inline-block text-[10px]"
          style={{ color: "var(--bl-text-faint)" }}
        >
          {activity.ts}
        </span>
      </div>
    </li>
  );
}
