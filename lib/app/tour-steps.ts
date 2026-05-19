/**
 * Guided-tour script — the first-login walkthrough Felipe (and every
 * field-service owner/crew member) sees once. Plain-language, one
 * function per step, written for a landscaping / lighting shop owner —
 * not a software person.
 *
 * Each step optionally points at a sidebar engine (`engineSlug`). The
 * tour spotlights `[data-tour="nav-<engineSlug>"]` for that step. Steps
 * with no `engineSlug` are centered with no spotlight (welcome / finish).
 *
 * Role-awareness: `stepsForRole` drops any step whose engine the user's
 * role can't reach (e.g. a Field Tech never sees the Invoices or Reports
 * step). The single source of truth for "can this role see X" is
 * `canAccessEngine` in lib/app/access.ts — we reuse it so the tour can
 * never teach a screen the sidebar won't show.
 */

import type { TenantRole } from "@/lib/app/tenant-auth";
import { canAccessEngine } from "@/lib/app/access";

export type TourStep = {
  /** Stable id (used as React key + analytics-friendly handle). */
  id: string;
  /**
   * Sidebar engine slug this step teaches. When set, the tour spotlights
   * the matching nav link. When undefined the card is centered with no
   * spotlight (welcome / finish steps).
   */
  engineSlug?: string;
  title: string;
  /** 1–2 short, concrete sentences in shop-owner language. */
  body: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to GladiusTurf",
    body: "This is your whole shop in one place — leads, quotes, the crew's day, and the money. Take 60 seconds and I'll show you where everything lives.",
  },
  {
    id: "today",
    engineSlug: "today",
    title: "Dashboard — your morning glance",
    body: "Open this first every day. New leads, today's jobs, what's overdue, and money coming in — all on one screen so nothing slips.",
  },
  {
    id: "leads",
    engineSlug: "leads",
    title: "Leads — every new customer request",
    body: "Calls, web forms, and referrals land here the second they come in. Tap one to call back and turn it into a quote before the competition does.",
  },
  {
    id: "customers",
    engineSlug: "customers",
    title: "Customers — your full book",
    body: "Every property you've worked, with notes, history, and what they're worth. Search a name and see everything you've ever done for them.",
  },
  {
    id: "quotes",
    engineSlug: "quotes",
    title: "Quotes — price it and send it",
    body: "Build a price in 60 seconds and send it to the customer. Won quotes drop straight into Jobs — no re-typing.",
  },
  {
    id: "schedule",
    engineSlug: "schedule",
    title: "Schedule — who's where, when",
    body: "Drag jobs onto the calendar and assign a crew. Everyone sees the same plan, so no two trucks roll to the same yard.",
  },
  {
    id: "jobs",
    engineSlug: "jobs",
    title: "Jobs — the work in motion",
    body: "Every job from scheduled to done, with photos, checklists, and notes from the field. This is the heartbeat of the shop.",
  },
  {
    id: "routes",
    engineSlug: "routes",
    title: "Routes — stop wasting drive time",
    body: "GladiusTurf orders each crew's stops so they spend the day on lawns, not on the road. Fewer miles, more jobs.",
  },
  {
    id: "crew",
    engineSlug: "crew",
    title: "Crew — your people",
    body: "Set up your crews and who leads them. Assignments on the schedule pull straight from here.",
  },
  {
    id: "equipment",
    engineSlug: "equipment",
    title: "Equipment — mowers, trucks, gear",
    body: "Track every machine and when it's due for service. A dead mower at 7am is a lost day — this keeps you ahead of it.",
  },
  {
    id: "inventory",
    engineSlug: "inventory",
    title: "Inventory — parts & materials",
    body: "Mulch, fixtures, fittings, fertilizer — know what's on the shelf before you promise a job. Reorder before you run out.",
  },
  {
    id: "invoices",
    engineSlug: "invoices",
    title: "Invoices — get paid faster",
    body: "Finished jobs become invoices in one tap. Send, track who's late, and watch the money land.",
  },
  {
    id: "reports",
    engineSlug: "reports",
    title: "Reports — where the money really is",
    body: "See your best customers, your most profitable services, and which crew is carrying the week. Run the shop on facts, not gut.",
  },
  {
    id: "marketing",
    engineSlug: "marketing",
    title: "Marketing — what's bringing leads",
    body: "See which ads and pages actually turn into paying jobs, so every marketing dollar works as hard as you do.",
  },
  {
    id: "settings",
    engineSlug: "settings",
    title: "Settings & Team — invite your people",
    body: "Add your office and crew, pick what each one can see, and set up your shop's info. You're the owner — this is your control room.",
  },
  {
    id: "finish",
    title: "You're all set",
    body: "That's the whole shop. You can replay this tour anytime from the \"?\" in the bottom-left corner. Now go win some work.",
  },
];

/**
 * Filter the tour to the steps a given role can actually act on.
 *
 * - Steps with no `engineSlug` (welcome / finish) are ALWAYS kept.
 * - Steps with an `engineSlug` are kept only if `canAccessEngine` says
 *   that role (+ founder flag) can reach the engine — so a Field Tech's
 *   tour skips Quotes / Invoices / Reports, matching their sidebar.
 * - `role === null` (demo / founders-full shell) sees everything, but
 *   the tour only ever mounts for product === "tenant" anyway.
 */
export function stepsForRole(
  role: TenantRole | null,
  isFounder: boolean,
): TourStep[] {
  return TOUR_STEPS.filter((s) => {
    if (!s.engineSlug) return true;
    return canAccessEngine(role, isFounder, s.engineSlug);
  });
}
