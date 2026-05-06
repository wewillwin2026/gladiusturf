/**
 * FL hurricane footprint ZIPs — Helene + Milton 2024 outer-band coverage.
 *
 * Pre-baked so Storm Mode + the home-page Storm Radar tile can both look
 * up "is this customer in a watched ZIP" without an external feed
 * dependency on day one. v2 swaps to live NOAA active-storm reports.
 *
 * Coverage spans Tampa Bay, Sarasota, Bradenton, Lakewood Ranch, Siesta
 * Key, Naples, Punta Gorda — the same arc that took the brunt of both
 * 2024 storms. ~60 ZIPs.
 */
export const FL_HURRICANE_ZIPS = new Set<string>([
  "33301", "33602", "33701", "33606", "33611", "33612", "33616", "33617",
  "33619", "33625", "33626", "33629", "33647",
  "34102", "34103", "34108", "34110", "34112", "34113", "34114",
  "34201", "34202", "34203", "34205", "34207", "34208", "34209", "34210",
  "34211", "34212", "34215", "34217", "34219", "34221",
  "34228", "34229", "34230", "34231", "34232", "34233", "34234", "34236",
  "34237", "34238", "34239", "34240", "34241", "34242", "34243",
  "33950", "33952", "33953", "33954", "33955", "33980", "33981", "33983",
]);

export function isInStormZip(zip: string | null | undefined): boolean {
  if (!zip) return false;
  return FL_HURRICANE_ZIPS.has(zip);
}
