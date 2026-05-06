import { ComingSoonCard } from "../../ComingSoonCard";

export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  return (
    <ComingSoonCard
      title="Campaigns"
      badge="Coming with your first campaign"
      description="Outbound SMS, email, and postcard campaigns built on top of your customer book. The Maintenance Plans engine launches your first one — every campaign after that lives here."
      bullets={[
        "Bilingual EN + ES templates with your branding",
        "Audience segments by install year, last service, geographic cluster",
        "Replies route back to your inbox · no third-party app",
      ]}
    />
  );
}
