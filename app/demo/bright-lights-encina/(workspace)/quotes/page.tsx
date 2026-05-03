import { SAMPLE_QUOTES, ALL_CATALOG } from "@/lib/demo-data/bright-lights";
import { QuotesClient } from "./QuotesClient";

export const dynamic = "force-dynamic";

export default function QuotesPage() {
  return <QuotesClient quotes={SAMPLE_QUOTES} catalog={ALL_CATALOG} />;
}
