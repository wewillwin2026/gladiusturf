"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Save,
  Send,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { StatusPill } from "@/components/app/ui/StatusPill";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/app/ui/Dialog";
import {
  createCampaign,
  deleteCampaign,
  previewAudience,
  sendCampaign,
  updateCampaign,
  type CampaignSendResult,
} from "../actions";

/**
 * Maintenance plan campaign launcher — the operator surface Cristian
 * + Felipe use to send a bilingual outbound campaign promoting the
 * Bright Care / Bright Guardian / Bright Basics tiers.
 *
 * One client island that handles:
 *   - the editable campaign builder card (title + EN/ES bodies +
 *     channel toggles + tier dropdown + audience filter + test-mode)
 *   - the live audience preview (count + first 5 names) that
 *     re-queries when filter/tier change
 *   - the send/save/delete buttons (with a confirm-modal preview
 *     for live sends), surfacing dispatcher mode + dry-run note
 *   - a recent-campaigns table with sent/opened/conversion counts
 *
 * Server actions own all data ops; this component only orchestrates
 * the UI and toast feedback.
 */

export type Tier = "basics" | "care" | "guardian";
export type Channel = "sms" | "email";
export type AudienceFilter = "all" | "no_plan";

export type LauncherCampaign = {
  id: string;
  title: string;
  body_en: string;
  body_es: string;
  channel: Channel[];
  target_tier: Tier | null;
  audience_filter: AudienceFilter;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduled_for: string | null;
  sent_at: string | null;
  sent_count: number;
  opened_count: number;
  conversion_count: number;
  created_at: string;
};

export type PlanTierOption = {
  tier: Tier;
  display_name: string;
  annual_price_cents: number;
};

type LauncherProps = {
  recent: LauncherCampaign[];
  starters: LauncherCampaign[];
  plans: PlanTierOption[];
  initialAudienceCount: number;
  initialAudienceSample: Array<{
    id: string;
    displayName: string;
    language: "en" | "es";
  }>;
  smsMode: "live" | "dry_run";
  emailMode: "live" | "dry_run";
  totalCustomers: number;
};

type FormState = {
  id: string | null;
  title: string;
  bodyEn: string;
  bodyEs: string;
  channels: Channel[];
  targetTier: Tier | null;
  audienceFilter: AudienceFilter;
  scheduledFor: string;
  testMode: boolean;
};

const STATUS_TONE: Record<LauncherCampaign["status"], "neutral" | "info" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  scheduled: "info",
  sending: "warning",
  sent: "success",
  failed: "danger",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fromCampaign(
  c: LauncherCampaign | null,
  fallback?: Partial<FormState>,
): FormState {
  return {
    id: c?.id ?? null,
    title: c?.title ?? fallback?.title ?? "",
    bodyEn: c?.body_en ?? fallback?.bodyEn ?? "",
    bodyEs: c?.body_es ?? fallback?.bodyEs ?? "",
    channels: c?.channel ?? fallback?.channels ?? ["sms", "email"],
    targetTier: c?.target_tier ?? fallback?.targetTier ?? null,
    audienceFilter: c?.audience_filter ?? fallback?.audienceFilter ?? "no_plan",
    scheduledFor: c?.scheduled_for
      ? toDateTimeLocal(c.scheduled_for)
      : fallback?.scheduledFor ?? "",
    testMode: fallback?.testMode ?? false,
  };
}

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // <input type="datetime-local"> wants YYYY-MM-DDTHH:MM in local time.
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function buildFormData(state: FormState): FormData {
  const fd = new FormData();
  if (state.id) fd.set("id", state.id);
  fd.set("title", state.title.trim());
  fd.set("body_en", state.bodyEn);
  fd.set("body_es", state.bodyEs);
  for (const ch of state.channels) fd.append("channel", ch);
  if (state.targetTier) fd.set("target_tier", state.targetTier);
  fd.set("audience_filter", state.audienceFilter);
  if (state.scheduledFor) fd.set("scheduled_for", state.scheduledFor);
  if (state.testMode) fd.set("test_mode", "on");
  return fd;
}

