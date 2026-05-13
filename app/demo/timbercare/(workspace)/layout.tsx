import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, TC_COOKIE_NAME } from "@/lib/timbercare/auth";
import { WorkspaceShell } from "../WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(TC_COOKIE_NAME)?.value;
  if (!verifyToken(token)) {
    redirect("/demo/timbercare");
  }
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
