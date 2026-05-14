import { db } from '../../lib/db'
import { workspaceMembers, workspaces } from '@jay/schema'
import { eq } from 'drizzle-orm'

export async function resolveUserWorkspace(userId: string): Promise<string> {
  const [member] = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
    .limit(1)

  if (member) return member.workspaceId

  const [ws] = await db.select({ id: workspaces.id }).from(workspaces).limit(1)
  return ws!.id
}
