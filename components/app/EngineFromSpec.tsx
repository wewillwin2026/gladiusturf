import * as React from "react";
import { EngineStub } from "./EngineStub";
import { type ProductKind } from "./engines";
import type { EngineSpec } from "@/lib/demo/engine-specs";
import type { Column } from "./ui/DataTable";

export function EngineFromSpec({
  product,
  spec,
}: {
  product: ProductKind;
  spec: EngineSpec;
}) {
  return (
    <EngineStub
      product={product}
      title={spec.title}
      subtitle={spec.subtitle}
      kpis={spec.kpis}
      rows={spec.rows}
      columns={spec.columns as Column<unknown>[]}
      rowHref={spec.rowHref ?? undefined}
    />
  );
}
