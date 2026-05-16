import { supabaseAdmin } from "@/lib/supabase";

export type Counts = {
  visitorsToday: number;
  visitorsYesterday: number;
  visitors7d: number;
  bookingsToday: number;
  bookings7d: number;
  demoLoginsToday: number;
  demoLogins7d: number;
  signedToday: number;
  signed7d: number;
  schemaMissing?: boolean;
};

export type RecentVisitor = {
  id: string;
  visitorHash: string;
  lastSeenAt: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

const ONE_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function isMissing(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  return (
    e?.code === "42P01" ||
    (e?.message || "").includes("does not exist") ||
    (e?.message || "").includes("not found")
  );
}

export async function loadOverviewCounts(): Promise<Counts> {
  const empty: Counts = {
    visitorsToday: 0,
    visitorsYesterday: 0,
    visitors7d: 0,
    bookingsToday: 0,
    bookings7d: 0,
    demoLoginsToday: 0,
    demoLogins7d: 0,
    signedToday: 0,
    signed7d: 0,
  };

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return { ...empty, schemaMissing: true };
  }

  const now = new Date();
  const today = startOfDay(now);
  const yesterday = startOfDay(new Date(now.getTime() - ONE_DAY));
  const sevenDaysAgo = startOfDay(new Date(now.getTime() - 7 * ONE_DAY));

  try {
    const [
      visitorsTodayRes,
      visitorsYesterdayRes,
      visitors7dRes,
      demoLoginsTodayRes,
      demoLogins7dRes,
    ] = await Promise.all([
      sb
        .from("visitors")
        .select("id", { count: "exact", head: true })
        .gte("last_seen_at", today),
      sb
        .from("visitors")
        .select("id", { count: "exact", head: true })
        .gte("last_seen_at", yesterday)
        .lt("last_seen_at", today),
      sb
        .from("visitors")
        .select("id", { count: "exact", head: true })
        .gte("last_seen_at", sevenDaysAgo),
      sb
        .from("tracking_events")
        .select("id", { count: "exact", head: true })
        .eq("type", "demo_login")
        .gte("ts", today),
      sb
        .from("tracking_events")
        .select("id", { count: "exact", head: true })
        .eq("type", "demo_login")
        .gte("ts", sevenDaysAgo),
    ]);

    if (visitorsTodayRes.error && isMissing(visitorsTodayRes.error)) {
      return { ...empty, schemaMissing: true };
    }

    const counts: Counts = {
      ...empty,
      visitorsToday: visitorsTodayRes.count ?? 0,
      visitorsYesterday: visitorsYesterdayRes.count ?? 0,
      visitors7d: visitors7dRes.count ?? 0,
      demoLoginsToday: demoLoginsTodayRes.count ?? 0,
      demoLogins7d: demoLogins7dRes.count ?? 0,
    };

    // Demo bookings live in the existing `demo_requests` table.
    try {
      const [bookTodayRes, book7dRes, signedTodayRes, signed7dRes] =
        await Promise.all([
          sb
            .from("demo_requests")
            .select("id", { count: "exact", head: true })
            .gte("created_at", today),
          sb
            .from("demo_requests")
            .select("id", { count: "exact", head: true })
            .gte("created_at", sevenDaysAgo),
          sb
            .from("demo_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "won")
            .gte("updated_at", today),
          sb
            .from("demo_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "won")
            .gte("updated_at", sevenDaysAgo),
        ]);
      counts.bookingsToday = bookTodayRes.count ?? 0;
      counts.bookings7d = book7dRes.count ?? 0;
      counts.signedToday = signedTodayRes.count ?? 0;
      counts.signed7d = signed7dRes.count ?? 0;
    } catch {
      // demo_requests may not be set up; non-fatal.
    }

    return counts;
  } catch (err) {
    if (isMissing(err)) {
      return { ...empty, schemaMissing: true };
    }
    return empty;
  }
}

export async function loadRecentVisitors(
  limit = 50,
): Promise<{ visitors: RecentVisitor[]; schemaMissing: boolean }> {
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return { visitors: [], schemaMissing: true };
  }

  try {
    const { data, error } = await sb
      .from("visitors")
      .select(
        "id, visitor_hash, last_seen_at, utm_source, utm_medium, utm_campaign, referrer, country, region, city",
      )
      .order("last_seen_at", { ascending: false })
      .limit(limit);
    if (error) {
      if (isMissing(error)) return { visitors: [], schemaMissing: true };
      throw error;
    }
    return {
      visitors: (data ?? []).map((v) => ({
        id: v.id,
        visitorHash: v.visitor_hash,
        lastSeenAt: v.last_seen_at,
        utmSource: v.utm_source,
        utmMedium: v.utm_medium,
        utmCampaign: v.utm_campaign,
        referrer: v.referrer,
        country: v.country,
        region: v.region,
        city: v.city,
      })),
      schemaMissing: false,
    };
  } catch {
    return { visitors: [], schemaMissing: false };
  }
}

export type FunnelCounts = {
  marketingVisits: number;
  demoFormFocus: number;
  demoFormSubmit: number;
  demoLogins: number;
  quoteDrafted: number;
  settingsBilling: number;
  signedDeals: number;
  schemaMissing: boolean;
};

export async function loadFunnelCounts(days = 30): Promise<FunnelCounts> {
  const empty: FunnelCounts = {
    marketingVisits: 0,
    demoFormFocus: 0,
    demoFormSubmit: 0,
    demoLogins: 0,
    quoteDrafted: 0,
    settingsBilling: 0,
    signedDeals: 0,
    schemaMissing: false,
  };

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return { ...empty, schemaMissing: true };
  }

  const since = new Date(Date.now() - days * ONE_DAY).toISOString();

  try {
    const counts = (
      await Promise.all(
        [
          { label: "marketingVisits", type: "pageview", product: "marketing" },
          { label: "demoFormFocus", type: "demo_form_focus" },
          { label: "demoFormSubmit", type: "demo_form_submit" },
          { label: "demoLogins", type: "demo_login" },
          { label: "quoteDrafted", type: "quote_drafted" },
          { label: "settingsBilling", type: "settings_billing_view" },
        ].map(async (q) => {
          let query = sb
            .from("tracking_events")
            .select("id", { count: "exact", head: true })
            .eq("type", q.type)
            .gte("ts", since);
          if (q.product) query = query.eq("product", q.product);
          const { count, error } = await query;
          if (error && isMissing(error)) {
            throw new Error("schema-missing");
          }
          return [q.label, count ?? 0] as const;
        }),
      )
    ).reduce<FunnelCounts>(
      (acc, [k, v]) => ({ ...acc, [k]: v }),
      empty,
    );
    return counts;
  } catch (err) {
    const e = err as { message?: string };
    if (e?.message === "schema-missing") {
      return { ...empty, schemaMissing: true };
    }
    return empty;
  }
}

