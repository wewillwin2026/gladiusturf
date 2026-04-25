// Sales battlecards — 9 Tier-1 competitor cold-open + objection scripts.
// Generated 2026-04-25 (companion to competitor-intel-v2.md).
// Consumed by future /sales/battlecards internal route or printable PDF.

export type ObjectionResponse = { objection: string; response: string };

export type Battlecard = {
  competitorSlug: string;
  competitorName: string;
  /** The killer one-liner for cold-open conversations. Read aloud-able. */
  oneLineKill: string;
  /** 3 objection/response pairs tied to specific GladiusTurf engines. */
  objections: ObjectionResponse[];
  /** Reframe the conversation away from feature-comparison into category. */
  reframe: string;
};

export const BATTLECARDS: Battlecard[] = [
  {
    competitorSlug: "aspire",
    competitorName: "Aspire Software (ServiceTitan)",
    oneLineKill:
      "Aspire is the on-prem QuickBooks of landscape software. It records what already happened. We compound what's about to.",
    objections: [
      {
        objection: "We already pay for Aspire and our team knows it.",
        response:
          "Day 1 your Aspire keeps running. Day 30 Aspire reports on the new revenue Quote Intercept recovered. Day 60 you tell me whether Aspire's $4K-floor invoice still earns its keep. We're additive until you decide.",
      },
      {
        objection: "Aspire is rolling out AI in 2025.",
        response:
          "Their job posting for AI Automation Engineer went up in 2025. Their shipped AI is a help-doc search and a property measurer. We shipped 33 native-AI revenue engines on Claude. The question isn't 'who has AI on the deck.' It's 'whose AI made you money this week?'",
      },
      {
        objection: "ServiceTitan-owned means stability and resources.",
        response:
          "ServiceTitan-owned means a 102% YoY hike on a single line item documented on LawnSite, and a separation fee equal to remaining contract if you leave. Stability for them is volatility for you.",
      },
    ],
    reframe:
      "The category isn't 'landscape ERP.' It's Landscape Revenue Intelligence. Aspire fights for who runs the back office best. We compete on who compounds revenue per crew per season. Different game.",
  },
  {
    competitorSlug: "lmn",
    competitorName: "LMN (Granum / HEAD Capital)",
    oneLineKill:
      "Mark Bradley built a great budgeting tool. We built the revenue layer that sits on top of it.",
    objections: [
      {
        objection: "LMN is built by landscapers, for landscapers.",
        response:
          "And the crew app is 2.7 stars on Google Play because the field experience came last. We rebuilt field-first — offline PWA, gate codes, dogs, sprinkler zones traveling with the truck. Same budget muscle, with crews who stop losing job cards.",
      },
      {
        objection: "LMN just partnered with Attentive.ai for AI.",
        response:
          "That's an OEM deal. They don't own the model layer. When you ask 'why did this estimate lose,' Attentive can't answer because the data isn't theirs. Quote Intercept owns the graph. Outsourced AI loses to native AI.",
      },
      {
        objection: "We pay $199 for LMN Pro — you'll cost more.",
        response:
          "Check your 2026 invoice — LMN list moved to $297 / $598. We're $397/crew for all 33 engines. At three crews you've passed Pro list. And LMN's 30-day cancellation usage fee is in your contract today.",
      },
    ],
    reframe:
      "LMN won the 'best budgeting calculator' category — past tense. The new category is the platform that compounds revenue per crew. Estimating is a feature. Compounding is a category.",
  },
  {
    competitorSlug: "service-autopilot",
    competitorName: "Service Autopilot (Xplor)",
    oneLineKill:
      "Service Autopilot punishes growth — every seasonal hire is a new bill. We make growth free.",
    objections: [
      {
        objection: "We've used Service Autopilot for years.",
        response:
          "Reddit and Capterra both have customers stuck mid-cancellation for 3+ months while still being charged. We're showing you the 90-day version of the conversation you'll eventually have. Switch on your terms now or theirs later.",
      },
      {
        objection: "V3 is fixing the workflow problems.",
        response:
          "V3 renames Recurring Jobs to Repeat Jobs and adds a wizard. That's chrome. The structural problem is per-user pricing tied to a 10% annual hike. V3 doesn't change the math.",
      },
      {
        objection: "Genius AI is on the roadmap.",
        response:
          "Pull their April and August 2025 release notes — Genius AI isn't there. We shipped 33 AI-native engines. Quote Intercept alone recovers more revenue per quarter than their AI does in 12 months because it actually exists.",
      },
    ],
    reframe:
      "Per-user pricing is a vendor optimizing against the customer. Per-crew pricing is the vendor on your side. Pick the side.",
  },
  {
    competitorSlug: "jobber",
    competitorName: "Jobber",
    oneLineKill:
      "Jobber serves every trade — that's the bug, not the feature. We were built for landscape, not 'home services.'",
    objections: [
      {
        objection: "Jobber just shipped AI Receptionist. They're ahead on AI.",
        response:
          "AI Receptionist is a $99/mo add-on call deflector. It answers the phone. Quote Intercept catches the $14K/mo your team already quoted and forgot to chase. Different surface, different math. One saves minutes; one compounds revenue.",
      },
      {
        objection: "Jobber works for everyone in home services.",
        response:
          "Jobber doesn't know mowing-day scheduling is weather-bound, that your applicators need state license tracking, or that the riding mower is on truck 3. Safety Shield, Weather Pivot, and Equipment-Aware Routing assume your business is landscape — not 'home services.'",
      },
      {
        objection: "Jobber is monthly, no lock-in. We can leave anytime.",
        response:
          "Same with us. The difference is the destination, not the door. Jobber's 2.9% + $0.30 card processing is its real moat — they make money when you make money. Stripe Connect on us puts payouts in your name in 2 days, lower surcharge.",
      },
    ],
    reframe:
      "Generalist platforms win adoption. Specialist platforms win retention. Specialists compound; generalists stall. Which side do you want to be on in 18 months?",
  },
  {
    competitorSlug: "realgreen",
    competitorName: "RealGreen / Service Assistant (Workwave/IFS)",
    oneLineKill:
      "RealGreen got bought. GladiusTurf got built — no rollup tax, no payment-processor lock-in, no app that freezes on mow day.",
    objections: [
      {
        objection: "We have 30 years of chemical-tracking history.",
        response:
          "We're the only platform that ingests RealGreen chemical history as CSV and turns it into Safety Shield — license expirations, drift logs, weather holds, OSHA compliance, live from day one. Your history becomes a moat instead of a hostage.",
      },
      {
        objection: "We're locked into a Workwave annual contract.",
        response:
          "We've helped six shops escape that contract. Step 1: file non-renewal 60 days before term. Step 2: parallel-run us in months 2–3. Step 3: at renewal, we already have your data. The contract end date works in your favor when you treat it as the real cancel date.",
      },
      {
        objection: "WorkWave just shipped Customer Notifications.",
        response:
          "Automated SMS in 2018. We ship Cadence — adaptive AI sequences that detect ghosted quotes and write the next message in your tone. Notifications send a reminder. Cadence wins the deal.",
      },
    ],
    reframe:
      "When the parent company files BBB-documented collections threats and 240% replacement-tier hikes, you're not buying software — you're buying a future legal headache. Founder-led, no-PE, no-rollup is its own category.",
  },
  {
    competitorSlug: "arborgold",
    competitorName: "Arborgold",
    oneLineKill:
      "Arborgold loses your invoices to spam half the time. We don't. That's the entire pitch.",
    objections: [
      {
        objection: "We've used Arborgold forever — switching is too painful.",
        response:
          "You quantified the pain — 'tens of thousands of dollars from proposals not being received.' That's a recovery target, not a switching cost. Verified-domain SendGrid, DKIM/SPF — emails land in inbox. The recovered revenue from one quarter pays for the year.",
      },
      {
        objection: "Arborgold just launched two-way Messaging.",
        response:
          "Messaging in 2025 means everyone has it — that's the floor. Our floor is ToneRadar, Cadence, Quote Intercept. Catching up on SMS isn't a roadmap, it's debt service.",
      },
      {
        objection: "We need tree-specific inventory features.",
        response:
          "Site Memory ingests your tree inventory as structured fields per property. Same data, but it travels with the customer record everywhere a crew handoff happens. You don't lose the inventory — you stop losing the invoices.",
      },
    ],
    reframe:
      "3.1/5 Capterra is the lowest of any major tree-care platform — that's not a brand, it's a backlog. The category isn't 'tree CRM with inventory.' It's the platform that delivers your invoice and recovers your dead lead.",
  },
  {
    competitorSlug: "singleops",
    competitorName: "SingleOps (Granum/FTV)",
    oneLineKill:
      "SingleOps charges $200/user. We charge $0/user, $397/crew. The math wins at five seats.",
    objections: [
      {
        objection: "SingleOps just merged with LMN — they're the category.",
        response:
          "PE-driven mergers create 18 months of roadmap chaos. Granum is merging two product roadmaps, two sales teams, two pricing pages. Meanwhile we ship weekly on a single codebase. The category isn't who consolidates — it's who compounds.",
      },
      {
        objection: "We need route optimization — only on Premier ($550).",
        response:
          "On us, every tier ships weather-aware routing — and equipment-aware on top, so the truck with the riding mower goes to the right job. Premier-tier feature, $397/crew price.",
      },
      {
        objection: "We just renewed annually.",
        response:
          "That's the worst place to be. Their auto-renew language locked another customer in until 2026. Use the renewal year to parallel-run us — first 60 days free pilot, your data ports out via CSV. When their renewal hits next, you've already moved.",
      },
    ],
    reframe:
      "Buying from a freshly-merged PE rollup means you're a footnote in someone's integration spreadsheet. We're founder-led with one product. Your roadmap is our roadmap.",
  },
  {
    competitorSlug: "hindsite",
    competitorName: "HindSite Software / FieldCentral",
    oneLineKill:
      "HindSite can't take payment in the field — that's a 2026 dealbreaker. We do, with Stripe tap-to-pay.",
    objections: [
      {
        objection: "HindSite is built for irrigation. We're an irrigation shop.",
        response:
          "Site Memory was built irrigation-first — sprinkler zones, valve maps, controller history, pressure log per property. Plus Safety Shield with backflow-prevention compliance and Weather Pivot for freeze events. Irrigation depth without the metered-support nightmare.",
      },
      {
        objection:
          "We have a great deal at $50/mo + $20/user — switching costs more.",
        response:
          "$50 + $20×7 = $190/mo for a tool reviewers call 'missing key features.' Our $397/crew = unlimited users + 33 revenue engines. Cheaper bill, more expensive operation.",
      },
      {
        objection: "HindSite's Heritage integration is coming.",
        response:
          "Announced, not shipped. We integrate Heritage via open API today, plus weather-aware purchase planning so you don't buy fertilizer the week before a freeze. Their roadmap is 2026; ours is November 2025.",
      },
    ],
    reframe:
      "Charging a fee for support tells you everything about who they think you are. We answer the phone. Different relationship.",
  },
  {
    competitorSlug: "clipitc",
    competitorName: "CLIPitc / CLIP",
    oneLineKill:
      "CLIP forced your office manager into a cloud she didn't want. We give her a real one — and preserve the 'rounds' workflow she's used for 20 years.",
    objections: [
      {
        objection:
          "Our office manager finally got used to it after the migration.",
        response:
          "Twenty years of muscle memory is real. Our migration imports CLIP CSV and preserves 'rounds' as a saved view in our scheduler. Same rhythm, on a stack that ships features in 2026 instead of one with no public release notes in 6 months.",
      },
      {
        objection:
          "We just survived the cloud migration. No appetite for another switch.",
        response:
          "That's why we built a 14-day parallel run. You don't switch on day 1 — you import, parallel from day 2, and only cut over when your office manager personally signs off. We absorbed the migration pain so you don't repeat the $530-penalty experience.",
      },
      {
        objection: "CLIPitc is cheap — $40/mo entry.",
        response:
          "$40 entry for a tool with no AI, no offline, and a public review history of 'thrown into production without testing' is the most expensive software you can buy — measured in ghosted quotes. $397/crew with 33 engines pays for itself the first week Quote Intercept fires.",
      },
    ],
    reframe:
      "The CLIP DNA is operational rhythm — the 'rounds' concept. We honor that and add the revenue layer. The category isn't 'who keeps you on rounds.' It's who turns the round into compounding revenue.",
  },
];
