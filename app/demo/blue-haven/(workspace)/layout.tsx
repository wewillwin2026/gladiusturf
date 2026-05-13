import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, BH_COOKIE_NAME } from "@/lib/blue-haven/auth";
import { WorkspaceShell } from "../WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(BH_COOKIE_NAME)?.value;
  if (!verifyToken(token)) {
    redirect("/demo/blue-haven");
  }
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
