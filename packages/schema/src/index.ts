import { pgTable, text, timestamp, varchar, boolean, integer, bigint, uuid, jsonb, type AnyPgColumn } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

/* ── Users ─────────────────────────────────────────────── */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationExpires: timestamp("email_verification_expires"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  recoveryCodes: jsonb("recovery_codes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Sessions ──────────────────────────────────────────── */

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  refreshToken: varchar("refresh_token", { length: 512 }).notNull().unique(),
  deviceInfo: varchar("device_info", { length: 512 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

/* ── Workspaces ────────────────────────────────────────── */

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  plan: varchar("plan", { length: 32 }).notNull().default("free"),
  storageUsed: bigint("storage_used", { mode: "number" }).notNull().default(0),
  storageLimit: bigint("storage_limit", { mode: "number" }).notNull().default(5_368_709_120),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Workspace Members ─────────────────────────────────── */

export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 32 }).notNull().default("viewer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
}))

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}))

/* ── Folders ───────────────────────────────────────────── */

export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 512 }).notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): AnyPgColumn => folders.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Files ─────────────────────────────────────────────── */

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 512 }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  key: varchar("key", { length: 1024 }).notNull().unique(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  folderId: uuid("folder_id").references(() => folders.id, { onDelete: "set null" }),
  starred: boolean("starred").notNull().default(false),
  trashed: boolean("trashed").notNull().default(false),
  trashedAt: timestamp("trashed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Documents ─────────────────────────────────────────── */

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull().default("Untitled Document"),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileId: uuid("file_id").references(() => files.id, { onDelete: "set null" }),
  content: text("content"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Sheets ────────────────────────────────────────────── */

export const sheets = pgTable("sheets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull().default("Untitled Sheet"),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileId: uuid("file_id").references(() => files.id, { onDelete: "set null" }),
  content: text("content"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Slides ────────────────────────────────────────────── */

export const slides = pgTable("slides", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull().default("Untitled Presentation"),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileId: uuid("file_id").references(() => files.id, { onDelete: "set null" }),
  content: text("content"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Notes ─────────────────────────────────────────────── */

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull().default("Untitled Note"),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): AnyPgColumn => notes.id, { onDelete: "set null" }),
  content: text("content"),
  published: boolean("published").notNull().default(false),
  publishedSlug: varchar("published_slug", { length: 255 }).unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Permissions ───────────────────────────────────────── */

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  resourceId: uuid("resource_id").notNull(),
  resourceType: varchar("resource_type", { length: 32 }).notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 32 }).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

/* ── Share Links ───────────────────────────────────────── */

export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  resourceId: uuid("resource_id").notNull(),
  resourceType: varchar("resource_type", { length: 32 }).notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  expiresAt: timestamp("expires_at"),
  password: varchar("password", { length: 255 }),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

/* ── Notifications ─────────────────────────────────────── */

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 32 }).notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  body: text("body").notNull(),
  resourceId: uuid("resource_id"),
  resourceType: varchar("resource_type", { length: 32 }),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

/* ── Audit Logs ────────────────────────────────────────── */

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 128 }).notNull(),
  resourceType: varchar("resource_type", { length: 32 }),
  resourceId: uuid("resource_id"),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 512 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

/* ── Email Accounts ────────────────────────────────────── */

export const emailAccounts = pgTable("email_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  imapHost: varchar("imap_host", { length: 255 }).notNull(),
  imapPort: integer("imap_port").notNull(),
  imapSecure: boolean("imap_secure").notNull().default(true),
  imapPassword: varchar("imap_password", { length: 512 }).notNull(),
  smtpHost: varchar("smtp_host", { length: 255 }).notNull(),
  smtpPort: integer("smtp_port").notNull(),
  smtpSecure: boolean("smtp_secure").notNull().default(true),
  smtpPassword: varchar("smtp_password", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Tasks ─────────────────────────────────────────────── */

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id"),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  creatorId: uuid("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 32 }).notNull().default("todo"),
  priority: varchar("priority", { length: 8 }).notNull().default("p3"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Calendar Events ──────────────────────────────────── */

export const calEvents = pgTable("cal_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location", { length: 512 }),
  color: varchar("color", { length: 16 }).notNull().default("#3b82f6"),
  isAllDay: boolean("is_all_day").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

/* ── Chat Channels ─────────────────────────────────────── */

export const chatChannels = pgTable("chat_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  description: text("description"),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  memberCount: integer("member_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

/* ── Chat Messages ─────────────────────────────────────── */

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: uuid("channel_id").notNull().references(() => chatChannels.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  body: text("body").notNull(),
  attachments: jsonb("attachments").notNull().default([]),
  reactions: jsonb("reactions").notNull().default([]),
  threadId: uuid("thread_id"),
  replyCount: integer("reply_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

/* ── Meetings ──────────────────────────────────────────── */

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull(),
  hostId: varchar("host_id", { length: 255 }).notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  recording: boolean("recording").notNull().default(false),
  participants: jsonb("participants").notNull().default([]),
})

/* ── Forms ─────────────────────────────────────────────── */

export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 16 }).notNull().default("draft"),
  questions: jsonb("questions").notNull().default([]),
  responseCount: integer("response_count").notNull().default(0),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

/* ── Form Responses ────────────────────────────────────── */

export const formResponses = pgTable("form_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull().default({}),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
})

/* ── Sign Requests ─────────────────────────────────────── */

export const signRequests = pgTable("sign_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull(),
  documentName: varchar("document_name", { length: 512 }).notNull().default("Untitled Document"),
  signerEmail: varchar("signer_email", { length: 320 }).notNull(),
  signerName: varchar("signer_name", { length: 255 }).notNull(),
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 16 }).notNull().default("pending"),
  fields: jsonb("fields").notNull().default([]),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  signedAt: timestamp("signed_at"),
  declineReason: text("decline_reason"),
})


