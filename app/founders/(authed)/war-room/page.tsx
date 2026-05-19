import { redirect } from "next/navigation";

/**
 * Founders Portal landing.
 *
 * The War Room is founders-only tooling. The old root rendered an
 * operator-style "Today" dashboard (demo-bookings KPIs, seeded crews,
 * client-engine links) which made the portal look like the client CRM —
 * not the agreed design. The Live Radar ("who's on gladiusturf.com
 * right now") is the headline founders surface, so the portal lands
 * there. The old demo-bookings pipeline is still available via the
 * Demo Pipeline tab. Auth is already enforced by the (authed) layout.
 */
export default function WarRoomLanding() {
  redirect("/founders/war-room/secret/radar");
}
