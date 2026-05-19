import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { readAppSession } from "@/lib/app/session";
import { AddUserForm } from "./_components/AddUserForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add user · GladiusTurf",
  robots: { index: false, follow: false },
};

export default async function NewTeamMemberPage() {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    redirect("/app/login");
  }
  // Settings is owner-only per the access matrix; the (authed) layout
  // already enforces this server-side, but double-check here so a
  // non-owner can't reach the form even via a stale route cache.
  if (session.role !== "owner") {
    redirect("/app/settings");
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/settings"
        prefetch
        className="inline-flex items-center gap-1.5 text-[12px] text-g-text-muted hover:text-g-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to settings
      </Link>

      <PageHeader
        eyebrow={`${session.tenant.display_name} · New user`}
        title="Add a user"
        subtitle="Set their email and password, give them a title, and choose what they can see. They sign in immediately — share the password with them directly."
      />

      <AddUserForm />
    </div>
  );
}
