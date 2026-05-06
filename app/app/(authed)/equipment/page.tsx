import { Truck } from "lucide-react";
import { EquipmentBrowser } from "@/components/app/EquipmentBrowser";
import { TenantEmptyState } from "@/components/app/TenantEmptyState";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await readAppSession();
  if (session.kind === "tenant") {
    return (
      <TenantEmptyState
        engine="Equipment"
        tenant={session.tenant}
        icon={Truck}
        body="Trucks, mowers, and tools appear here with maintenance schedules, fuel logs, and depreciation. Add your first asset to start."
      />
    );
  }
  return <EquipmentBrowser product="demo" />;
}
