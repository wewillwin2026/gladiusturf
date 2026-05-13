import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, SL_COOKIE_NAME } from "@/lib/sterling-lawn/auth";
import { WorkspaceShell } from "../WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(SL_COOKIE_NAME)?.value;
  if (!verifyToken(token)) {
    redirect("/demo/sterling-lawn");
  }
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
