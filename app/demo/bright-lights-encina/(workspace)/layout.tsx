import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, BL_COOKIE_NAME } from "@/lib/bright-lights/auth";
import { WorkspaceShell } from "../WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(BL_COOKIE_NAME)?.value;
  if (!verifyToken(token)) {
    redirect("/demo/bright-lights-encina");
  }
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