export type FunnelLeak = {
  windowDays: number;
  steps: { key: string; label: string; count: number; pctOfTop: number }[];
  biggestLeak: {
    fromKey: string;
    toKey: string;
    fromLabel: string;
    toLabel: string;
    lostCount: number;
    dropPct: number;
  } | null;
  recommendation: string | null;
  schemaMissing: boolean;
  note: string;
};

/**
 * Funnel Leak Radar — the decision view, not a dashboard.
 *
 * Reuses the SAME funnel `loadFunnelCounts` already computes and
 * answers one question: "what is the single biggest leak this window
 * and what one experiment fixes it?" 100% read-only — every fix that
 * touches the (founder-locked) landing is framed as a proposal, never
 * applied here. Sister to gladius-crm's radar.funnelLeaks.
 */
export async function loadBiggestLeak(days = 30): Promise<FunnelLeak> {
  // Turf landing traffic is early-stage and low; below this we refuse
  // to invent a leak from noise (Bezos: be honest, don't fabricate).
  const MIN_SIGNAL = 5;
  const LOCK_NOTE =
    "Read-only. Any fix that touches the landing page is a proposal — the Turf landing is founder-locked and needs explicit unlock to test.";

  const f = await loadFunnelCounts(days);

  const STEPS: { key: keyof FunnelCounts; label: string }[] = [
    { key: "marketingVisits", label: "Marketing visits" },
    { key: "demoFormFocus", label: "Touched demo form" },
    { key: "demoFormSubmit", label: "Submitted demo form" },
    { key: "demoLogins", label: "Logged into demo" },
    { key: "quoteDrafted", label: "Drafted a quote" },
    { key: "settingsBilling", label: "Viewed billing" },
    { key: "signedDeals", label: "Signed" },
  ];

  const top = Math.max(1, f.marketingVisits);
  const steps = STEPS.map((s) => {
    const count = (f[s.key] as number) ?? 0;
    return {
      key: s.key as string,
      label: s.label,
      count,
      pctOfTop: Math.round((count / top) * 1000) / 10,
    };
  });

  const RECS: Record<string, string> = {
    demoFormFocus:
      "Most visitors never touch the demo form — the offer/CTA isn't pulling. Propose: stronger above-fold proof (the Bright Lights result) + a clearer single CTA.",
    demoFormSubmit:
      "They start the demo form but don't submit — form friction. Propose: cut fields and surface the '10 jobs in 30 days or you don't pay' guarantee inline.",
    demoLogins:
      "They book but never log into the demo — activation gap. Propose: faster, clearer demo-access email + a same-day reminder.",
    quoteDrafted:
      "They log in but never draft a quote — onboarding is unclear. Propose: a guided first-quote prompt on demo login.",
    settingsBilling:
      "They use it but never look at billing — value isn't landing. Propose: an in-app 'jobs booked / ROI' nudge toward upgrade.",
    signedDeals:
      "They view billing but don't sign — pricing or risk objection. Propose: lead the billing step with the 30-day guarantee.",
  };

  if (f.schemaMissing) {
    return {
      windowDays: days,
      steps,
      biggestLeak: null,
      recommendation: "Tracking schema not live yet — run the tracking migration, then re-check.",
      schemaMissing: true,
      note: LOCK_NOTE,
    };
  }

  let biggestLeak: FunnelLeak["biggestLeak"] = null;
  let recommendation: string | null = null;

  if (steps[0].count >= MIN_SIGNAL) {
    let worst = -1;
    for (let i = 1; i < STEPS.length; i++) {
      const prev = steps[i - 1].count;
      const cur = steps[i].count;
      if (prev < MIN_SIGNAL) continue;
      const dropPct = (prev - cur) / prev;
      if (dropPct > worst) {
        worst = dropPct;
        biggestLeak = {
          fromKey: steps[i - 1].key,
          toKey: steps[i].key,
          fromLabel: steps[i - 1].label,
          toLabel: steps[i].label,
          lostCount: prev - cur,
          dropPct: Math.round(dropPct * 1000) / 10,
        };
      }
    }
    recommendation = biggestLeak
      ? RECS[biggestLeak.toKey] ??
        "Funnel is healthy across measured steps in this window — keep feeding it traffic."
      : "Funnel is healthy across measured steps in this window — keep feeding it traffic.";
  } else {
    recommendation = `Only ${steps[0].count} marketing visits in the last ${days}d — not enough to trust a leak. Drive outreach/content traffic, then re-check.`;
  }

  return {
    windowDays: days,
    steps,
    biggestLeak,
    recommendation,
    schemaMissing: false,
    note: LOCK_NOTE,
  };
}

