"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";
import {
  ArrowRight,
  Bot,
  ClipboardList,
  Cog,
  FileText,
  PenSquare,
  Receipt,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCmdK } from "./CommandPaletteContext";
import { ENGINES, hrefForEngine, type ProductKind } from "./engines";
import { money, shortDate } from "@/lib/shared/format";

type CmdItem = {
  group: string;
  label: string;
  hint?: string;
  href?: string;
  onSelect?: () => void;
  icon?: LucideIcon;
};

export function CommandPalette({ product }: { product: ProductKind }) {
  const { isOpen, close } = useCmdK();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<{
    customers: { id: string; name: string; address: string }[];
    jobs: { id: string; service: string; ts: string; customer: string }[];
    quotes: { id: string; total: number; stage: string; customer: string }[];
    invoices: { id: string; amount: number; status: string; customer: string }[];
  } | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  // Demo product loads cached seed data via API; founders product only gets
  // navigation + actions in Phase 2 (real Supabase search comes Phase 6).
  React.useEffect(() => {
    if (!isOpen || product !== "demo" || loaded) return;
    let cancelled = false;
    fetch("/api/cmdk/demo")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setData(j);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [isOpen, product, loaded]);

  function go(href: string) {
    close();
    router.push(href);
  }

  if (!isOpen) return null;

  const base = product === "demo" ? "/app" : "/founders/war-room";
  const hereEngine = ENGINES.find(
    (e) => pathname === hrefForEngine(product, e.slug),
  );

  const suggestions: CmdItem[] = [];
  if (hereEngine?.slug === "today" || pathname === base) {
    suggestions.push(
      {
        group: "Suggestions",
        label: "Draft a new quote with AI",
        href: `${base}/quotes/new`,
        icon: Sparkles,
      },
      {
        group: "Suggestions",
        label: "Open today's job board",
        href: `${base}/jobs`,
        icon: ClipboardList,
      },
      {
        group: "Suggestions",
        label: "Ask Gladius",
        href: `${base}/ask-gladius`,
        icon: Bot,
      },
    );
  }

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/60"
      onClick={close}
    >
      <div
        className="g-card w-full max-w-2xl mx-4 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command Palette" loop className="bg-g-surface">
          <div className="border-b border-g-border-subtle px-3 h-12 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-g-text-faint" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search engines, customers, jobs, quotes…"
              className="w-full bg-transparent outline-none text-[14px] text-g-text placeholder:text-g-text-faint"
            />
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto py-2">
            <Command.Empty className="px-3 py-6 text-center text-[12px] text-g-text-muted">
              No matches.
            </Command.Empty>

            {suggestions.length > 0 && (
              <Group heading="Suggestions">
                {suggestions.map((s) => (
                  <Item
                    key={s.label}
                    icon={s.icon}
                    label={s.label}
                    onSelect={() => s.href && go(s.href)}
                    hint={s.hint}
                  />
                ))}
              </Group>
            )}

            {data?.customers.length ? (
              <Group heading="Customers">
                {data.customers.slice(0, 8).map((c) => (
                  <Item
                    key={c.id}
                    icon={Users}
                    label={c.name}
                    hint={c.address}
                    onSelect={() => go(`${base}/customers/${c.id}`)}
                  />
                ))}
              </Group>
            ) : null}

            {data?.jobs.length ? (
              <Group heading="Jobs">
                {data.jobs.slice(0, 6).map((j) => (
                  <Item
                    key={j.id}
                    icon={ClipboardList}
                    label={`${j.service} · ${j.customer}`}
                    hint={shortDate(j.ts)}
                    onSelect={() => go(`${base}/jobs`)}
                  />
                ))}
              </Group>
            ) : null}

            {data?.quotes.length ? (
              <Group heading="Quotes">
                {data.quotes.slice(0, 6).map((q) => (
                  <Item
                    key={q.id}
                    icon={PenSquare}
                    label={`${q.id} · ${q.customer}`}
                    hint={`${q.stage} · ${money(q.total)}`}
                    onSelect={() => go(`${base}/quotes`)}
                  />
                ))}
              </Group>
            ) : null}

            {data?.invoices.length ? (
              <Group heading="Invoices">
                {data.invoices.slice(0, 6).map((i) => (
                  <Item
                    key={i.id}
                    icon={Receipt}
                    label={`${i.id} · ${i.customer}`}
                    hint={`${i.status} · ${money(i.amount)}`}
                    onSelect={() => go(`${base}/invoices`)}
                  />
                ))}
              </Group>
            ) : null}

            <Group heading="Navigation">
              {ENGINES.map((e) => {
                const Icon = e.icon;
                const href = hrefForEngine(product, e.slug);
                return (
                  <Item
                    key={e.slug}
                    icon={Icon}
                    label={e.name}
                    hint={href}
                    onSelect={() => go(href)}
                  />
                );
              })}
            </Group>

            <Group heading="Settings">
              <Item
                icon={Cog}
                label="Settings · Company"
                onSelect={() => go(`${base}/settings`)}
              />
              <Item
                icon={Cog}
                label="Settings · Team"
                onSelect={() => go(`${base}/settings#team`)}
              />
              <Item
                icon={Cog}
                label="Settings · Billing"
                onSelect={() => go(`${base}/settings#billing`)}
              />
              <Item
                icon={FileText}
                label="Open changelog"
                onSelect={() => go(`${base}/changelog`)}
              />
            </Group>
          </Command.List>

          <div className="flex items-center justify-between px-3 h-9 border-t border-g-border-subtle text-[11px] text-g-text-faint">
            <span className="font-geist-mono">↑↓ navigate · ↵ select · esc close</span>
            <span className="font-geist-mono">
              {ENGINES.length} engines · seed v.1337
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function Group({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Command.Group
      heading={heading}
      className="[&>[cmdk-group-heading]]:px-3 [&>[cmdk-group-heading]]:py-1.5 [&>[cmdk-group-heading]]:text-[10px] [&>[cmdk-group-heading]]:uppercase [&>[cmdk-group-heading]]:tracking-[0.14em] [&>[cmdk-group-heading]]:text-g-text-faint"
    >
      {children}
    </Command.Group>
  );
}

function Item({
  icon: Icon,
  label,
  hint,
  onSelect,
}: {
  icon?: LucideIcon;
  label: string;
  hint?: string;
  onSelect?: () => void;
}) {
  return (
    <Command.Item
      value={label + (hint ? ` ${hint}` : "")}
      onSelect={onSelect}
      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-md mx-1 text-[13px] text-g-text-muted data-[selected=true]:bg-g-surface-2 data-[selected=true]:text-g-text"
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span className="truncate flex-1">{label}</span>
      {hint && (
        <span className="text-[10px] text-g-text-faint font-geist-mono truncate max-w-[40%]">
          {hint}
        </span>
      )}
      <ArrowRight className="h-3 w-3 text-g-text-faint opacity-0 data-[selected=true]:opacity-100" />
    </Command.Item>
  );
}
