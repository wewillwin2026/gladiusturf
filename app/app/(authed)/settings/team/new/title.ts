/**
 * Title-from-notes parser, factored out of the "use server" actions.ts
 * so it can be imported by client components (TeamCard) too. A
 * "use server" file may only export async server actions.
 *
 * tenant_invitations.notes currently stores per-user title as
 * `{"title":"..."}` JSON (sidesteps a schema migration). Plain-text
 * legacy notes are left alone — this helper returns null for them.
 */
export function parseInvitationTitle(notes: string | null): string | null {
  if (!notes) return null;
  const trimmed = notes.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const obj = JSON.parse(trimmed) as { title?: unknown };
    if (typeof obj.title === "string" && obj.title.trim()) {
      return obj.title.trim();
    }
  } catch {
    return null;
  }
  return null;
}
