import { TIERS, EMAIL_EN, EMAIL_ES, BRAND } from "@/lib/demo-data/bright-lights";
import { MaintenancePlansClient } from "./MaintenancePlansClient";

export const dynamic = "force-dynamic";

export default function MaintenancePlansPage() {
  return (
    <MaintenancePlansClient
      tiers={TIERS}
      emails={{ en: EMAIL_EN, es: EMAIL_ES }}
      totalCustomers={BRAND.estimatedCustomers}
    />
  );
}
