import { rng } from "@/lib/shared/prng";
import type { Customer, Tier, CustomerStatus } from "@/lib/shared/types";

// Florida-blended naming pool — credible mix that matches Tampa demographics.
const FIRST = [
  "Marcus", "Elena", "Tomás", "Sofia", "Avery", "Henry", "Maya", "Luca",
  "Priya", "Diego", "Hana", "James", "Olivia", "Jaylen", "Noor", "Ezra",
  "Camila", "Liam", "Zara", "Wyatt", "Eve", "Reuben", "Imani", "Cole",
  "Nia", "Theo", "Iris", "Dakota", "Lena", "Felix", "Ana", "Brooks",
  "Yara", "Soren", "Kai", "Saanvi", "Raul", "Bea", "Heath", "Vera",
];
const LAST = [
  "Henderson", "Patel", "O'Brien", "Nguyen", "Cohen", "Ramirez", "Williams",
  "Chen", "Goldberg", "Adeyemi", "Torres", "Carlucci", "Park", "Singh",
  "Kowalski", "Beaumont", "Diaz", "Yamamoto", "MacGregor", "Rosenfeld",
  "Salazar", "Hopper", "Bauer", "Bristol", "Quintana", "Hampton", "Marsh",
  "Esposito", "Fitzgerald", "Nakamura", "Andrade", "Kapoor", "Lyons",
  "Thatcher", "Reyes", "Barclay", "Yousef", "DeSantis", "Vargas", "Kirkland",
];

const STREETS = [
  "Bayshore Blvd", "Riverside Dr", "Maple Hollow Ln", "Lakeshore Way",
  "Cypress Pointe", "Magnolia Ct", "Beaumont Ave", "Kennedy Pl",
  "Sunset Park Rd", "Heritage Oaks", "Tampa Bay Blvd", "Hampton Pl",
  "Coral Gardens", "Ridgeview Dr", "Hyde Park Ave", "Davis Islands Way",
  "Riverwalk Cove", "Westshore Ct", "Beach Park Ave", "Ballast Pt Cir",
];

const ZIPS = ["33606", "33625", "33626", "33511", "33578", "33602", "33609", "33611", "33629"];
// Tampa-ish lat/lng centroid; we jitter from here.
const LAT_CENTER = 27.94752;
const LNG_CENTER = -82.4584;

const STATUSES: CustomerStatus[] = ["Active", "Active", "Active", "Active", "Lapsed", "Cancelled", "Lead"];

const ROUTE_IDS = ["R-NORTH", "R-WEST", "R-SOUTH", "R-DOWNTOWN", "R-BAYSHORE", "R-EAST"];

export function buildCustomers(count = 247): Customer[] {
  const r = rng(1337);
  const customers: Customer[] = [];

  for (let i = 0; i < count; i++) {
    const first = r.pick(FIRST);
    const last = r.pick(LAST);
    const name = `${first} ${last}`;
    const street = `${r.int(100, 9999)} ${r.pick(STREETS)}`;
    const zip = r.pick(ZIPS);
    const lat = LAT_CENTER + r.float(-0.08, 0.08);
    const lng = LNG_CENTER + r.float(-0.12, 0.12);

    const tier: Tier = r.bool(0.55)
      ? "Independent"
      : r.bool(0.7)
        ? "Pro"
        : "Enterprise";

    const status = r.pick(STATUSES);

    // LTV roughly correlates with tier.
    const ltvBase = tier === "Enterprise" ? 4800 : tier === "Pro" ? 2400 : 1100;
    const ltvCents = Math.round(
      (ltvBase + r.int(0, ltvBase * 1.5)) * 100,
    );

    const joinedAtMonthsAgo = r.int(1, 36);
    const joinedAt = isoDaysAgo(joinedAtMonthsAgo * 30);

    const lastVisit =
      status === "Cancelled"
        ? isoDaysAgo(r.int(45, 180))
        : status === "Lapsed"
          ? isoDaysAgo(r.int(20, 60))
          : isoDaysAgo(r.int(0, 14));

    const nextVisit =
      status === "Active" || status === "Lead"
        ? isoDaysAgo(-r.int(0, 21))
        : null;

    const npsScore =
      status === "Active"
        ? r.bool(0.65)
          ? r.int(8, 10)
          : r.bool(0.5)
            ? r.int(5, 7)
            : null
        : null;

    customers.push({
      id: `cu_${pad(i + 1, 4)}`,
      name,
      email: `${first}.${last}`.toLowerCase().replace(/['"]/g, "") + "@example.com",
      phone: `(813) ${r.int(200, 989)}-${r.int(1000, 9999)}`,
      address: street,
      city: "Tampa",
      state: "FL",
      zip,
      lat,
      lng,
      status,
      tier,
      ltvCents,
      routeId: r.pick(ROUTE_IDS),
      lastVisit,
      nextVisit,
      joinedAt,
      npsScore,
    });
  }

  return customers;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}
