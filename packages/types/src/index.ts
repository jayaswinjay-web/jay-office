export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  emailVerified: boolean
  twoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Workspace {
  id: string
  name: string
  slug: string
  plan: BillingPlan
  storageUsed: number
  storageLimit: number
  createdAt: Date
  updatedAt: Date
}

export type BillingPlan = "free" | "pro" | "business" | "enterprise"

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: MemberRole
  createdAt: Date
}

export type MemberRole = "owner" | "admin" | "editor" | "commenter" | "viewer"

export interface File {
  id: string
  name: string
  mimeType: string
  size: number
  workspaceId: string
  ownerId: string
  folderId: string | null
  starred: boolean
  trashed: boolean
  trashedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Folder {
  id: string
  name: string
  workspaceId: string
  ownerId: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  title: string
  workspaceId: string
  ownerId: string
  fileId: string
  content: string | null
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface Sheet {
  id: string
  title: string
  workspaceId: string
  ownerId: string
  fileId: string
  content: string | null
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface Slide {
  id: string
  title: string
  workspaceId: string
  ownerId: string
  fileId: string
  content: string | null
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface Permission {
  id: string
  resourceId: string
  resourceType: ResourceType
  userId: string
  role: PermissionRole
  expiresAt: Date | null
  createdAt: Date
}

export type ResourceType = "file" | "folder" | "document" | "sheet" | "slide" | "note" | "task"
export type PermissionRole = "owner" | "editor" | "commenter" | "viewer"

export interface ShareLink {
  id: string
  resourceId: string
  resourceType: ResourceType
  role: PermissionRole
  expiresAt: Date | null
  password: string | null
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  resourceId: string | null
  resourceType: ResourceType | null
  read: boolean
  createdAt: Date
}

export type NotificationType = "mention" | "comment" | "share" | "invite" | "update" | "system"

export interface AuditLog {
  id: string
  workspaceId: string
  userId: string
  action: string
  resourceType: ResourceType | null
  resourceId: string | null
  metadata: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export interface Session {
  id: string
  userId: string
  refreshToken: string
  deviceInfo: string | null
  ipAddress: string | null
  expiresAt: Date
  createdAt: Date
}

export interface EmailAccount {
  id: string
  userId: string
  email: string
  displayName: string
  imapHost: string
  imapPort: number
  imapSecure: boolean
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string | null
  workspaceId: string
  projectId: string
  assigneeId: string | null
  creatorId: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "cancelled"
export type TaskPriority = "p1" | "p2" | "p3" | "p4"

export interface Note {
  id: string
  title: string
  workspaceId: string
  ownerId: string
  parentId: string | null
  content: string | null
  published: boolean
  publishedSlug: string | null
  createdAt: Date
  updatedAt: Date
}

export function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value && "email" in value && "name" in value
}

export function isWorkspace(value: unknown): value is Workspace {
  return typeof value === "object" && value !== null && "id" in value && "slug" in value && "plan" in value
}

export function isFile(value: unknown): value is File {
  return typeof value === "object" && value !== null && "id" in value && "mimeType" in value && "size" in value
}