export type ExitPage = { path: string; exits: number };

export async function loadFalloff(
  days = 30,
): Promise<{
  exitPages: ExitPage[];
  rageClicks: number;
  deadClicks: number;
  schemaMissing: boolean;
}> {
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return { exitPages: [], rageClicks: 0, deadClicks: 0, schemaMissing: true };
  }

  const since = new Date(Date.now() - days * ONE_DAY).toISOString();

  try {
    const exitsRes = await sb
      .from("tracking_events")
      .select("path")
      .eq("type", "exit")
      .gte("ts", since)
      .limit(2000);
    if (exitsRes.error) {
      if (isMissing(exitsRes.error)) {
        return {
          exitPages: [],
          rageClicks: 0,
          deadClicks: 0,
          schemaMissing: true,
        };
      }
      throw exitsRes.error;
    }
    const exitMap = new Map<string, number>();
    for (const r of exitsRes.data ?? []) {
      const p = (r.path as string) || "/";
      exitMap.set(p, (exitMap.get(p) || 0) + 1);
    }
    const exitPages = Array.from(exitMap.entries())
      .map(([path, exits]) => ({ path, exits }))
      .sort((a, b) => b.exits - a.exits)
      .slice(0, 12);

    const [rageRes, deadRes] = await Promise.all([
      sb
        .from("tracking_events")
        .select("id", { count: "exact", head: true })
        .eq("type", "rage_click")
        .gte("ts", since),
      sb
        .from("tracking_events")
        .select("id", { count: "exact", head: true })
        .eq("type", "dead_click")
        .gte("ts", since),
    ]);

    return {
      exitPages,
      rageClicks: rageRes.count ?? 0,
      deadClicks: deadRes.count ?? 0,
      schemaMissing: false,
    };
  } catch {
    return { exitPages: [], rageClicks: 0, deadClicks: 0, schemaMissing: false };
  }
}

export type AttributionRow = {
  source: string;
  visitors: number;
  demoBookings: number;
  signedDeals: number;
  revenueCents: number;
};

