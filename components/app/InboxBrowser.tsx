"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Inbox as InboxIcon,
  Mail,
  MessageSquare,
  Phone,
  Send,
  UserCircle,
  Loader2,
} from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Input";
import type { Customer, Message, MessageChannel } from "@/lib/shared/types";
import { initials, money, relTime, timeOfDay } from "@/lib/shared/format";
import { cn } from "@/lib/cn";

const CHANNEL_LABEL: Record<MessageChannel, string> = {
  sms: "SMS",
  email: "Email",
  voice: "Voice",
  portal: "Portal",
};

type ChannelFilter = MessageChannel | "all";

type Thread = {
  customerId: string;
  customer: Customer;
  messages: Message[];
  lastTs: string;
  unread: number;
};

export function InboxBrowser({
  messages: initialMessages,
  customers,
}: {
  messages: Message[];
  customers: Customer[];
}) {
  const [messages, setMessages] = React.useState(initialMessages);
  const [channel, setChannel] = React.useState<ChannelFilter>("all");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [replyChannel, setReplyChannel] = React.useState<MessageChannel>("sms");

  const customerById = React.useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c] as const)),
    [customers],
  );

  // Build threads grouped by customer.
  const threads: Thread[] = React.useMemo(() => {
    const byCustomer = new Map<string, Message[]>();
    for (const m of messages) {
      if (channel !== "all" && m.channel !== channel) continue;
      const arr = byCustomer.get(m.customerId) ?? [];
      arr.push(m);
      byCustomer.set(m.customerId, arr);
    }
    const list: Thread[] = [];
    for (const [cid, msgs] of byCustomer) {
      const customer = customerById[cid];
      if (!customer) continue;
      msgs.sort((a, b) => a.ts.localeCompare(b.ts));
      list.push({
        customerId: cid,
        customer,
        messages: msgs,
        lastTs: msgs[msgs.length - 1]!.ts,
        unread: msgs.filter((m) => !m.read && m.direction === "in").length,
      });
    }
    list.sort((a, b) => b.lastTs.localeCompare(a.lastTs));
    return list;
  }, [messages, channel, customerById]);

  const active = activeId ? threads.find((t) => t.customerId === activeId) : threads[0];
  const activeCustomer = active?.customer;

  function pickChannel(c: ChannelFilter) {
    setChannel(c);
    setActiveId(null);
  }

  async function sendReply() {
    if (!reply.trim() || !active) return;
    setSending(true);
    const newMsg: Message = {
      id: `msg_local_${Date.now()}`,
      customerId: active.customerId,
      channel: replyChannel,
      direction: "out",
      body: reply.trim(),
      ts: new Date().toISOString(),
      read: true,
    };
    // Optimistic append.
    setMessages((prev) => [newMsg, ...prev]);
    setReply("");
    await new Promise((r) => setTimeout(r, 400));
    setSending(false);
    toast.success(`Sent via ${CHANNEL_LABEL[replyChannel]}`, {
      description: `Delivered to ${active.customer.name.split(" ")[0]}.`,
    });
  }

  const channels: { id: ChannelFilter; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: "all", label: "All", icon: InboxIcon, count: messages.length },
    { id: "sms", label: "SMS", icon: MessageSquare, count: messages.filter((m) => m.channel === "sms").length },
    { id: "email", label: "Email", icon: Mail, count: messages.filter((m) => m.channel === "email").length },
    { id: "voice", label: "Voice", icon: Phone, count: messages.filter((m) => m.channel === "voice").length },
    { id: "portal", label: "Portal", icon: UserCircle, count: messages.filter((m) => m.channel === "portal").length },
  ];

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="g-card overflow-hidden grid grid-cols-[180px_320px_1fr] min-h-[640px]">
      {/* Left: channels */}
      <aside className="border-r border-g-border-subtle bg-g-bg/60 p-2 flex flex-col gap-0.5">
        <div className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
          Channels
        </div>
        {channels.map((c) => {
          const Icon = c.icon;
          const isActive = channel === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pickChannel(c.id)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] transition-colors text-left",
                isActive
                  ? "bg-g-surface-2 text-g-text"
                  : "text-g-text-muted hover:text-g-text hover:bg-g-surface-2",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="flex-1">{c.label}</span>
              <span className="font-geist-mono text-[10px] text-g-text-faint tabular-nums">
                {c.count}
              </span>
            </button>
          );
        })}
        <div className="mt-auto px-2 py-2 text-[11px] text-g-text-muted border-t border-g-border-subtle">
          {totalUnread} unread{" "}
          <span className="text-g-text-faint">/ {messages.length} total</span>
        </div>
      </aside>

      {/* Middle: threads */}
      <div className="border-r border-g-border-subtle overflow-y-auto" style={{ maxHeight: 640 }}>
        {threads.length === 0 ? (
          <div className="p-12 text-center text-g-text-muted text-[13px]">
            No threads in this channel yet.
          </div>
        ) : (
          threads.map((t) => {
            const last = t.messages[t.messages.length - 1]!;
            const isActive = active?.customerId === t.customerId;
            return (
              <button
                key={t.customerId}
                type="button"
                onClick={() => setActiveId(t.customerId)}
                className={cn(
                  "w-full px-3 py-3 border-b border-g-border-subtle text-left flex gap-2.5 transition-colors hover:bg-g-surface-2",
                  isActive && "bg-g-accent-faint/30 hover:bg-g-accent-faint/40",
                )}
              >
                <Avatar name={t.customer.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-[13px] text-g-text truncate font-medium">
                      {t.customer.name}
                    </span>
                    <span className="text-[10px] text-g-text-faint font-geist-mono shrink-0">
                      {relTime(t.lastTs)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-g-text-faint">
                      {CHANNEL_LABEL[last.channel]}
                    </span>
                    {t.unread > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-g-accent" />
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-g-text-muted truncate">
                    {last.direction === "out" ? "You: " : ""}
                    {last.body}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Right: conversation */}
      <div className="flex flex-col">
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-g-text-muted text-[13px]">
            Select a thread to view the conversation.
          </div>
        ) : (
          <>
            <header className="px-4 h-14 border-b border-g-border-subtle flex items-center gap-3">
              <Avatar name={active.customer.name} />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-g-text">
                  {active.customer.name}
                </div>
                <div className="text-[11px] text-g-text-faint">
                  {active.customer.tier} ·{" "}
                  <span className="font-geist-mono">
                    {money(active.customer.ltvCents)}
                  </span>{" "}
                  LTV ·{" "}
                  <span className="font-geist-mono">{active.customer.phone}</span>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                {active.messages.length} messages
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ maxHeight: 460 }}>
              {active.messages.map((m, idx) => {
                const prev = active.messages[idx - 1];
                const showDay =
                  !prev ||
                  new Date(prev.ts).toDateString() !==
                    new Date(m.ts).toDateString();
                return (
                  <React.Fragment key={m.id}>
                    {showDay && (
                      <div className="text-center text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
                        {new Date(m.ts).toDateString()}
                      </div>
                    )}
                    <MessageBubble m={m} customer={active.customer} />
                  </React.Fragment>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendReply();
              }}
              className="border-t border-g-border-subtle p-3 flex flex-col gap-2"
            >
              <div className="flex items-center gap-1">
                {(["sms", "email", "voice", "portal"] as MessageChannel[]).map((c) => {
                  const Icon =
                    c === "sms"
                      ? MessageSquare
                      : c === "email"
                        ? Mail
                        : c === "voice"
                          ? Phone
                          : UserCircle;
                  const active = replyChannel === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setReplyChannel(c)}
                      className={cn(
                        "inline-flex items-center gap-1 h-7 px-2 rounded text-[11px] transition-colors",
                        active
                          ? "bg-g-accent-faint text-g-accent"
                          : "text-g-text-muted hover:text-g-text",
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {CHANNEL_LABEL[c]}
                    </button>
                  );
                })}
                <span className="ml-auto text-[10px] text-g-text-faint">
                  ⌘↵ to send
                </span>
              </div>
              <div className="flex items-end gap-2">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      void sendReply();
                    }
                  }}
                  placeholder={`Reply via ${CHANNEL_LABEL[replyChannel]}…`}
                  rows={2}
                  className="text-[13px]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={sending || !reply.trim()}
                >
                  {sending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ m, customer }: { m: Message; customer: Customer }) {
  const isOut = m.direction === "out";
  const Icon =
    m.channel === "sms"
      ? MessageSquare
      : m.channel === "email"
        ? Mail
        : m.channel === "voice"
          ? Phone
          : UserCircle;

  if (m.channel === "voice" && !isOut) {
    return (
      <div className="rounded-md border border-g-warning/30 bg-g-warning/5 p-3">
        <div className="flex items-center gap-2 text-[11px] text-g-warning uppercase tracking-[0.14em]">
          <Phone className="h-3 w-3" />
          Voice transcript
          <span className="ml-auto font-geist-mono text-g-text-faint">
            {timeOfDay(m.ts)}
          </span>
        </div>
        <p className="mt-2 text-[13px] text-g-text-muted leading-relaxed italic">
          &ldquo;{m.body}&rdquo;
        </p>
        <div className="mt-2 text-[10px] text-g-text-faint">
          Auto-transcribed · {initials(customer.name)} · 0:18
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-lg px-3 py-2 text-[13px] whitespace-pre-wrap",
          isOut
            ? "bg-g-accent text-black rounded-br-sm"
            : "bg-g-surface-2 text-g-text border border-g-border-subtle rounded-bl-sm",
        )}
      >
        {!isOut && (
          <div className="flex items-center gap-1 mb-1 text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            <Icon className="h-2.5 w-2.5" />
            {CHANNEL_LABEL[m.channel]}
          </div>
        )}
        <p>{m.body}</p>
        <div
          className={cn(
            "mt-1 text-[10px] font-geist-mono",
            isOut ? "text-black/55" : "text-g-text-faint",
          )}
        >
          {timeOfDay(m.ts)}
        </div>
      </div>
    </div>
  );
}
