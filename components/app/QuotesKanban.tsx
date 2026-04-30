"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ArrowRight,
  Eye,
  FileText,
  PencilLine,
  ThumbsDown,
  ThumbsUp,
  Send,
} from "lucide-react";
import type { Quote, QuoteStage } from "@/lib/shared/types";
import { money, relTime } from "@/lib/shared/format";
import { cn } from "@/lib/cn";

const COLUMNS: { id: QuoteStage; label: string; tone: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "Draft", label: "Draft", tone: "border-g-border", icon: PencilLine },
  { id: "Sent", label: "Sent", tone: "border-g-info/40", icon: Send },
  { id: "Viewed", label: "Viewed", tone: "border-g-warning/40", icon: Eye },
  { id: "Won", label: "Won", tone: "border-g-accent/50", icon: ThumbsUp },
  { id: "Lost", label: "Lost", tone: "border-g-danger/40", icon: ThumbsDown },
];

export function QuotesKanban({
  quotes: initial,
  customerById,
}: {
  quotes: Quote[];
  customerById: Record<string, string>;
}) {
  const [quotes, setQuotes] = React.useState(initial);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const byStage = React.useMemo(() => {
    const m: Record<QuoteStage, Quote[]> = {
      Draft: [],
      Sent: [],
      Viewed: [],
      Won: [],
      Lost: [],
    };
    for (const q of quotes) m[q.stage].push(q);
    for (const k of Object.keys(m) as QuoteStage[]) {
      m[k].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return m;
  }, [quotes]);

  function handleStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleEnd(e: DragEndEvent) {
    setActiveId(null);
    const id = String(e.active.id);
    const dest = e.over?.id ? (String(e.over.id) as QuoteStage) : null;
    if (!dest) return;
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== id || q.stage === dest) return q;
        const stagedQuote: Quote = {
          ...q,
          stage: dest,
          ...(dest === "Sent" && !q.sentAt
            ? { sentAt: new Date().toISOString() }
            : {}),
          ...(dest === "Viewed" && !q.viewedAt
            ? { viewedAt: new Date().toISOString() }
            : {}),
          ...(dest === "Won" || dest === "Lost"
            ? { closedAt: new Date().toISOString() }
            : {}),
        };
        return stagedQuote;
      }),
    );
    const moved = quotes.find((q) => q.id === id);
    if (moved && moved.stage !== dest) {
      const customer = customerById[moved.customerId] ?? "Customer";
      const messages: Record<QuoteStage, string> = {
        Draft: `Returned to draft`,
        Sent: `Quote sent to ${customer}`,
        Viewed: `Marked as viewed`,
        Won: `Won — ${money(moved.total)} from ${customer}`,
        Lost: `Lost — ${customer} passed`,
      };
      toast.success(messages[dest]);
    }
  }

  const active = activeId ? quotes.find((q) => q.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((c) => (
          <Column
            key={c.id}
            stage={c.id}
            label={c.label}
            tone={c.tone}
            icon={c.icon}
            quotes={byStage[c.id]}
            customerById={customerById}
          />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <CardBody quote={active} customerName={customerById[active.customerId] ?? "Customer"} dragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  stage,
  label,
  tone,
  icon: Icon,
  quotes,
  customerById,
}: {
  stage: QuoteStage;
  label: string;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
  quotes: Quote[];
  customerById: Record<string, string>;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });
  const total = quotes.reduce((s, q) => s + q.total, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "g-card border-2 flex flex-col min-h-[420px]",
        tone,
        isOver && "ring-2 ring-g-accent ring-offset-0",
      )}
    >
      <div className="flex items-baseline justify-between px-4 py-3 border-b border-g-border-subtle">
        <span className="inline-flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-g-text-muted" />
          <span className="text-[12px] font-medium text-g-text">{label}</span>
        </span>
        <span className="text-[11px] font-geist-mono text-g-text-faint tabular-nums">
          {quotes.length} · {money(total)}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto">
        {quotes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[11px] text-g-text-faint italic">
            Drop quotes here
          </div>
        ) : (
          quotes.map((q) => (
            <Card
              key={q.id}
              quote={q}
              customerName={customerById[q.customerId] ?? "Customer"}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Card({ quote, customerName }: { quote: Quote; customerName: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: quote.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30",
      )}
    >
      <CardBody quote={quote} customerName={customerName} />
    </div>
  );
}

function CardBody({
  quote,
  customerName,
  dragging,
}: {
  quote: Quote;
  customerName: string;
  dragging?: boolean;
}) {
  const isViewed = quote.stage === "Viewed";
  return (
    <div
      className={cn(
        "rounded-md border bg-g-surface-2/40 p-3 select-none",
        isViewed
          ? "border-g-warning/30 shadow-[0_0_0_1px_rgba(245,158,11,0.15)] animate-pulse-soft"
          : "border-g-border-subtle",
        dragging && "border-g-accent shadow-2xl",
      )}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-geist-mono text-[11px] text-g-text-faint">
          {quote.id}
        </span>
        <span className="font-geist-mono text-[12px] text-g-text tabular-nums">
          {money(quote.total)}
        </span>
      </div>
      <p className="mt-1 text-[13px] text-g-text truncate">{customerName}</p>
      <p className="mt-0.5 text-[11px] text-g-text-faint truncate">
        {quote.services.map((s) => s.name).join(" · ")}
      </p>
      <div className="mt-2 flex items-center justify-between text-[10px] text-g-text-faint">
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {relTime(quote.viewedAt ?? quote.sentAt ?? quote.createdAt)}
        </span>
        <ArrowRight className="h-3 w-3" />
      </div>
    </div>
  );
}
