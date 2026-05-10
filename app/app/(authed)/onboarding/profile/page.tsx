import { redirect } from "next/navigation";
import { readAppSession } from "@/lib/app/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile Setup · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function OnboardingProfilePage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }
  redirect("/app");
}
