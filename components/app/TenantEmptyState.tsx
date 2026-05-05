import { ArrowLeft, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/ui/EmptyState";
import type { TenantRow } from "@/lib/app/tenant-auth";

type Props = {
  /** Sidebar / route name shown in the header eyebrow + h1. */
  engine: string;
  /** The tenant whose workspace is being viewed. */
  tenant: TenantRow;
  /** Lucide icon shown in the empty state. */
  icon: LucideIcon;
  /** Body copy explaining when the engine will start showing data. */
  body: string;
  /** Optional H1 override — defaults to `engine`. */
  title?: string;
};

/**
 * Universal empty-state shell for workspace engines that haven't yet been
 * wired to tenant-scoped data. Used when a real tenant signs in and visits
 * an engine route whose underlying Supabase table doesn't exist yet (jobs,
 * quotes, conversations, etc.) — instead of falsely showing Cypress Lawn
 * seed data, we surface an honest "this will appear here when X" message.
 */
export function TenantEmptyState({
  engine,
  tenant,
  icon,
  body,
  title,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to dashboard
      </Link>

      <PageHeader
        eyebrow={`${tenant.display_name} · ${engine}`}
        title={title ?? engine}
        subtitle="This engine is wired but has no data yet for your workspace."
      />

      <EmptyState
        icon={icon}
        title={`${engine.toLowerCase()} will appear here`}
        body={body}
      />
    </div>
  );
}