function errorCopy(code: string): string {
  switch (code) {
    case "title_required":
      return "Campaign title is required.";
    case "title_too_long":
      return "Title is too long (max 200 characters).";
    case "body_required":
      return "Provide a body in English or Spanish.";
    case "channel_required":
      return "Pick at least one channel — SMS, email, or both.";
    case "invalid_tier":
      return "Pick a valid plan tier.";
    case "invalid_filter":
      return "Pick a valid audience filter.";
    case "invalid_scheduled_for":
      return "Schedule date is invalid.";
    case "campaign_locked":
      return "This campaign already sent — it can't be edited or deleted.";
    case "campaign_already_sent":
      return "This campaign already sent.";
    case "not_found_in_tenant":
      return "Campaign not found in your workspace.";
    case "unauthenticated":
      return "Session expired — please sign in again.";
    default:
      return "Something went wrong. Try again.";
  }
}

export function CampaignLauncher(props: LauncherProps) {
  const router = useRouter();
  const allCampaigns = React.useMemo(
    () => [...props.starters, ...props.recent],
    [props.starters, props.recent],
  );
  const initialPick =
    props.starters[0] ?? props.recent.find((c) => c.status !== "sent") ?? null;

  const [form, setForm] = React.useState<FormState>(() =>
    fromCampaign(initialPick),
  );
  const [audienceCount, setAudienceCount] = React.useState(
    props.initialAudienceCount,
  );
  const [audienceSample, setAudienceSample] = React.useState(
    props.initialAudienceSample,
  );
  const [busy, setBusy] = React.useState<
    "idle" | "save" | "send" | "schedule" | "delete" | "preview"
  >("idle");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [previewModal, setPreviewModal] = React.useState<
    null | CampaignSendResult
  >(null);

  // Re-query audience preview whenever the filter or tier changes —
  // debounced so a fast tier toggle doesn't fire a query per keypress.
  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await previewAudience(
            form.audienceFilter,
            form.targetTier,
          );
          setAudienceCount(res.count);
          setAudienceSample(res.sample);
        } catch (err) {
          console.warn("audience preview refresh failed", err);
        }
      })();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [form.audienceFilter, form.targetTier]);

  function pickCampaign(c: LauncherCampaign): void {
    setForm(fromCampaign(c));
  }

  function pickStarter(slot: Tier): void {
    const starter = props.starters.find((s) => s.target_tier === slot);
    if (starter) {
      pickCampaign(starter);
      toast.info(`Loaded "${starter.title}"`);
    }
  }

  function newDraft(): void {
    setForm(fromCampaign(null));
    toast.info("Starting a new draft.");
  }

  function toggleChannel(ch: Channel): void {
    setForm((f) => {
      const has = f.channels.includes(ch);
      const next = has
        ? f.channels.filter((c) => c !== ch)
        : [...f.channels, ch].sort();
      return { ...f, channels: next as Channel[] };
    });
  }

  async function handleSave(): Promise<string | null> {
    if (busy !== "idle") return null;
    if (!form.title.trim()) {
      toast.error("Add a title before saving.");
      return null;
    }
    if (form.channels.length === 0) {
      toast.error("Pick at least one channel — SMS, email, or both.");
      return null;
    }
    if (!form.bodyEn.trim() && !form.bodyEs.trim()) {
      toast.error("Write a body in English or Spanish.");
      return null;
    }

    setBusy("save");
    try {
      const fd = buildFormData(form);
      const res =
        form.id != null ? await updateCampaign(fd) : await createCampaign(fd);
      if ("error" in res) {
        toast.error(errorCopy(res.error), {
          description: res.detail,
        });
        return null;
      }
      const campaignId = res.campaignId ?? form.id;
      toast.success(form.id ? "Campaign updated." : "Draft saved.");
      if (campaignId && !form.id) {
        setForm((f) => ({ ...f, id: campaignId }));
      }
      router.refresh();
      return campaignId ?? null;
    } catch (err) {
      toast.error("Save failed.", {
        description: err instanceof Error ? err.message : "Unknown error.",
      });
      return null;
    } finally {
      setBusy("idle");
    }
  }

  async function handleDelete(): Promise<void> {
    if (busy !== "idle" || !form.id) return;
    if (
      !window.confirm("Delete this draft? This can't be undone.") // eslint-disable-line no-alert
    ) {
      return;
    }
    setBusy("delete");
    try {
      const fd = new FormData();
      fd.set("id", form.id);
      const res = await deleteCampaign(fd);
      if ("error" in res) {
        toast.error(errorCopy(res.error), { description: res.detail });
        return;
      }
      toast.success("Draft deleted.");
      newDraft();
      router.refresh();
    } finally {
      setBusy("idle");
    }
  }

  async function handleSend(): Promise<void> {
    // Persist first so server has the latest text + filter, then send.
    const id = form.id ?? (await handleSave());
    if (!id) return;
    setBusy("send");
    try {
      const fd = new FormData();
      fd.set("id", id);
      if (form.testMode) fd.set("test_mode", "on");
      const res = await sendCampaign(fd);
      if (!res.ok) {
        toast.error(errorCopy(res.error), { description: res.detail });
        return;
      }
      if (res.mode === "test") {
        setPreviewModal(res);
        toast.info("Test preview ready.", {
          description: `${res.audienceCount} customers would have been messaged.`,
        });
      } else {
        const live =
          res.mode === "live"
            ? "Campaign sent."
            : res.mode === "mixed"
              ? "Campaign sent (mixed live + dry-run)."
              : "Campaign previewed (dry-run).";
        const detail = `${res.sentSms + res.sentEmail} sent · ${res.dryRunSms + res.dryRunEmail} dry-run · ${res.blocked} blocked · ${res.failed} failed.`;
        if (res.mode === "live") toast.success(live, { description: detail });
        else toast.info(live, { description: detail });
        // Reset form to a fresh draft after a real send so the operator
        // doesn't accidentally re-send the same campaign body.
        newDraft();
        router.refresh();
      }
    } catch (err) {
      toast.error("Send failed.", {
        description: err instanceof Error ? err.message : "Unknown error.",
      });
    } finally {
      setBusy("idle");
      setConfirmOpen(false);
    }
  }

  const isLocked =
    form.id != null &&
    allCampaigns.find((c) => c.id === form.id)?.status === "sent";

  return (
    <div className="flex flex-col gap-6">
      {/* Starter row — one-click load of the three pre-seeded tier campaigns. */}
      {props.starters.length > 0 && (
        <section className="g-card p-4 bg-g-accent-faint/40 border-g-accent/30">
          <div className="flex items-baseline justify-between">
            <h2 className="inline-flex items-center gap-2 text-g-accent text-[14px] font-medium">
              <Sparkles className="h-4 w-4" />
              Starter campaigns
            </h2>
            <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
              Pre-seeded · bilingual
            </span>
          </div>
          <p className="mt-2 text-[12px] text-g-text-muted">
            Three bilingual templates are ready — one per maintenance plan
            tier. Load one, tweak the copy, and ship.
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            {(["basics", "care", "guardian"] as const).map((slot) => {
              const exists = props.starters.find((s) => s.target_tier === slot);
              const plan = props.plans.find((p) => p.tier === slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => pickStarter(slot)}
                  disabled={!exists}
                  className="text-left rounded-md border border-g-border bg-g-surface p-3 hover:border-g-accent disabled:opacity-50 transition-colors"
                >
                  <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                    {plan?.display_name ?? slot}
                  </div>
                  <div className="mt-1 text-[13px] text-g-text font-medium truncate">
                    {exists?.title ?? "(not seeded)"}
                  </div>
                  {plan && (
                    <div className="mt-0.5 text-[11px] text-g-text-faint font-geist-mono">
                      ${(plan.annual_price_cents / 100).toFixed(0)}/yr
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* Builder card. */}
        <div className="g-card p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                {form.id ? "Editing campaign" : "New campaign"}
              </span>
              <h2 className="mt-1 text-[16px] font-medium text-g-text">
                Campaign builder
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {form.id && !isLocked && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={busy !== "idle"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={newDraft}
                disabled={busy !== "idle"}
              >
                New draft
              </Button>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Title *
            </label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Bright Care launch — semi-annual maintenance plan"
              className="mt-1.5"
              disabled={isLocked}
              required
            />
            <p className="mt-1 text-[11px] text-g-text-faint">
              Used as the email subject and in your recent-campaigns list.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Body · English
              </label>
              <Textarea
                value={form.bodyEn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bodyEn: e.target.value }))
                }
                rows={10}
                placeholder={"Hi {{first_name}},\n\n…"}
                className="mt-1.5 font-geist-mono text-[12px]"
                disabled={isLocked}
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Body · Español
              </label>
              <Textarea
                value={form.bodyEs}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bodyEs: e.target.value }))
                }
                rows={10}
                placeholder={"Hola {{first_name}},\n\n…"}
                className="mt-1.5 font-geist-mono text-[12px]"
                disabled={isLocked}
              />
            </div>
          </div>
          <p className="text-[11px] text-g-text-faint -mt-3">
            Customers receive the body that matches their{" "}
            <code className="text-g-text-muted">preferred_language</code>.{" "}
            <code className="text-g-text-muted">{`{{first_name}}`}</code> +{" "}
            <code className="text-g-text-muted">{`{{install_age}}`}</code> are
            replaced at send time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Channels
              </label>
              <div className="mt-1.5 flex gap-2">
                <ChannelToggle
                  label="SMS"
                  icon={MessageSquare}
                  active={form.channels.includes("sms")}
                  onClick={() => !isLocked && toggleChannel("sms")}
                  hintMode={props.smsMode}
                />
                <ChannelToggle
                  label="Email"
                  icon={Mail}
                  active={form.channels.includes("email")}
                  onClick={() => !isLocked && toggleChannel("email")}
                  hintMode={props.emailMode}
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Target plan tier
              </label>
              <select
                value={form.targetTier ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    targetTier:
                      e.target.value === ""
                        ? null
                        : (e.target.value as Tier),
                  }))
                }
                disabled={isLocked}
                className="mt-1.5 h-9 w-full rounded-md bg-g-surface border border-g-border px-3 text-[13px] text-g-text disabled:opacity-50"
              >
                <option value="">No specific tier</option>
                {props.plans.map((p) => (
                  <option key={p.tier} value={p.tier}>
                    {p.display_name} · ${(p.annual_price_cents / 100).toFixed(0)}/yr
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Audience
              </label>
              <select
                value={form.audienceFilter}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    audienceFilter: e.target.value as AudienceFilter,
                  }))
                }
                disabled={isLocked}
                className="mt-1.5 h-9 w-full rounded-md bg-g-surface border border-g-border px-3 text-[13px] text-g-text disabled:opacity-50"
              >
                <option value="all">All customers ({props.totalCustomers})</option>
                <option value="no_plan">Customers without an active plan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                Schedule (optional)
              </label>
              <Input
                type="datetime-local"
                value={form.scheduledFor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scheduledFor: e.target.value }))
                }
                disabled={isLocked}
                className="mt-1.5"
              />
              <p className="mt-1 text-[11px] text-g-text-faint">
                Leaves the campaign as scheduled. Sending still requires the
                explicit click below.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-[13px] text-g-text mb-2">
              <input
                type="checkbox"
                checked={form.testMode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, testMode: e.target.checked }))
                }
                disabled={isLocked}
                className="h-4 w-4 rounded border-g-border bg-g-surface text-g-accent"
              />
              <span>
                <span className="font-medium">Test mode</span>{" "}
                <span className="text-g-text-faint">
                  — preview recipient list + bodies; no SMS/email sent.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-g-border-subtle -mx-6 px-6 -mb-6 pb-6 mt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSave}
              disabled={busy !== "idle" || isLocked}
            >
              {busy === "save" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save draft
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => setConfirmOpen(true)}
              disabled={busy !== "idle" || isLocked || audienceCount === 0}
            >
              <Send className="h-3.5 w-3.5" />
              {form.testMode
                ? `Preview (${audienceCount})`
                : `Send to ${audienceCount}`}
            </Button>
          </div>
        </div>

        {/* Audience preview rail. */}
        <aside className="flex flex-col gap-3">
          <div className="g-card p-5">
            <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Audience preview
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-geist-mono text-[28px] tabular-nums text-g-text">
                {audienceCount}
              </span>
              <span className="text-[12px] text-g-text-faint">
                of {props.totalCustomers} customers
              </span>
            </div>
            <p className="mt-1 text-[12px] text-g-text-muted">
              {form.audienceFilter === "no_plan"
                ? "Customers without an active maintenance plan"
                : "All customers"}
              {form.targetTier ? ` · excluding existing ${form.targetTier} subscribers` : ""}
              .
            </p>
            <div className="mt-4 border-t border-g-border-subtle pt-3">
              <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                <Users className="inline h-3 w-3 mr-1" />
                Sample (first 5)
              </div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {audienceSample.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between text-[13px] text-g-text"
                  >
                    <span className="truncate">{s.displayName}</span>
                    <StatusPill tone={s.language === "es" ? "info" : "neutral"}>
                      {s.language.toUpperCase()}
                    </StatusPill>
                  </li>
                ))}
                {audienceSample.length === 0 && (
                  <li className="text-[12px] text-g-text-faint italic">
                    No customers match the current filters.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="g-card p-4">
            <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Dispatcher status
            </div>
            <ul className="mt-2 flex flex-col gap-1.5 text-[12px] text-g-text-muted">
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" />
                  SMS · Twilio
                </span>
                <StatusPill
                  tone={props.smsMode === "live" ? "success" : "warning"}
                >
                  {props.smsMode === "live" ? "Live" : "Dry-run"}
                </StatusPill>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  Email · Resend
                </span>
                <StatusPill
                  tone={props.emailMode === "live" ? "success" : "warning"}
                >
                  {props.emailMode === "live" ? "Live" : "Dry-run"}
                </StatusPill>
              </li>
            </ul>
            {(props.smsMode === "dry_run" || props.emailMode === "dry_run") && (
              <p className="mt-2 text-[11px] text-g-text-faint">
                Dry-run channels log every preview to the audit trail without
                actually sending. Set{" "}
                <code>TWILIO_ACCOUNT_SID + AUTH_TOKEN + FROM_NUMBER</code> /{" "}
                <code>RESEND_API_KEY</code> to flip to live.
              </p>
            )}
          </div>
        </aside>
      </section>

      {/* Recent campaigns table. */}
      <section className="g-card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
          <h2 className="text-[14px] font-medium text-g-text">
            Recent campaigns
          </h2>
          <span className="text-[11px] uppercase tracking-[0.14em] text-g-text-faint">
            {allCampaigns.length} total
          </span>
        </header>
        {allCampaigns.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-g-text-muted">
            No campaigns yet. Save a draft above and it shows up here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-g-border-subtle">
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Title
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Channels
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Sent
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Opened
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Conversions
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-g-text-faint text-[11px] uppercase tracking-[0.12em]">
                    Sent at
                  </th>
                </tr>
              </thead>
              <tbody>
                {allCampaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-g-border-subtle last:border-b-0 hover:bg-g-surface-2 cursor-pointer"
                    onClick={() => pickCampaign(c)}
                  >
                    <td className="px-4 py-2.5 text-g-text max-w-[320px]">
                      <div className="truncate">{c.title}</div>
                      {c.target_tier && (
                        <div className="text-[11px] text-g-text-faint capitalize">
                          {c.target_tier}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-g-text-muted">
                      {c.channel.map((ch) => ch.toUpperCase()).join(" + ")}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill tone={STATUS_TONE[c.status]}>
                        {c.status}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-2.5 text-right font-geist-mono tabular-nums text-g-text">
                      {c.sent_count}
                    </td>
                    <td className="px-4 py-2.5 text-right font-geist-mono tabular-nums text-g-text-muted">
                      {c.opened_count}
                    </td>
                    <td className="px-4 py-2.5 text-right font-geist-mono tabular-nums text-g-text-muted">
                      {c.conversion_count}
                    </td>
                    <td className="px-4 py-2.5 text-g-text-muted">
                      {formatDate(c.sent_at ?? c.scheduled_for)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Confirm send modal. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader
            title={form.testMode ? "Preview campaign?" : "Send campaign?"}
            description={
              form.testMode
                ? `Test mode: nothing will be sent. We'll show you up to 25 recipient previews + their resolved bodies.`
                : `${audienceCount} customer${audienceCount === 1 ? "" : "s"} will receive this campaign across ${form.channels.map((c) => c.toUpperCase()).join(" + ") || "no channel"}. canSend() consent + quiet-hours gate every dispatch.`
            }
          />
          <div className="flex flex-col gap-2 text-[12px] text-g-text-muted">
            <Row label="Title" value={form.title || "(untitled)"} />
            <Row
              label="Channels"
              value={form.channels.map((c) => c.toUpperCase()).join(" + ") || "—"}
            />
            <Row
              label="Audience"
              value={`${audienceCount} customer${audienceCount === 1 ? "" : "s"} — ${
                form.audienceFilter === "no_plan"
                  ? "no active plan"
                  : "all customers"
              }${form.targetTier ? `, excl. ${form.targetTier}` : ""}`}
            />
            <Row
              label="Mode"
              value={
                form.testMode
                  ? "Test (no send)"
                  : props.smsMode === "live" || props.emailMode === "live"
                    ? props.smsMode === "live" && props.emailMode === "live"
                      ? "Live · live"
                      : "Mixed (one channel dry-run)"
                    : "Dry-run · audit only"
              }
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={busy === "send"}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSend}
              disabled={busy === "send" || audienceCount === 0}
            >
              {busy === "send" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  {form.testMode ? "Run preview" : "Send now"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test-mode preview modal. */}
      <Dialog
        open={previewModal != null}
        onOpenChange={(open) => !open && setPreviewModal(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader
            title="Test preview"
            description={
              previewModal && previewModal.ok
                ? `${previewModal.audienceCount} customers would have been messaged. Showing ${previewModal.previews.length} sample previews — none of these were actually sent.`
                : ""
            }
          />
          {previewModal && previewModal.ok && (
            <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-3 text-[12px]">
              {previewModal.previews.map((p, i) => (
                <div
                  key={`${p.customerId}-${i}`}
                  className="rounded-md border border-g-border-subtle bg-g-surface p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-g-text">
                      {p.displayName ?? "(unnamed)"}
                    </div>
                    <StatusPill tone={p.language === "es" ? "info" : "neutral"}>
                      {p.language.toUpperCase()}
                    </StatusPill>
                  </div>
                  <div className="mt-1 text-[11px] text-g-text-faint">
                    {p.channels.map((c) => c.toUpperCase()).join(" + ")} ·{" "}
                    {p.primaryPhone ?? "no phone"} ·{" "}
                    {p.primaryEmail ?? "no email"}
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap font-geist-mono text-[11px] text-g-text-muted">
                    {p.body}
                  </pre>
                </div>
              ))}
              {previewModal.previews.length === 0 && (
                <p className="text-g-text-muted italic">
                  No matching customers — relax the filter to preview a sample.
                </p>
              )}
            </div>
          )}
          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPreviewModal(null)}
            >
              <Eye className="h-3.5 w-3.5" />
              Close preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChannelToggle({
  label,
  icon: Icon,
  active,
  onClick,
  hintMode,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  hintMode: "live" | "dry_run";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "h-9 inline-flex items-center gap-1.5 rounded-md border border-g-accent bg-g-accent-faint text-g-accent px-3 text-[13px] font-medium"
          : "h-9 inline-flex items-center gap-1.5 rounded-md border border-g-border bg-g-surface text-g-text-muted px-3 text-[13px] hover:border-g-accent hover:text-g-text"
      }
      title={hintMode === "live" ? "Live dispatcher" : "Dry-run dispatcher"}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
        {label}
      </span>
      <span className="text-g-text">{value}</span>
    </div>
  );
}
