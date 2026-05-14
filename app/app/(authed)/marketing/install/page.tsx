import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Code2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import { CopyBlock } from "@/components/app/marketing/CopyBlock";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Install tracker · Marketing · GladiusTurf",
  robots: { index: false, follow: false },
};

/**
 * Tracker install page — visible to every tenant regardless of the
 * marketing_tab_enabled flag, so they can paste the snippet on their
 * site BEFORE we light up the full Marketing tab. Once the first event
 * lands, we'll flip the flag on their behalf.
 */
export default async function InstallTrackerPage() {
  const session = await readAppSession();
  if (session.kind === "unauthenticated") redirect("/app/login");
  if (session.kind !== "tenant") redirect("/app");

  const tenant = session.tenant;
  const sb = supabaseAdmin();

  // Last event seen — drives the "live" / "waiting" status pill.
  const { data: lastEvent } = await sb
    .from("web_events")
    .select("occurred_at, kind, path")
    .eq("tenant_id", tenant.id)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastSeenAt = lastEvent
    ? new Date(
        (lastEvent as { occurred_at: string }).occurred_at,
      ).toISOString()
    : null;
  const isLive = lastSeenAt
    ? Date.now() - new Date(lastSeenAt).getTime() < 24 * 60 * 60 * 1000
    : false;

  const snippet = `<script src="https://gladiusturf.com/marketing-tracker.js"
        data-tenant="${tenant.slug}"
        defer></script>`;

  const wpSnippet = `add_action('wp_head', function () { ?>
  <script src="https://gladiusturf.com/marketing-tracker.js"
          data-tenant="${tenant.slug}"
          defer></script>
<?php });`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={`${tenant.display_name} · Marketing`}
        title="Install the tracker"
        subtitle="Paste one line into your site's <head>. We'll start counting visitors, form starts, and quote conversions next to your customer data."
      />

      {/* Status pill */}
      <section className="g-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4">
          {isLive ? (
            <>
              <span className="inline-flex h-2 w-2 rounded-full bg-g-success animate-pulse" />
              <div className="min-w-0">
                <div className="text-[13px] text-g-text">
                  Live · last event {relativeTime(lastSeenAt!)}
                </div>
                <div className="text-[11px] text-g-text-muted">
                  We&rsquo;re receiving events from your site. The
                  Marketing tab will appear in your sidebar within an
                  hour once we&rsquo;ve confirmed clean data.
                </div>
              </div>
              <CheckCircle2 className="ml-auto h-4 w-4 text-g-success" />
            </>
          ) : (
            <>
              <span className="inline-flex h-2 w-2 rounded-full bg-g-text-faint" />
              <div className="min-w-0">
                <div className="text-[13px] text-g-text">
                  Waiting for your first event
                </div>
                <div className="text-[11px] text-g-text-muted">
                  After you paste the snippet, visit your site and
                  refresh this page — you should see the dot turn green.
                </div>
              </div>
              <Clock className="ml-auto h-4 w-4 text-g-text-faint" />
            </>
          )}
        </div>
      </section>

      {/* Snippet */}
      <section className="g-card overflow-hidden">
        <header className="flex items-center gap-2 border-b border-g-border-subtle px-5 py-3">
          <Code2 className="h-3.5 w-3.5 text-g-text-muted" />
          <h2 className="text-[13px] text-g-text">Standard HTML snippet</h2>
          <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Paste in &lt;head&gt;
          </span>
        </header>
        <div className="px-5 py-4">
          <CopyBlock value={snippet} />
          <p className="mt-3 text-[12px] text-g-text-muted">
            Works on any site that lets you edit the &lt;head&gt; — plain
            HTML, Webflow, Squarespace, Wix, Framer, Carrd. The script
            loads asynchronously and won&rsquo;t block your page.
          </p>
        </div>
      </section>

      {/* WordPress variant */}
      <section className="g-card overflow-hidden">
        <header className="flex items-center gap-2 border-b border-g-border-subtle px-5 py-3">
          <Code2 className="h-3.5 w-3.5 text-g-text-muted" />
          <h2 className="text-[13px] text-g-text">WordPress (functions.php)</h2>
          <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
            Theme code
          </span>
        </header>
        <div className="px-5 py-4">
          <CopyBlock value={wpSnippet} />
          <p className="mt-3 text-[12px] text-g-text-muted">
            Or use the &ldquo;Insert Headers and Footers&rdquo; plugin and paste
            the standard snippet into the &ldquo;Header&rdquo; box.
          </p>
        </div>
      </section>

      {/* What gets captured */}
      <section className="g-card overflow-hidden">
        <header className="flex items-center gap-2 border-b border-g-border-subtle px-5 py-3">
          <Sparkles className="h-3.5 w-3.5 text-g-text-muted" />
          <h2 className="text-[13px] text-g-text">What we capture (and don&rsquo;t)</h2>
        </header>
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div>
            <div className="text-[12px] font-medium text-g-text">Tracked</div>
            <ul className="mt-1.5 space-y-1 text-[12px] text-g-text-muted">
              <li>• Page views (every URL change)</li>
              <li>• Form start (first focus inside any form)</li>
              <li>• Form submit (HTML submit event)</li>
              <li>• Phone clicks (tel: links)</li>
              <li>• Email clicks (mailto: links)</li>
              <li>
                • Custom CTAs (any element with <code>data-track="cta"</code>)
              </li>
              <li>• Scroll depth (25/50/75/100%)</li>
              <li>• UTM source / medium / campaign (first-touch)</li>
            </ul>
          </div>
          <div>
            <div className="text-[12px] font-medium text-g-text">
              Not tracked
            </div>
            <ul className="mt-1.5 space-y-1 text-[12px] text-g-text-muted">
              <li>• No third-party cookies set</li>
              <li>• No precise GPS (city/region from Vercel headers only)</li>
              <li>
                • No keystroke / mouse / replay recording
              </li>
              <li>• No cross-site tracking — scoped to your tenant</li>
              <li>
                • Visitor IDs are SHA-256 hashes of IP+UA salted
                server-side
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Manual events callout */}
      <section className="g-card overflow-hidden">
        <header className="flex items-center gap-2 border-b border-g-border-subtle px-5 py-3">
          <Code2 className="h-3.5 w-3.5 text-g-text-muted" />
          <h2 className="text-[13px] text-g-text">Optional · manual events</h2>
        </header>
        <div className="px-5 py-4">
          <p className="text-[12px] text-g-text-muted">
            For custom funnel steps (e.g. &ldquo;watched the landing
            video&rdquo;), call the helper exposed on <code>window</code>:
          </p>
          <div className="mt-2">
            <CopyBlock
              value={`window.gladiusTrack("custom", "video_played", { videoId: "intro" });`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
