import { rng } from "@/lib/shared/prng";
import type { Customer, Message, MessageChannel } from "@/lib/shared/types";

const SAMPLES = {
  in: [
    "Hey, can the crew swing by today instead of Friday? Hosting Sunday brunch.",
    "Thanks for the great mow yesterday — yard looks unreal.",
    "Quick question: do y'all also do mulch refresh? My beds are looking rough.",
    "Sprinklers seem to be misting weird in the back zone. Can someone take a look?",
    "Got the invoice — paid online just now.",
    "Are we still on for next Tuesday at 10am?",
    "Need to skip this Thursday's visit — my dog is at the groomer all morning.",
    "Friend across the street wants a quote — can you swing by their place too?",
    "The new edges look amazing. Send my thanks to the crew.",
    "Got a flat tire near 2231 Lakeshore — you guys leave anything in the road?",
  ],
  out: [
    "Of course — we can move the visit to today, 1pm window. Sound good?",
    "Glad to hear it! Ari led that one — I'll pass it along.",
    "Yes, mulch refresh is $1.20/sqft installed. Want a quote?",
    "Got it — Devon will swing by Wednesday afternoon to inspect.",
    "Thanks for prompt payment 🙏",
    "Confirmed — Tuesday 10am with the Bayshore crew.",
    "No problem, we'll catch you the following Thursday.",
    "Absolutely — can you share their address?",
    "Appreciate it — I'll send the team your kind words.",
    "Just checked with the crew — no flats happened on our trucks today.",
  ],
};

const CHANNELS: MessageChannel[] = ["sms", "sms", "email", "voice", "portal"];

export function buildMessages(customers: Customer[], count = 400): Message[] {
  const r = rng(2029);
  const list: Message[] = [];
  const active = customers.filter((c) => c.status !== "Cancelled");

  for (let i = 0; i < count; i++) {
    const c = r.pick(active);
    const channel = r.pick(CHANNELS);
    const direction = r.bool(0.55) ? "in" : "out";
    const body = r.pick(SAMPLES[direction]);
    const ts = isoMinutesAgo(r.int(0, 14 * 24 * 60));
    list.push({
      id: `msg_${i + 1}`,
      customerId: c.id,
      channel,
      direction,
      body,
      ts,
      read: r.bool(0.6),
    });
  }

  list.sort((a, b) => b.ts.localeCompare(a.ts));
  return list;
}

function isoMinutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}
