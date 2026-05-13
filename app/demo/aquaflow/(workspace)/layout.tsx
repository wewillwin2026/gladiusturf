import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, AF_COOKIE_NAME } from "@/lib/aquaflow/auth";
import { WorkspaceShell } from "../WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(AF_COOKIE_NAME)?.value;
  if (!verifyToken(token)) {
    redirect("/demo/aquaflow");
  }
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
