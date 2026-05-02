import { CUSTOMERS, BRAND } from "@/lib/demo-data/bright-lights";
import { CustomersBrowser } from "./CustomersBrowser";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  return (
    <CustomersBrowser
      seed={CUSTOMERS}
      totalCustomers={BRAND.estimatedCustomers}
    />
  );
}
