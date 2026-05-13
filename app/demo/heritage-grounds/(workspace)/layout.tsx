import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, HG_COOKIE_NAME } from "@/lib/heritage-grounds/auth";
import { WorkspaceShell } from "../WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(HG_COOKIE_NAME)?.value;
  if (!verifyToken(token)) {
    redirect("/demo/heritage-grounds");
  }
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
