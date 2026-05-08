import { SignContract } from "./SignContract";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Service Agreement Signing — Bright Lights × Gladius",
  robots: { index: false, follow: false },
};

export default function BrightLightsContractPage() {
  return <SignContract />;
}