export async function loadAttribution(): Promise<{
  rows: AttributionRow[];
  schemaMissing: boolean;
}> {
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return { rows: [], schemaMissing: true };
  }

  try {
    const visRes = await sb
      .from("visitors")
      .select("utm_source")
      .limit(5000);
    if (visRes.error) {
      if (isMissing(visRes.error)) return { rows: [], schemaMissing: true };
      throw visRes.error;
    }
    const visBySource = new Map<string, number>();
    for (const v of visRes.data ?? []) {
      const s = (v.utm_source as string) || "direct";
      visBySource.set(s, (visBySource.get(s) || 0) + 1);
    }

    let bookings: { utm_source: string | null; status: string | null; conversion_value_cents: number | null }[] = [];
    try {
      const res = await sb
        .from("demo_requests")
        .select("utm_source, status, conversion_value_cents")
        .limit(2000);
      if (!res.error) bookings = res.data ?? [];
    } catch {
      // demo_requests not set up; empty.
    }

    const rows: AttributionRow[] = [];
    const sources = new Set<string>([
      ...visBySource.keys(),
      ...bookings.map((b) => b.utm_source || "direct"),
    ]);
    for (const source of sources) {
      const bks = bookings.filter((b) => (b.utm_source || "direct") === source);
      rows.push({
        source,
        visitors: visBySource.get(source) || 0,
        demoBookings: bks.length,
        signedDeals: bks.filter((b) => b.status === "won").length,
        revenueCents: bks
          .filter((b) => b.status === "won")
          .reduce((s, b) => s + (b.conversion_value_cents || 0), 0),
      });
    }
    rows.sort((a, b) => b.revenueCents - a.revenueCents || b.visitors - a.visitors);
    return { rows: rows.slice(0, 18), schemaMissing: false };
  } catch {
    return { rows: [], schemaMissing: false };
  }
}

export type ReplaySession = {
  id: string;
  visitorHash: string;
  startedAt: string;
  durationMs: number | null;
  product: string | null;
  entryPath: string | null;
  exitPath: string | null;
  events: { ts: string; type: string; path: string | null; target: string | null }[];
};

export async function loadReplays(limit = 18): Promise<{
  sessions: ReplaySession[];
  schemaMissing: boolean;
}> {
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return { sessions: [], schemaMissing: true };
  }

  try {
    const sessionsRes = await sb
      .from("sessions")
      .select(
        "id, visitor_id, started_at, duration_ms, product, entry_path, exit_path",
      )
      .order("started_at", { ascending: false })
      .limit(limit);
    if (sessionsRes.error) {
      if (isMissing(sessionsRes.error)) return { sessions: [], schemaMissing: true };
      throw sessionsRes.error;
    }
    const sessions = sessionsRes.data ?? [];
    if (sessions.length === 0) return { sessions: [], schemaMissing: false };

    const visIds = Array.from(
      new Set(sessions.map((s) => s.visitor_id).filter(Boolean)),
    ) as string[];
    const visRes = visIds.length
      ? await sb.from("visitors").select("id, visitor_hash").in("id", visIds)
      : { data: [] };
    const visHashMap = new Map<string, string>();
    for (const v of visRes.data ?? []) {
      visHashMap.set(v.id, v.visitor_hash as string);
    }

    const sessionIds = sessions.map((s) => s.id);
    const evRes = await sb
      .from("tracking_events")
      .select("session_id, ts, type, path, target")
      .in("session_id", sessionIds)
      .order("ts", { ascending: true })
      .limit(500);

    const eventsBySess = new Map<
      string,
      { ts: string; type: string; path: string | null; target: string | null }[]
    >();
    for (const ev of evRes.data ?? []) {
      const sid = ev.session_id as string;
      const arr = eventsBySess.get(sid) || [];
      arr.push({
        ts: ev.ts as string,
        type: ev.type as string,
        path: (ev.path as string) || null,
        target: (ev.target as string) || null,
      });
      eventsBySess.set(sid, arr);
    }

    return {
      sessions: sessions.map((s) => ({
        id: s.id as string,
        visitorHash: visHashMap.get(s.visitor_id as string) || "—",
        startedAt: s.started_at as string,
        durationMs: (s.duration_ms as number) ?? null,
        product: (s.product as string) || null,
        entryPath: (s.entry_path as string) || null,
        exitPath: (s.exit_path as string) || null,
        events: eventsBySess.get(s.id as string) || [],
      })),
      schemaMissing: false,
    };
  } catch {
    return { sessions: [], schemaMissing: false };
  }
}
