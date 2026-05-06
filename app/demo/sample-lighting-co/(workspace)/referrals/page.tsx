import { ComingSoonCard } from "../../ComingSoonCard";

export const dynamic = "force-dynamic";

export default function ReferralsPage() {
  return (
    <ComingSoonCard
      title="Referrals"
      badge="Coming Q3 2026"
      description="Track which customers refer the most installs. Auto-thank them, auto-credit them, and watch your acquisition cost trend toward zero."
      bullets={[
        "Referral attribution — who sent who, all the way back to the first review",
        "Customer-of-the-quarter rewards · automatic outreach",
        "Neighbor-postcard campaigns from any won install",
      ]}
    />
  );
}
