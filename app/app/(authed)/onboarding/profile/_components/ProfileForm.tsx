"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { updateShopProfile } from "../actions";

type Initial = {
  display_name: string;
  legal_name: string | null;
  brand_primary_hex: string;
  brand_accent_hex: string;
  service_area_zips: string[];
  primary_language: "en" | "es";
  bilingual: boolean;
  review_url: string | null;
  owner_phone: string | null;
  daily_briefing_sms_enabled: boolean;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const [legalName, setLegalName] = React.useState(initial.legal_name ?? "");
  const [ownerPhone, setOwnerPhone] = React.useState(initial.owner_phone ?? "");
  const [primaryHex, setPrimaryHex] = React.useState(initial.brand_primary_hex);
  const [accentHex, setAccentHex] = React.useState(initial.brand_accent_hex);
  const [zips, setZips] = React.useState((initial.service_area_zips ?? []).join(", "));
  const [language, setLanguage] = React.useState<"en" | "es">(initial.primary_language);
  const [bilingual, setBilingual] = React.useState(initial.bilingual);
  const [reviewUrl, setReviewUrl] = React.useState(initial.review_url ?? "");
  const [dailySms, setDailySms] = React.useState(initial.daily_briefing_sms_enabled);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const zipList = zips
        .split(/[\s,]+/)
        .map((z) => z.trim())
        .filter(Boolean);
      const res = await updateShopProfile({
        legal_name: legalName || null,
        owner_phone: ownerPhone || null,
        brand_primary_hex: primaryHex || null,
        brand_accent_hex: accentHex || null,
        service_area_zips: zipList,
        primary_language: language,
        bilingual,
        review_url: reviewUrl || null,
        daily_briefing_sms_enabled: dailySms,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Shop profile saved.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-3xl">
      {/* 1 · Identity ─────────────────────────────────────────────── */}
      <section className="g-card p-5 flex flex-col gap-4">
        <header>
          <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            1 · Business identity
          </div>
        </header>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Display name
          </label>
          <div className="mt-1.5 px-3 py-2 rounded-md bg-g-surface-2 border border-g-border text-[13px] text-g-text-muted">
            {initial.display_name}{" "}
            <span className="text-g-text-faint">
              · contact founders to change the public name
            </span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Legal name
            </label>
            <Input
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="BRIGHT LIGHTS LANDSCAPE LIGHTING LLC"
              className="mt-1.5"
            />
            <p className="mt-1 text-[11px] text-g-text-faint">
              Shows on invoices, contracts, and tax docs.
            </p>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Owner phone
            </label>
            <Input
              type="tel"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              placeholder="(941) 555-0124"
              autoComplete="tel"
              className="mt-1.5"
            />
            <p className="mt-1 text-[11px] text-g-text-faint">
              Where Daily Briefing SMS lands (if enabled below).
            </p>
          </div>
        </div>
      </section>

      {/* 2 · Brand colors ─────────────────────────────────────────── */}
      <section className="g-card p-5 flex flex-col gap-4">
        <header>
          <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            2 · Brand colors
          </div>
        </header>
        <p className="text-[12px] text-g-text-muted leading-snug">
          Used on quote PDFs, your customer-facing review request emails,
          and (soon) the customer portal. The CRM itself runs on the
          GladiusTurf system theme — these don&rsquo;t change your sidebar.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <ColorPicker
            label="Primary"
            value={primaryHex}
            onChange={setPrimaryHex}
            hint="Your darkest brand color. Backgrounds + headers."
          />
          <ColorPicker
            label="Accent"
            value={accentHex}
            onChange={setAccentHex}
            hint="Your CTA / highlight color. Used on buttons + links."
          />
        </div>
      </section>

      {/* 3 · Service area ─────────────────────────────────────────── */}
      <section className="g-card p-5 flex flex-col gap-4">
        <header>
          <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            3 · Service area
          </div>
        </header>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            ZIP codes you serve
          </label>
          <Textarea
            value={zips}
            onChange={(e) => setZips(e.target.value)}
            rows={3}
            placeholder="34201, 34202, 34203, …"
            className="mt-1.5 font-geist-mono"
          />
          <p className="mt-1 text-[11px] text-g-text-faint">
            Comma or space separated. Drives Storm Radar coverage, Territory
            heatmap, and lead-routing rules.
          </p>
        </div>
      </section>

      {/* 4 · Language ─────────────────────────────────────────────── */}
      <section className="g-card p-5 flex flex-col gap-4">
        <header>
          <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            4 · Language
          </div>
        </header>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Primary language
          </label>
          <div className="mt-1.5 flex gap-2">
            {(["en", "es"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={
                  language === l
                    ? "h-9 px-4 rounded-md text-[12px] font-medium bg-g-accent text-black"
                    : "h-9 px-4 rounded-md text-[12px] font-medium bg-g-surface-2 text-g-text-muted hover:text-g-text"
                }
              >
                {l === "en" ? "English" : "Español"}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-g-text cursor-pointer">
          <input
            type="checkbox"
            checked={bilingual}
            onChange={(e) => setBilingual(e.target.checked)}
            className="h-4 w-4 accent-g-accent"
          />
          <span>
            Bilingual mode — render customer messages in both EN and ES
            when the customer&rsquo;s language is set.
          </span>
        </label>
      </section>

      {/* 5 · Reviews + 6 · Owner SMS ──────────────────────────────── */}
      <section className="g-card p-5 flex flex-col gap-4">
        <header>
          <div className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            5 · Customer feedback &amp; 6 · Owner notifications
          </div>
        </header>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Google Review URL
          </label>
          <Input
            type="url"
            value={reviewUrl}
            onChange={(e) => setReviewUrl(e.target.value)}
            placeholder="https://g.page/r/your-business/review"
            className="mt-1.5"
          />
          <p className="mt-1 text-[11px] text-g-text-faint">
            Where Reviews engine sends customers after a completed job.
          </p>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-g-text cursor-pointer">
          <input
            type="checkbox"
            checked={dailySms}
            onChange={(e) => setDailySms(e.target.checked)}
            className="h-4 w-4 accent-g-accent"
          />
          <span>
            Send me a daily SMS briefing at 6 AM (revenue, today&rsquo;s
            visits, leads needing follow-up).
          </span>
        </label>
      </section>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/app")}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Save shop profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
        {label}
      </label>
      <div className="mt-1.5 flex items-stretch gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-12 cursor-pointer rounded-md border border-g-border bg-g-surface-2 p-1"
          aria-label={`${label} color picker`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#0E1628"
          className="flex-1 font-geist-mono uppercase"
          maxLength={7}
        />
      </div>
      {hint && (
        <p className="mt-1 text-[11px] text-g-text-faint">{hint}</p>
      )}
    </div>
  );
}
