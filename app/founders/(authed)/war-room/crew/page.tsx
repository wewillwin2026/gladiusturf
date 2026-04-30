import { notFound } from "next/navigation";
import { specFor } from "@/lib/demo/engine-specs";
import { EngineFromSpec } from "@/components/app/EngineFromSpec";

export const dynamic = "force-dynamic";

export default function Page() {
  const spec = specFor("crew");
  if (!spec) notFound();
  return <EngineFromSpec product="founders" spec={spec} />;
}
