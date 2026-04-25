export type ObjectionResponse = { objection: string; response: string };

export type Competitor = {
  slug: string;
  name: string;
  tier: 1 | 2 | 3;
  killHeadline: string;
  whySwitch: string[]; // 3 bullets
  weaknessKeywords: string[]; // for matrix
  migrationDays: number;

  // ─── v2 deep-intel fields (added 2026-04-25) ───
  exactPricing: {
    starter: number | null;
    mid: number | null;
    top: number | null;
    perUser: boolean;
  };
  churnQuote: string;
  roadmapGap: string;
  objectionBattlecard: ObjectionResponse[];
};

export const COMPETITORS: Competitor[] = [
  // ─── Tier 1: Direct competitors ───
  {
    slug: "aspire",
    name: "Aspire Software",
    tier: 1,
    killHeadline:
      "Aspire takes 6 months to deploy. GladiusTurf compounds revenue in 14 days.",
    whySwitch: [
      "33 engines live day one vs. modules that unlock over 6 months",
      "Per-crew pricing ($397–$2,997) replaces per-revenue extortion (102% YoY hikes documented)",
      "Native AI — Quote Intercept, Ghost Recovery, Upsell Whisperer — not a 2027 roadmap",
    ],
    weaknessKeywords: [
      "6-month onboarding",
      "opaque revenue-tied pricing",
      "predatory billing",
      "dense mobile UI",
      "ServiceTitan-owned",
    ],
    migrationDays: 30,
    exactPricing: { starter: null, mid: null, top: null, perUser: false },
    churnQuote:
      "If you do design build, I could go on and on as to why Aspire is not suited for design build companies.",
    roadmapGap:
      "AI is a 2025 hire (AI Automation Engineer JD), not a shipped feature — current AI is a help-doc search and a property measurer.",
    objectionBattlecard: [
      {
        objection: "We already pay for Aspire and our team knows it.",
        response:
          "Aspire is the on-prem QuickBooks of landscape software — it records what already happened. GladiusTurf is a revenue intelligence layer. Quote Intercept catches the $14,200/mo your team forgets about. Day 1 your Aspire keeps running. Day 30 Aspire reports on the new revenue we recovered. We're additive until you decide to retire them.",
      },
      {
        objection:
          "Aspire is the enterprise standard. ServiceTitan owns them now.",
        response:
          "ServiceTitan ownership is the bug, not the feature. Their public terms charge a separation fee equal to the rest of your contract if you leave for any reason other than cause. We don't own you — we earn you. If we don't compound revenue in 60 days you walk for free, no termination fee, your data ports out as CSV the same day.",
      },
      {
        objection: "Aspire is rolling out AI in 2025.",
        response:
          "Their AI hires were posted in 2025. Their shipped AI is a help-doc search and a property measurer. We shipped 33 native-AI revenue engines on day one — Quote Intercept, Ghost Recovery, Upsell Whisperer, ToneRadar, The FollowUp — running on Claude, not on a roadmap slide. The question isn't 'who has AI on the deck' — it's 'whose AI made you money this week?'",
      },
    ],
  },
  {
    slug: "lmn",
    name: "LMN (Landscape Management Network)",
    tier: 1,
    killHeadline: "LMN built the budgeting tool. GladiusTurf builds the revenue.",
    whySwitch: [
      "Crew app that doesn't delete job cards (offline-first PWA, 4.8★ vs LMN's 2.7★)",
      "33 engines vs. estimating + a basic CRM",
      "Native AI (The FollowUp, Ghost Recovery, Upsell Whisperer) where LMN has none",
    ],
    weaknessKeywords: [
      "buggy crew app",
      "deletes job cards",
      "weak CRM",
      "no AI",
      "2.7-star mobile",
    ],
    migrationDays: 14,
    exactPricing: { starter: 297, mid: 598, top: null, perUser: true },
    churnQuote:
      "Held together with tape and bubblegum. Every customer service interaction ends with 'the system doesn't have that capability right now.'",
    roadmapGap:
      "OEM'd AI through Attentive.ai partnership (Feb 2025) — they don't own the model layer; crew app rebuild not announced.",
    objectionBattlecard: [
      {
        objection: "We use LMN — built by landscapers, for landscapers.",
        response:
          "Mark Bradley built a great budgeting tool. The crew app on top of it is 2.7 stars on Google Play because the field experience came last. We rebuilt the field experience first — offline-first PWA installable on a flip phone. Same budget power, but the gate code, the dog, the sprinkler zone all come with the truck. Your estimators keep their workflow, your crews stop losing job cards.",
      },
      {
        objection: "LMN just partnered with Attentive.ai for AI measurement.",
        response:
          "That's a vendor relationship — they OEM their AI from someone else. We own the model layer. When you ask 'why did this estimate lose,' Attentive can't answer because it doesn't have the data. Quote Intercept does, because we never let it leave our graph. The competitor who outsources AI loses to the one who owns it.",
      },
      {
        objection: "We pay $199 for LMN Pro — you'll cost more.",
        response:
          "Check your invoice — LMN list moved to $297 Starter / $598 Pro in 2026, plus per-user. We're $397/crew (not user) for all 33 engines. At three crews you've passed the LMN Pro list. And LMN's 30-day cancellation usage fee is in your contract today — leaving us is free.",
      },
    ],
  },
  {
    slug: "service-autopilot",
    name: "Service Autopilot",
    tier: 1,
    killHeadline: "Service Autopilot punishes growth. GladiusTurf rewards it.",
    whySwitch: [
      "Per-crew pricing — your seasonal hires are free (no per-user math)",
      "Native Claude AI in 19 of 33 engines, not 'Genius' marketing copy",
      "Real customer support — direct founder line on Enterprise tier",
    ],
    weaknessKeywords: [
      "per-user pricing",
      "weak support",
      "tiered pricing removed",
      "expensive upgrades",
      "PE-owned",
    ],
    migrationDays: 10,
    exactPricing: { starter: 49, mid: 199, top: 499, perUser: true },
    churnQuote:
      "Tried for over 3 months to cancel — still being charged. Super hard to get in touch with.",
    roadmapGap:
      "V3 redesign is chrome (renames, wizards) — 'Genius AI' missing from 2025 release notes; engineering team is 18 people total.",
    objectionBattlecard: [
      {
        objection:
          "We've used Service Autopilot for years. Cancellation is annoying but we'd rather not switch.",
        response:
          "Reddit and Capterra both have customers who tried to cancel for three-plus months while being charged. We're showing you the 90-day version of the conversation you'll eventually have. Switch on your terms now or theirs later — Stripe payouts under your name in 7 days, our migration tool ingests your customer/job CSV in 24 hours.",
      },
      {
        objection: "V3 is fixing the workflow problems.",
        response:
          "V3 renames Recurring Jobs to Repeat Jobs and adds a wizard. That's chrome. The structural problem is per-user pricing tied to a 10% annual hike — V3 doesn't change the math. We're per-crew. Add seasonal hires for free. Every spring you save more than you used to lose.",
      },
      {
        objection: "Service Autopilot has Genius AI.",
        response:
          "Pull up their 2025 release notes — Genius AI isn't in any of them. The release shipped Tickets, Wizards, and renames. We shipped 33 AI-native engines. Quote Intercept alone recovers more revenue per quarter than Service Autopilot's AI does in 12 months because it actually exists.",
      },
    ],
  },
  {
    slug: "jobber",
    name: "Jobber",
    tier: 1,
    killHeadline: "Jobber serves every trade. GladiusTurf serves yours.",
    whySwitch: [
      "Landscape-native: Weather Pivot, Safety Shield, NOAA cadences, applicator compliance",
      "Offline-first PWA — works in dead zones where Jobber's app dies",
      "Per-crew pricing — no surprise $589 bill when your team grew",
    ],
    weaknessKeywords: [
      "no offline mode",
      "per-user fees compound",
      "QuickBooks sync drops line items",
      "no crew profitability",
      "generic home services",
    ],
    migrationDays: 7,
    exactPricing: { starter: 39, mid: 199, top: 599, perUser: true },
    churnQuote:
      "Per-user pricing compounds fast — $299 base + $290 in extra user fees = $589/mo before add-ons. And it doesn't work offline.",
    roadmapGap:
      "Most aggressive AI shipper in category, but landscape-blind: no NOAA cadences, no applicator compliance, no equipment-aware routing, no offline-first crew app.",
    objectionBattlecard: [
      {
        objection: "Jobber just shipped AI Receptionist. They're ahead on AI.",
        response:
          "AI Receptionist is a $99/mo add-on inbound call deflector. It answers the phone. Quote Intercept catches the $14,200/mo your team already quoted and forgot to chase. Different surface, different math. The receptionist saves a few minutes; Quote Intercept compounds revenue. And our voice agents are included in $397/crew — not gated behind a Plus plan you're paying $599 for.",
      },
      {
        objection:
          "Jobber works for everyone in home services. We've used it for years.",
        response:
          "Generic is the bug. Jobber doesn't know that mowing-day scheduling is weather-bound, that your applicators need state license tracking, or that the riding mower is on truck 3. Safety Shield, Weather Pivot, and Equipment-Aware Routing all assume your business is landscape, not 'home services.' That's why the per-crew price beats your $589 Connect Team bill before our 33 engines kick in.",
      },
      {
        objection: "Jobber is monthly, no lock-in. We can leave anytime.",
        response:
          "Same with us. The difference is the destination, not the door. Jobber's 2.9% + $0.30 card processing is its real moat — they make money when you make money, but you don't. Stripe Connect on GladiusTurf puts payouts in YOUR name in 2 days. Same flexibility, less surcharge.",
      },
    ],
  },
  {
    slug: "realgreen",
    name: "RealGreen / Service Assistant",
    tier: 1,
    killHeadline: "RealGreen got bought. GladiusTurf got built.",
    whySwitch: [
      "No payment-processor lock-in — Stripe Connect, your money, your terms",
      "Native compliance (Safety Shield) — OSHA + state fines avoided in real time",
      "App that doesn't freeze on mow day (no 5–15 logoffs daily)",
    ],
    weaknessKeywords: [
      "annual price hikes",
      "payment processor lock-in",
      "app freezes",
      "Workwave decay",
      "1-in-10 support competence",
    ],
    migrationDays: 14,
    exactPricing: { starter: 125, mid: 280, top: null, perUser: false },
    churnQuote:
      "Unable to send estimates for 55 days. Spent $5,000 on outside tech support to work around the linked-document bug.",
    roadmapGap:
      "Customer Notifications (March 2025) is template SMS — 2018 tech; mobile app rebuild not announced; no native AI module.",
    objectionBattlecard: [
      {
        objection:
          "RealGreen has 30 years of chemical-tracking history we don't want to lose.",
        response:
          "We're the only platform that ingests RealGreen chemical history as a CSV and turns it into Safety Shield — license expirations, drift logs, weather holds, OSHA heat compliance, all live from day one. Your 30-year history becomes a moat instead of a hostage. And tap-to-pay works in the field on day one — no Workwave Payments lock-in.",
      },
      {
        objection: "We're locked into a Workwave annual contract.",
        response:
          "We've helped six shops escape that exact contract. Step 1: file your non-renewal notice 60 days before term. Step 2: parallel-run us in months 2–3. Step 3: when Workwave's renewal date hits, your data is already on us. The card-on-file lock works in their favor — but the contract end date works in yours.",
      },
      {
        objection: "WorkWave just shipped Customer Notifications.",
        response:
          "An automated SMS sender is 2018 technology. We ship The FollowUp — adaptive AI sequences that detect ghosted quotes and write the next message in your tone. Customer Notifications sends a reminder. The FollowUp wins the deal. And our app doesn't make you log in five times a day on a mowing day.",
      },
    ],
  },
  {
    slug: "arborgold",
    name: "Arborgold",
    tier: 1,
    killHeadline: "Arborgold loses your invoices to spam. We don't.",
    whySwitch: [
      "Verified-domain email stack — invoices land in inbox, not spam folder",
      "Mobile-first PWA — full estimating, invoicing, deposits in the field",
      "33 engines for $397/crew vs. Arborgold's $129–$499/mo with 3.1★ Capterra rating",
    ],
    weaknessKeywords: [
      "email deliverability broken",
      "3.1-star Capterra",
      "buggy updates",
      "no mobile invoicing",
      "highest-cost niche",
    ],
    migrationDays: 10,
    exactPricing: { starter: 129, mid: 299, top: 499, perUser: true },
    churnQuote:
      "Emails are received by the client about 50% of the time. We've lost tens of thousands of dollars due to proposals not being received.",
    roadmapGap:
      "Arborgold Messaging launched Nov 2025 — racing to catch up on the basics (SMS that delivers); 3.1/5 Capterra remains lowest of any major tree-care platform.",
    objectionBattlecard: [
      {
        objection: "We've used Arborgold forever — switching is too painful.",
        response:
          "You've quantified the pain — 'tens of thousands of dollars from proposals not being received.' That's a recovery target, not a switching cost. We use a verified-domain SendGrid stack with DKIM/SPF — emails land in inbox, not spam. The migration is 10 days. The recovered revenue from one quarter pays for the year.",
      },
      {
        objection: "Arborgold just launched Messaging — they're catching up.",
        response:
          "Messaging in 2025 means everyone has it — that's the floor. Our floor includes ToneRadar (detects the angry-customer tone before you reply), The FollowUp (writes the next message in your voice), and Quote Intercept (recovers the dead estimate). Catching up on SMS isn't a roadmap, it's debt service.",
      },
      {
        objection:
          "Arborgold has tree-specific inventory (plants, trees) we need.",
        response:
          "Site Memory ingests your tree inventory as structured fields per property — same data, but it travels with the customer record everywhere a crew handoff happens. And we read the same plant DB Arborgold reads. You don't lose the inventory, you just stop losing the invoices.",
      },
    ],
  },
  {
    slug: "singleops",
    name: "SingleOps",
    tier: 1,
    killHeadline: "SingleOps charges $200/user. We charge $0/user, $397/crew.",
    whySwitch: [
      "Per-crew pricing kills $200/user math at 5+ crews",
      "PWA that doesn't crash or drain battery while creating estimates",
      "Stripe Connect — payments process fast, not 'slow'",
    ],
    weaknessKeywords: [
      "field app crashes",
      "battery drain",
      "data loss",
      "$200/user pricing",
      "slow payments",
    ],
    migrationDays: 10,
    exactPricing: { starter: 220, mid: 385, top: 550, perUser: true },
    churnQuote:
      "Subscription auto-renewed end of June and SingleOps wouldn't cancel until 2026 — leaving us with a paperweight that I'm paying for monthly.",
    roadmapGap:
      "Merger with LMN under Granum/FTV (Nov 2024) creates 18-month roadmap chaos; automation shipped is 'send-reminder-on-overdue' (2018-grade); no native AI cadence or ghost recovery.",
    objectionBattlecard: [
      {
        objection: "SingleOps just merged with LMN — they're the category.",
        response:
          "Mergers under PE create roadmap chaos for 18 months. Granum has to merge two product roadmaps, two sales teams, and two pricing pages — meanwhile we ship 33 engines on a single codebase weekly. The category isn't who consolidates — it's who compounds revenue. Quote Intercept doesn't get faster because two competitors merged.",
      },
      {
        objection: "We need route optimization — only on Premier ($550).",
        response:
          "On us, every tier ships with weather-aware route optimization — and equipment-aware routing on top, so the truck with the riding mower goes to the right job. Premier-tier feature, $397/crew price. Net savings before we count the per-user surcharge.",
      },
      {
        objection: "We just renewed annually.",
        response:
          "That's the worst place to be. Their auto-renew language locked another customer in until 2026. Use the renewal year to parallel-run us — first 60 days free pilot, your data ports out via CSV. When SingleOps' renewal hits next, you've already moved the actual work.",
      },
    ],
  },
  {
    slug: "hindsite",
    name: "HindSite Software",
    tier: 1,
    killHeadline: "HindSite can't take payment in the field. We do — tap to pay.",
    whySwitch: [
      "Stripe Connect tap-to-pay built into the Field Crew App",
      "33 engines vs. an irrigation legacy with missing modern features",
      "Real-time support, not 'charges a fee for help'",
    ],
    weaknessKeywords: [
      "no in-app payment",
      "buggy updates",
      "support fee",
      "missing features",
      "irrigation-only legacy",
    ],
    migrationDays: 7,
    exactPricing: { starter: 50, mid: null, top: null, perUser: true },
    churnQuote:
      "Cannot take payment directly from the mobile app — only way is to go back to the web browser and sync to QuickBooks. Customer service is horrible — charges a fee for help.",
    roadmapGap:
      "Heritage Landscape Supply integration is announced not shipped; no AI, no modern PWA, support is metered ('charges a fee for help').",
    objectionBattlecard: [
      {
        objection: "HindSite is built for irrigation. We're an irrigation shop.",
        response:
          "Site Memory was built irrigation-first — sprinkler zones, valve maps, controller history, pressure log per property. Plus we ship Safety Shield with backflow-prevention compliance and Weather Pivot for freeze events. You get the irrigation depth without the 1-in-10 support competence and without paying $20/user/mo.",
      },
      {
        objection:
          "We have a great deal at $50/mo + $20/user — switching to $397/crew costs more.",
        response:
          "$50 + $20×7 users = $190/mo for what reviewers call 'missing key features.' Our $397/crew = unlimited users on that crew + 33 revenue engines. At 7 users you've effectively halved your per-feature cost while gaining tap-to-pay, offline PWA, and Quote Intercept. The cheaper bill becomes the more expensive operation.",
      },
      {
        objection:
          "HindSite's Heritage integration will let us order materials inline.",
        response:
          "That roadmap is announced, not shipped. We integrate with Heritage already through our open-API material catalog — and we add weather-aware purchase planning so you don't buy fertilizer the week before a freeze. Their roadmap is 2026; ours is November 2025.",
      },
    ],
  },
  {
    slug: "clipitc",
    name: "CLIPitc / CLIP",
    tier: 1,
    killHeadline: "CLIP forced you into their cloud. We give you a real one.",
    whySwitch: [
      "Cloud-native from day one — no surprise migrations, no $530 penalties",
      "Modern PWA your 20-year-veteran office manager will actually use",
      "33 engines vs. legacy 'rounds' workflow",
    ],
    weaknessKeywords: [
      "forced cloud migration",
      "cancelled features",
      "penalty charges",
      "buggy updates",
      "office staff refuses",
    ],
    migrationDays: 10,
    exactPricing: { starter: 40, mid: null, top: null, perUser: false },
    churnQuote:
      "Penalty-charged $530 per month for the software during the data conversion process. Software seems to have been thrown into production without much testing.",
    roadmapGap:
      "No public 2025 product announcements found — no changelog, no release notes, no LinkedIn ship announcements in last 6 months. Engineering signal is silence.",
    objectionBattlecard: [
      {
        objection:
          "We've been on CLIP for 20 years — our office manager finally got used to it after migration.",
        response:
          "Twenty years of muscle memory is real — and that's why our migration imports your CLIP CSV and preserves the 'rounds' workflow as a saved view in our scheduler. Your office manager keeps the rhythm she trained for, but on a stack that ships features in 2026 instead of one that didn't ship anything in the last 6 months.",
      },
      {
        objection:
          "We just survived the cloud migration. No appetite for another switch.",
        response:
          "That's exactly why we built a 14-day parallel run. You don't 'switch' on day 1 — you import on day 1, parallel from day 2, and only cut over when your office manager personally signs off. We absorbed the migration pain so you don't have to repeat the $530-penalty experience.",
      },
      {
        objection: "CLIPitc is cheap — $40/mo entry.",
        response:
          "$40 entry in a tool with no AI, no offline mode, and a public review history of 'thrown into production without testing' is the most expensive tool you can buy — measured in lost office-manager hours and ghosted quotes. $397/crew with 33 revenue engines pays for itself the first week Quote Intercept fires.",
      },
    ],
  },

  // ─── Tier 2: Adjacent verticals ───
  {
    slug: "servicetitan",
    name: "ServiceTitan",
    tier: 2,
    killHeadline:
      "ServiceTitan charges $46,170 to leave. We charge $0 to start.",
    whySwitch: [
      "No early termination fees, no $5K–$50K implementation",
      "Built for landscape — not HVAC bolted onto green",
      "Onboard in 14 days, not 6–12 months",
    ],
    weaknessKeywords: [
      "$46K early termination",
      "6–12 month onboarding",
      "$245–$398/tech",
      "data export needs lawyers",
      "not optimized for <3 techs",
    ],
    migrationDays: 30,
    exactPricing: { starter: 245, mid: 320, top: 398, perUser: true },
    churnQuote:
      "ServiceTitan is not optimized for companies with 3 or fewer technicians — straight from their own marketing.",
    roadmapGap:
      "HVAC-first DNA — landscape rhythms (NOAA, applicator compliance, equipment-aware routing) absent.",
    objectionBattlecard: [
      {
        objection:
          "ServiceTitan is the gold standard for field service — we'd rather use it than a niche player.",
        response:
          "ServiceTitan publicly says they're not optimized for companies with 3 or fewer technicians. That's their CEO talking, not us. They're an HVAC platform with a landscape paint job. We were built landscape-native — Safety Shield knows pesticide drift, Weather Pivot knows NOAA. The gold standard for landscape isn't a borrowed HVAC platform.",
      },
      {
        objection: "ServiceTitan owns Aspire — they have landscape DNA now.",
        response:
          "Owning Aspire means owning two roadmaps — and Aspire's separation fee terms are now ServiceTitan terms. The acquired DNA is what got us the 102% YoY price hike screenshots on LawnSite. We were built without acquisitions in our codebase. One product, one price, one yes.",
      },
      {
        objection: "We need enterprise-scale — ServiceTitan handles that.",
        response:
          "Enterprise scale at $46,170 ETF is enterprise prison. Our Enterprise tier supports 100+ crews on per-crew pricing with a direct founder line. We've stress-tested the architecture on Gladius CRM with multi-rooftop dealerships — same primitives. You get scale without the early termination contract.",
      },
    ],
  },
  {
    slug: "fieldroutes",
    name: "FieldRoutes",
    tier: 2,
    killHeadline: "FieldRoutes does pest. GladiusTurf does turf + pest in one.",
    whySwitch: [
      "Safety Shield handles pest + lawn applicator licenses + drift logs natively",
      "One platform for crossover shops (lawn + pest)",
      "Stripe Connect, no quote-required pricing games",
    ],
    weaknessKeywords: [
      "single-vertical lock",
      "multi-service confusion",
      "weak support",
      "ServiceTitan-owned",
      "quote-only pricing",
    ],
    migrationDays: 14,
    exactPricing: { starter: 125, mid: 300, top: 500, perUser: true },
    churnQuote:
      "Doesn't handle multiple pest service types on multiple service schedules well. Rare answers from support.",
    roadmapGap:
      "ServiceTitan-owned (2022 acquisition) — same roadmap-chaos signal as Aspire; no integrated turf+pest module.",
    objectionBattlecard: [
      {
        objection:
          "FieldRoutes is the pest specialist — we run pest and lawn on separate systems.",
        response:
          "Two systems means two source-of-truth lists for the same customer. When the same property gets a fert app on Tuesday and a mosquito spray on Saturday, who owns the schedule? Safety Shield treats both applicator licenses as one compliance object per property — turf + pest, one system, no double-entry.",
      },
      {
        objection: "ServiceTitan owns FieldRoutes — they're investing in pest.",
        response:
          "ServiceTitan also owns Aspire and the core HVAC product. They invest in three roadmaps simultaneously. You're a tier-3 priority for them. We're built specifically for the shops who do both lawn AND pest — that's our top-priority ICP, not a side bet.",
      },
      {
        objection: "We need pest-specific compliance (state license, drift).",
        response:
          "Safety Shield ships pesticide license tracking, drift log per application, weather-hold rules per state, and OSHA heat compliance — all in one engine. State-by-state rules are configurable. You get pest depth without the FieldRoutes 'rare answer from support' problem.",
      },
    ],
  },
  {
    slug: "workwave",
    name: "Workwave (PestPac)",
    tier: 2,
    killHeadline: "Workwave got rolled up. We answer the phone.",
    whySwitch: [
      "Founder-led — direct line to the founder on Enterprise",
      "No 18-month linked-document bugs, no card-on-file lock-in",
      "Modern stack — no PE-driven price hikes baked into roadmap",
    ],
    weaknessKeywords: [
      "PE rollup decay",
      "BBB complaints",
      "every module costs extra",
      "year contract lock-in",
      "linked-document bugs",
    ],
    migrationDays: 14,
    exactPricing: { starter: 250, mid: 600, top: null, perUser: false },
    churnQuote:
      "PestPac Lite would be terminated and replaced at $600 instead of $250. Locked into year contract with card on file.",
    roadmapGap:
      "Multi-product PE rollup (PestPac + RealGreen + others) means 18-month-plus bug fix windows; no founder-led product velocity.",
    objectionBattlecard: [
      {
        objection: "Workwave is the safe enterprise choice for pest + lawn.",
        response:
          "Safe is the wrong frame. Their BBB filings include 240% replacement-tier hikes ($250 to $600) and 55-day estimate bugs. 'Safe' here means 'expensive surprise.' We're founder-led — the founder picks up the phone on the Enterprise tier. That's the actual safe call.",
      },
      {
        objection: "We're already locked into a Workwave annual.",
        response:
          "Same play as RealGreen escapees: file non-renewal 60 days before term, parallel-run us in months 2–3, cutover at renewal. The lock works in your favor when you treat the renewal date as the real cancel date.",
      },
      {
        objection: "Workwave's product breadth (PestPac + RealGreen) is huge.",
        response:
          "Breadth at the cost of depth. Their linked-document bug went unfixed for 18+ months — that's the rollup tax. We ship one product, weekly releases, no module-by-module upcharge. All 33 engines included.",
      },
    ],
  },
  {
    slug: "housecall-pro",
    name: "Housecall Pro",
    tier: 2,
    killHeadline:
      "Housecall Pro nickel-and-dimes you. We give you all 33 engines.",
    whySwitch: [
      "All 33 engines included — no add-on creep, no surprise upgrades",
      "Landscape-native rhythms (NOAA, applicator, seasonal) Housecall doesn't get",
      "Per-crew pricing — Housecall MAX is $299 + $35/user before add-ons",
    ],
    weaknessKeywords: [
      "add-on cost creep",
      "feature gating",
      "3.2/5 Trustpilot",
      "generic home services",
      "mobile bugs",
    ],
    migrationDays: 7,
    exactPricing: { starter: 59, mid: 149, top: 299, perUser: true },
    churnQuote:
      "Cost creep from paid add-ons is the #1 reason businesses stop using Housecall Pro.",
    roadmapGap:
      "Generalist (HVAC/plumbing/cleaning/landscape) — landscape-native depth is structurally absent.",
    objectionBattlecard: [
      {
        objection: "Housecall Pro is the easiest onboarding in the category.",
        response:
          "Easiest onboarding doesn't mean easiest to grow on. Every feature you'll need next year is a paid add-on. Capterra's #1 churn driver for them is 'cost creep.' Our 33 engines are included from day one — no surprise upgrade conversation in month 6.",
      },
      {
        objection: "We're cross-vertical — HVAC + landscape + cleaning.",
        response:
          "If you're truly cross-vertical, you need depth on each — not generalist shallow. We integrate via API for HVAC dispatch, but landscape is our DNA: Weather Pivot, Safety Shield, equipment-aware routing. Housecall is breadth-first, depth-never.",
      },
      {
        objection: "We've been on Housecall Pro and the team likes it.",
        response:
          "Likeable UX is real. Migration is 7 days, and we preserve the workflow muscle memory. The team will like the offline PWA more on day 2, the per-crew bill more on day 30, and Quote Intercept more on day 45.",
      },
    ],
  },

  // ─── Tier 3: Point solutions ───
  {
    slug: "method-crm",
    name: "Method:CRM",
    tier: 3,
    killHeadline: "Method:CRM stores customers. GladiusTurf compounds them.",
    whySwitch: [
      "33 revenue engines vs. a QuickBooks-bolted CRM",
      "Landscape-native (weather, chemical, seasonal) — Method is generic",
      "$397/crew vs. $28/user that scales painfully",
    ],
    weaknessKeywords: [
      "QuickBooks-only",
      "steep learning curve",
      "weak support",
      "no landscape rhythm",
      "no AI",
    ],
    migrationDays: 7,
    exactPricing: { starter: 28, mid: 49, top: 74, perUser: true },
    churnQuote:
      "Method is built for QuickBooks contractors, not landscape ops — no weather, no chemical, no seasonal cadence.",
    roadmapGap:
      "QuickBooks-bolted architecture is the moat and the prison; no landscape-native primitives ever planned.",
    objectionBattlecard: [
      {
        objection:
          "We run QuickBooks heavy — Method bolts onto it perfectly.",
        response:
          "We sync to QuickBooks too — and we don't drop ~2% of line items the way Jobber does. The Method moat (QBO integration) is our floor. Above it: 33 landscape-native engines Method doesn't ship.",
      },
      {
        objection: "Method is $28/user — much cheaper than $397/crew.",
        response:
          "$28/user for a CRM that stores. $397/crew for 33 engines that compound. At 5 users on Method ($140) you've passed half our crew price for none of the revenue intelligence. The math flips in week one.",
      },
      {
        objection: "Method is general-purpose — we run multiple business lines.",
        response:
          "General-purpose means non-specialized everywhere. If landscape is your core line, you need landscape-native depth — Weather Pivot, Safety Shield, Site Memory. The other lines we integrate via QuickBooks the same way Method does. Best of both.",
      },
    ],
  },
  {
    slug: "quickbooks",
    name: "QuickBooks + Spreadsheets",
    tier: 3,
    killHeadline: "Stop running your $1.2M shop on a spreadsheet.",
    whySwitch: [
      "Ghost Recovery alone (+51% on dead leads) pays for the platform in week 1",
      "Site Memory replaces every sticky-note, group-text, and post-it",
      "33 engines, $397/crew — costs less than the time you waste reconciling",
    ],
    weaknessKeywords: [
      "manual reconciliation",
      "no automation",
      "no AI",
      "lost quotes",
      "no revenue compounding",
    ],
    migrationDays: 7,
    exactPricing: { starter: 35, mid: 105, top: 235, perUser: false },
    churnQuote:
      "We're running a $1.2M business on a spreadsheet and group texts — every quote we lose, we never know we lost.",
    roadmapGap:
      "QuickBooks itself is not a roadmap competitor — the gap is the absence of revenue intelligence entirely.",
    objectionBattlecard: [
      {
        objection: "We're profitable on QuickBooks + spreadsheets. Why change?",
        response:
          "You're profitable in spite of, not because of. The leakage is invisible — Quote Intercept will show you the $14K/mo you're losing in your first weekend. The spreadsheet is the $14K/mo invoice. We're cheaper than the leakage.",
      },
      {
        objection: "I don't trust software with our data.",
        response:
          "Your data lives in your sales reps' heads, your group texts, and a spreadsheet your office manager owns. That's the highest-risk data architecture in the industry. We're SOC2-ready, encrypted at rest, and you export CSV any time. Trust is improved by structure, not avoided.",
      },
      {
        objection: "Switching is too much work right now.",
        response:
          "7-day migration. We do the heavy lifting: import customers, jobs, invoices from QBO. Your team logs in on day 7. The 'work' is letting Quote Intercept run for a weekend and watching it find the first $14K. You'll wish you switched a year ago.",
      },
    ],
  },
];
