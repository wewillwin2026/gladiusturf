/**
 * Cached, deterministic seed data for the demo CRM at /app.
 * All builders take the same `rng(N)` seed so reloads always produce the same
 * dataset. We cache at module scope — the dataset is read-only across renders.
 */

import { buildCustomers } from "./seed-customers";
import { buildJobs } from "./seed-jobs";
import { buildQuotes } from "./seed-quotes";
import { buildInvoices } from "./seed-invoices";
import { buildMessages } from "./seed-messages";
import { buildActivityFeed } from "./seed-events";
import { CREWS } from "./seed-crews";
import type {
  ActivityEvent,
  Crew,
  Customer,
  Invoice,
  Job,
  Message,
  Quote,
} from "@/lib/shared/types";

export type DemoState = {
  customers: Customer[];
  jobs: Job[];
  quotes: Quote[];
  invoices: Invoice[];
  messages: Message[];
  activity: ActivityEvent[];
  crews: Crew[];
  company: {
    name: string;
    city: string;
    ownerName: string;
    crewCount: number;
    customerCount: number;
    trailingTwelveCents: number;
  };
};

let cached: DemoState | null = null;

export function demoState(): DemoState {
  if (cached) return cached;
  const customers = buildCustomers(247);
  const jobs = buildJobs(customers, 3);
  const quotes = buildQuotes(customers, 32);
  const invoices = buildInvoices(customers, 200);
  const messages = buildMessages(customers, 400);
  const activity = buildActivityFeed({ customers, jobs, invoices, quotes });

  cached = {
    customers,
    jobs,
    quotes,
    invoices,
    messages,
    activity,
    crews: CREWS,
    company: {
      name: "Cypress Lawn & Landscape",
      city: "Tampa, FL",
      ownerName: "Marcus Cypress",
      crewCount: CREWS.length,
      customerCount: customers.filter((c) => c.status === "Active").length,
      trailingTwelveCents: 140_000_000, // $1.4M
    },
  };
  return cached;
}
