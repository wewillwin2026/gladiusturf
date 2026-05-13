import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, MG_COOKIE_NAME } from "@/lib/meridian-grounds/auth";
import { WorkspaceShell } from "../WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(MG_COOKIE_NAME)?.value;
  if (!verifyToken(token)) {
    redirect("/demo/meridian-grounds");
  }
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
