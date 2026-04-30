// Shared types used by both seeded demo data (lib/demo/*) and real War Room data.
// Keep these stable — components consume them from here.

export type Tier = "Independent" | "Pro" | "Enterprise";

export type CustomerStatus = "Active" | "Lapsed" | "Cancelled" | "Lead";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  status: CustomerStatus;
  tier: Tier;
  ltvCents: number;
  routeId: string;
  lastVisit: string; // ISO
  nextVisit: string | null; // ISO
  joinedAt: string; // ISO
  npsScore: number | null;
  notes?: string;
};

export type JobStatus =
  | "Scheduled"
  | "EnRoute"
  | "OnSite"
  | "Complete"
  | "Skipped"
  | "Rescheduled";

export type Job = {
  id: string;
  customerId: string;
  scheduledAt: string;
  durationMin: number;
  crewId: string;
  status: JobStatus;
  service: string;
  priceCents: number;
  notes?: string;
};

export type QuoteStage = "Draft" | "Sent" | "Viewed" | "Won" | "Lost";

export type Quote = {
  id: string;
  customerId: string;
  total: number; // cents
  stage: QuoteStage;
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  closedAt?: string;
  services: { name: string; sqft?: number; rate?: number; total: number }[];
  notes?: string;
};

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Void";

export type Invoice = {
  id: string;
  customerId: string;
  jobId?: string;
  amountCents: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
};

export type MessageChannel = "sms" | "email" | "voice" | "portal";

export type Message = {
  id: string;
  customerId: string;
  channel: MessageChannel;
  direction: "in" | "out";
  body: string;
  ts: string;
  read: boolean;
};

export type Crew = {
  id: string;
  name: string;
  members: { name: string; initials: string; role: "Lead" | "Tech" }[];
  vehiclePlate: string;
  active: boolean;
};

export type ActivityEvent = {
  id: string;
  ts: string;
  kind:
    | "job_completed"
    | "quote_sent"
    | "quote_viewed"
    | "quote_won"
    | "invoice_paid"
    | "review_received"
    | "message_received"
    | "customer_added";
  text: string;
  customerId?: string;
  amountCents?: number;
};

export type KPI = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  spark?: number[];
};
