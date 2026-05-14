# JAY OFFICE -- 12-MONTH DETAILED ROADMAP

> **Work smarter. All in one place.**
>
> Master roadmap: 52 weekly sprints across 3 phases
> Last updated: 2026-05-04

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Phase 1: Foundation (Weeks 1-13)](#2-phase-1-foundation-weeks-1-13)
3. [Phase 2: Office Core (Weeks 14-30)](#3-phase-2-office-core-weeks-14-30)
4. [Phase 3: Communication & Scale (Weeks 31-52)](#4-phase-3-communication--scale-weeks-31-52)
5. [Gate Criteria](#5-gate-criteria)
6. [Parallel Workstream Tracking](#6-parallel-workstream-tracking)
7. [Critical Path Analysis](#7-critical-path-analysis)
8. [Quick Wins](#8-quick-wins)
9. [Technical Risk Register](#9-technical-risk-register)
10. [Milestone Table](#10-milestone-table)

---

## 1. EXECUTIVE SUMMARY

| Metric | Value |
|---|---|
| Total duration | 52 weeks (12 months) |
| Phase 1 (Foundation) | Weeks 1-13 (Months 1-3) |
| Phase 2 (Office Core) | Weeks 14-30 (Months 4-7) |
| Phase 3 (Comm & Scale) | Weeks 31-52 (Months 8-12) |
| Total sprints | 52 (1-week cadence) |
| Target team size | 12-18 engineers |

### Team Structure Assumptions

| Team | Headcount | Focus |
|---|---|---|
| Frontend | 5-6 | React SPA, design system, all client apps |
| Backend | 4-5 | Fastify API, DB schema, auth, billing |
| Real-time/Infrastructure | 2-3 | Yjs CRDT, Socket.io, Docker, CI/CD |
| QA/DevOps | 2 | E2E tests, load tests, monitoring, releases |

---

## 2. PHASE 1: FOUNDATION (Weeks 1-13)

**Theme:** Prove the stack. Ship the skeleton. Get real-time collaboration working.

### SUB-PHASE 1A: Scaffolding & Design System (Weeks 1-4)

#### SPRINT 1 -- Week 1 (2026-05-04 to 2026-05-10)

**Goal:** Monorepo scaffolding with all tooling configured and passing.

**Deliverables:**
- [ ] pnpm workspace root with pnpm-workspace.yaml
- [ ] Turborepo turbo.json configured with caching
- [ ] Directory structure: apps/web, apps/desktop, services/api, services/realtime, services/search, services/mail-worker, services/meet, packages/types, packages/schema, packages/utils, infra/, docs/, .github/workflows/
- [ ] TypeScript strict mode (strict: true) in every tsconfig.json
- [ ] ESLint config (shared @jay/eslint-config in packages)
- [ ] Prettier config (shared)
- [ ] Husky + lint-staged pre-commit hooks
- [ ] .editorconfig enforcing 2-space indent, LF line endings
- [ ] pnpm run build succeeds with no errors across all packages
- [ ] Docker Compose skeleton (docker-compose.yml with placeholder services)

**Dependencies:** None (kickoff sprint)

**Risk flags:**
- Turborepo remote cache setup may require Vercel/Cloudflare account
- TypeScript strict mode on empty repos is easy; discipline to keep it strict later is the real risk

**Testing milestones:**
- [ ] pnpm test runs Vitest in each package (empty test suites pass)

---

#### SPRINT 2 -- Week 2 (2026-05-11 to 2026-05-17)

**Goal:** Core package contracts defined -- types, DB schema, and utility functions.

**Deliverables:**
- [ ] packages/types/ -- TypeScript types for: User, Workspace, File, Folder, Document, Permission, BillingPlan, AuditLog
- [ ] packages/schema/ -- Drizzle ORM schema for PostgreSQL: users, workspaces, workspace_members, files, folders, documents, permissions, billing_subscriptions, audit_logs
- [ ] packages/utils/ -- Shared utilities: generateId(), slugify(), validateEmail(), formatFileSize(), debounce(), throttle()
- [ ] Drizzle migration setup (drizzle-kit configured)
- [ ] First migration file: 001_create_users.sql
- [ ] All types exported as barrel (index.ts) with explicit exports (no export *)
- [ ] packages/types/ test suite: 100% coverage on type guards

**Dependencies:** Sprint 1 (monorepo must build)

**Risk flags:**
- Schema design decisions now are expensive to change later; needs architect review before merge
- Drizzle ORM vs Prisma debate could cause rework -- lock decision in Sprint 1 retro

**Testing milestones:**
- [ ] Unit tests for all utility functions in packages/utils/
- [ ] Type tests using tsd or expect-type for packages/types/
- [ ] Drizzle schema validation test (schema compiles, migrations generate)

---

#### SPRINT 3 -- Week 3 (2026-05-18 to 2026-05-24)

**Goal:** Design system tokens and foundational components built and documented.

**Deliverables:**
- [ ] apps/web/src/design-system/tokens.css -- CSS custom properties for:
  - Colors: --color-bg, --color-surface, --color-surface-hover, --color-border, --color-text, --color-text-secondary, --color-accent, --color-accent-hover, --color-danger, --color-success, --color-warning
  - Spacing: --space-1 (4px) through --space-16 (64px)
  - Typography: --font-sans: Inter, --font-mono, --text-xs (11px) through --text-xl (20px), base 14px
  - Border radius: --radius-sm (2px), --radius-md (4px), --radius-lg (8px)
  - Animation: --transition-fast (150ms), --transition-normal (200ms)
  - Z-index scale: --z-dropdown, --z-modal, --z-toast, --z-tooltip
- [ ] Font loading: Inter from self-hosted files (not CDN)
- [ ] Lucide icons installed and tree-shaking configured
- [ ] Components built and tested in isolation:
  - [ ] Button (variants: primary, secondary, ghost, danger; sizes: sm, md, lg)
  - [ ] Input (text, email, password, search; with label, error state, helper text)
  - [ ] Textarea (with character count, resize control)
  - [ ] Select (single-select dropdown with search)
  - [ ] Checkbox and Radio
  - [ ] Toggle (switch)
  - [ ] Avatar (with initials fallback, online status indicator)
  - [ ] Badge (info, success, warning, danger)
  - [ ] Tooltip (positioned, keyboard accessible)
  - [ ] Modal (focus trap, escape to close, ARIA)
  - [ ] Dialog (confirmation dialogs)
  - [ ] Toast (stackable, auto-dismiss, action button)
  - [ ] Tabs (horizontal, keyboard navigable)
  - [ ] Accordion
  - [ ] Table (sortable columns, sticky header)
  - [ ] Spinner and ProgressBar
  - [ ] EmptyState (icon, title, description, action)
  - [ ] Skeleton (loading placeholders)
  - [ ] Divider
  - [ ] ContextMenu (right-click menu)
- [ ] CSS Modules configured in Vite
- [ ] Storybook (or custom component gallery) running at /storybook

**Dependencies:** Sprint 1

**Risk flags:**
- Over-engineering components now -- resist adding features not in spec
- CSS specificity wars if CSS Modules not enforced strictly
- Accessibility must be built in now, not retrofitted

**Testing milestones:**
- [ ] Visual regression tests for all components (Playwright screenshots)
- [ ] Keyboard navigation tests for all interactive components
- [ ] ARIA attribute validation tests
- [ ] 80%+ test coverage on design system components

---

#### SPRINT 4 -- Week 4 (2026-05-25 to 2026-05-31)

**Goal:** Complex design system components + layout primitives complete.

**Deliverables:**
- [ ] CommandPalette (fuzzy search, keyboard navigation, grouped results)
- [ ] Autocomplete (async search, debounce, virtualized dropdown)
- [ ] DatePicker (month view, range selection, keyboard navigation)
- [ ] FileUploader (drag-and-drop, progress bar, file type validation, multi-file)
- [ ] Toolbar (overflow handling, grouped buttons, keyboard shortcuts)
- [ ] Sidebar (collapsible, resizable, nested navigation)
- [ ] Breadcrumbs
- [ ] Pagination
- [ ] SearchInput (with recent searches, clear button)
- [ ] Layout components:
  - [ ] AppShell (sidebar + header + content area)
  - [ ] SplitPane (resizable horizontal/vertical)
  - [ ] Grid (responsive, gap-based)
  - [ ] Stack (horizontal/vertical, gap-based)
- [ ] Theme system: light mode (default) + dark mode toggle
- [ ] Print styles for documents
- [ ] Component documentation: each component has usage examples, props table, accessibility notes

**Dependencies:** Sprint 3 (foundation components must be stable)

**Risk flags:**
- CommandPalette performance with 1000+ items -- need virtualization from day one
- DatePicker timezone edge cases

**Testing milestones:**
- [ ] All Sprint 4 components have unit + visual regression tests
- [ ] Keyboard navigation audit across ALL components (Sprint 3 + 4)
- [ ] Dark mode visual regression comparison

---

### SUB-PHASE 1B: Authentication & Platform Shell (Weeks 5-7)

#### SPRINT 5 -- Week 5 (2026-06-01 to 2026-06-07)

**Goal:** Backend auth API with JWT, registration, login, and password reset.

**Deliverables:**
- [ ] services/api/ Fastify server with:
  - [ ] POST /auth/register (email, password, name; email verification sent)
  - [ ] POST /auth/login (email + password yields JWT access + refresh tokens)
  - [ ] POST /auth/logout (invalidate refresh token)
  - [ ] POST /auth/refresh (rotate refresh token, issue new access token)
  - [ ] POST /auth/forgot-password (send reset email)
  - [ ] POST /auth/reset-password (token + new password)
  - [ ] POST /auth/verify-email (verify token)
  - [ ] GET /auth/me (current user profile)
  - [ ] PATCH /auth/me (update profile: name, avatar, timezone)
  - [ ] POST /auth/change-password (current + new password)
- [ ] JWT auth middleware (verify access token, attach user to request)
- [ ] Rate limiting on auth endpoints (10 req/min per IP)
- [ ] Password hashing with bcrypt (cost factor 12)
- [ ] Email verification token flow (signed URL, 24h expiry)
- [ ] Password reset token flow (signed URL, 1h expiry, single-use)
- [ ] Refresh token rotation (old token invalidated on use)
- [ ] Drizzle migrations for users table complete with all auth columns
- [ ] Zod validation on all request bodies
- [ ] OpenAPI spec generated from route schemas

**Dependencies:** Sprint 2 (DB schema), Sprint 1 (monorepo)

**Risk flags:**
- Email delivery in dev environment -- use Mailhog or Ethereal for testing
- JWT security: must use httpOnly cookies, not localStorage
- Rate limiting must be IP + email aware to prevent enumeration

**Testing milestones:**
- [ ] Unit tests for all auth routes (happy path + error cases)
- [ ] Integration tests with real PostgreSQL (test containers)
- [ ] Token expiry tests
- [ ] Rate limiting tests

---

#### SPRINT 6 -- Week 6 (2026-06-08 to 2026-06-14)

**Goal:** Frontend auth UI with full flow: register, login, verify, reset.

**Deliverables:**
- [ ] apps/web/ React app with:
  - [ ] /register page (form validation, password strength meter, terms checkbox)
  - [ ] /login page (remember me, forgot password link, SSO placeholder)
  - [ ] /verify-email page (resend verification, back to login)
  - [ ] /forgot-password page (email input, confirmation message)
  - [ ] /reset-password/:token page (new password + confirm, validation)
  - [ ] /settings/profile page (edit name, avatar upload, timezone)
  - [ ] /settings/security page (change password, active sessions list, 2FA placeholder)
- [ ] React Router v6 configured with protected routes
- [ ] Auth state management via Zustand (useAuthStore)
- [ ] Axios/Fetch interceptors for JWT refresh (automatic token refresh on 401)
- [ ] CSRF protection (double-submit cookie pattern)
- [ ] Form validation with Zod + react-hook-form
- [ ] Error boundaries around auth pages
- [ ] Loading states on all auth form submissions
- [ ] Redirect logic: unauthenticated to /login, authenticated to /workspace

**Dependencies:** Sprint 5 (auth API must be working), Sprint 4 (design system components)

**Risk flags:**
- Token refresh race condition: multiple 401s simultaneously, only one refresh call
- XSS prevention: httpOnly cookies means JS cannot read tokens (good) but requires CSRF protection
- Browser cookie policies (SameSite, Secure flags)

**Testing milestones:**
- [ ] Playwright E2E tests for: full registration flow, login flow, forgot+reset password flow
- [ ] Unit tests for auth store (Zustand)
- [ ] Unit tests for token refresh interceptor
- [ ] Accessibility audit on auth pages

---

#### SPRINT 7 -- Week 7 (2026-06-15 to 2026-06-21)

**Goal:** Platform shell -- workspace creation, navigation, settings, global search UI.

**Deliverables:**
- [ ] /workspace -- workspace home (dashboard)
- [ ] Workspace creation flow:
  - [ ] Modal: workspace name, timezone, plan selection (Free placeholder)
  - [ ] POST /workspaces API endpoint
  - [ ] GET /workspaces -- list user workspaces
  - [ ] GET /workspaces/:id -- workspace details
  - [ ] PATCH /workspaces/:id -- update workspace
  - [ ] POST /workspaces/:id/members/invite -- invite by email
  - [ ] GET /workspaces/:id/members -- list members
  - [ ] DELETE /workspaces/:id/members/:userId -- remove member
  - [ ] PATCH /workspaces/:id/members/:userId/role -- change role (owner/admin/member)
- [ ] App switcher (top bar) -- dropdown listing all JAY apps with icons
- [ ] Global search UI (CommandPalette wired to search endpoint placeholder)
- [ ] Left sidebar with workspace navigation (Drive, Docs, Notes, Settings, etc.)
- [ ] User menu (avatar dropdown: profile, settings, sign out)
- [ ] Workspace settings page:
  - [ ] General (name, avatar, timezone)
  - [ ] Members (list, invite, roles)
  - [ ] Billing (placeholder)
  - [ ] Danger zone (delete workspace)
- [ ] RBAC middleware on backend: requireRole(admin), requirePermission(file:write)
- [ ] Permission matrix defined: owner > admin > member > viewer
- [ ] Invitation email template (plain text + HTML)
- [ ] Activity indicator in top bar (bell icon, notifications dropdown)

**Dependencies:** Sprint 6 (auth must work), Sprint 5 (workspace API)

**Risk flags:**
- Workspace data isolation: every query MUST be scoped to workspace_id -- this is the #1 security risk
- Multi-tenant architecture decisions made now are expensive to change
- Invitation flow requires email service integration

**Testing milestones:**
- [ ] E2E test: create workspace, invite member, accept invite, verify role
- [ ] RBAC unit tests: every permission check has a test case
- [ ] Multi-tenancy isolation test: User A cannot access User B workspace data

---

### SUB-PHASE 1C: JAY Drive & Real-time Foundation (Weeks 8-10)

#### SPRINT 8 -- Week 8 (2026-06-22 to 2026-06-28)

**Goal:** JAY Drive backend -- file CRUD, folder tree, storage integration.

**Deliverables:**
- [ ] MinIO service running in Docker Compose
- [ ] API endpoints:
  - [ ] POST /drive/files -- upload file (multipart, returns file metadata)
  - [ ] GET /drive/files/:id -- file metadata
  - [ ] GET /drive/files/:id/download -- presigned download URL
  - [ ] PUT /drive/files/:id -- update metadata (name, parent folder)
  - [ ] DELETE /drive/files/:id -- soft delete (move to trash)
  - [ ] POST /drive/files/:id/restore -- restore from trash
  - [ ] DELETE /drive/files/:id/permanent -- permanent delete
  - [ ] GET /drive/files -- list files with pagination, filtering, sorting
  - [ ] POST /drive/folders -- create folder
  - [ ] GET /drive/folders/:id -- folder contents
  - [ ] PATCH /drive/folders/:id -- rename, move
  - [ ] DELETE /drive/folders/:id -- soft delete
  - [ ] POST /drive/files/:id/copy -- duplicate file
  - [ ] POST /drive/files/:id/move -- move to folder
  - [ ] GET /drive/trash -- list trashed items
  - [ ] POST /drive/trash/empty -- permanent delete all trash
  - [ ] GET /drive/search -- search files by name
  - [ ] POST /drive/files/:id/share -- generate share link
  - [ ] GET /drive/share/:token -- access shared file
- [ ] File metadata schema: id, name, mime_type, size, storage_key, parent_id, workspace_id, owner_id, created_at, updated_at, deleted_at, starred, version
- [ ] Folder tree query (recursive CTE or materialized path)
- [ ] File upload: chunked upload support for files > 10MB
- [ ] File type validation (whitelist of allowed MIME types)
- [ ] Storage quota tracking per workspace
- [ ] Drizzle migration: files, folders, file_shares tables

**Dependencies:** Sprint 2 (schema), Sprint 5 (Fastify server running)

**Risk flags:**
- MinIO configuration for multi-tenant bucket strategy (one bucket per workspace vs shared)
- Chunked upload complexity -- start simple (single upload) and add chunking later if needed
- Storage quota enforcement must be atomic (race condition on simultaneous uploads)

**Testing milestones:**
- [ ] Unit tests for all Drive API endpoints
- [ ] Integration tests with MinIO (test containers)
- [ ] File upload/download round-trip test
- [ ] Folder tree integrity test (no orphaned files)

---

#### SPRINT 9 -- Week 9 (2026-06-29 to 2026-07-05)

**Goal:** JAY Drive frontend -- file browser, upload, folder navigation, context menus.

**Deliverables:**
- [ ] /drive -- main Drive page
- [ ] File browser component:
  - [ ] List view (table: name, size, modified, owner)
  - [ ] Grid view (thumbnail cards)
  - [ ] View toggle (persisted in localStorage)
  - [ ] Sort by: name, size, modified, type (asc/desc)
  - [ ] Filter by: type (documents, spreadsheets, presentations, images, other)
  - [ ] Breadcrumb navigation for folder path
- [ ] Upload experience:
  - [ ] Drag-and-drop zone on entire Drive page
  - [ ] Upload progress modal with per-file progress bars
  - [ ] Cancel upload button
  - [ ] Conflict resolution modal (file already exists: replace, keep both, skip)
  - [ ] Bulk upload (multiple files + folders)
- [ ] Folder operations:
  - [ ] Create folder (inline name input)
  - [ ] Rename folder/file (inline edit)
  - [ ] Move file/folder (folder picker dialog)
  - [ ] Copy file (folder picker dialog)
  - [ ] Delete (move to trash with undo toast)
  - [ ] Star/unstar
- [ ] Context menu (right-click): open, preview, download, rename, move, copy, share, delete, star
- [ ] File preview panel (right sidebar, toggleable):
  - [ ] Image preview
  - [ ] PDF preview (embed)
  - [ ] Text file preview
  - [ ] File metadata display
- [ ] Search within Drive (debounced, highlights matches)
- [ ] Recent files section on /workspace dashboard (last 10 modified)
- [ ] Storage quota indicator in sidebar

**Dependencies:** Sprint 8 (Drive API), Sprint 4 (design system components)

**Risk flags:**
- Virtualization for large folders (1000+ files) -- must use virtual list
- Drag-and-drop file upload conflicts with drag-and-drop file reordering
- Folder move operations can create cycles if not validated on backend

**Testing milestones:**
- [ ] E2E test: upload file, rename, move to folder, delete, restore from trash
- [ ] E2E test: create folder hierarchy, navigate breadcrumbs
- [ ] Unit tests for file browser state management
- [ ] Performance test: render 5000 files in list view (must be < 200ms initial render)

---

#### SPRINT 10 -- Week 10 (2026-07-06 to 2026-07-12)

**Goal:** Real-time collaboration infrastructure -- Yjs + Socket.io + operational transforms.

**Deliverables:**
- [ ] services/realtime/ -- Socket.io server:
  - [ ] WebSocket connection with JWT authentication
  - [ ] Room-based document editing (join/leave document room)
  - [ ] Presence tracking (who is viewing/editing a document)
  - [ ] Cursor broadcast (position, selection, color)
  - [ ] Typing indicators
- [ ] Yjs integration:
  - [ ] y-websocket provider configured
  - [ ] Document persistence: Yjs updates saved to PostgreSQL
  - [ ] Snapshot creation (periodic, for faster loading)
  - [ ] State vector sync on connect
  - [ ] Conflict resolution (Yjs handles automatically)
- [ ] API endpoints:
  - [ ] GET /realtime/doc/:docId/updates -- fetch Yjs updates for offline sync
  - [ ] POST /realtime/doc/:docId/snapshot -- force snapshot
- [ ] Drizzle migration: document_updates, document_snapshots tables
- [ ] Redis pub/sub for horizontal scaling (multiple realtime servers)
- [ ] Connection recovery: auto-reconnect with state reconciliation
- [ ] Presence API:
  - [ ] GET /presence/doc/:docId -- list active users
  - [ ] WebSocket event: presence:update -- broadcast on join/leave

**Dependencies:** Sprint 8 (PostgreSQL running), Sprint 1 (Redis in Docker Compose)

**Risk flags:**
- Yjs + PostgreSQL persistence is complex -- the update log can grow unbounded; snapshot strategy is critical
- WebSocket scaling: Socket.io adapter must use Redis for multi-instance deployment
- CRDT memory usage: large documents can consume significant server RAM
- Offline sync: reconciling offline edits with server state is the hardest problem

**Testing milestones:**
- [ ] Load test: 100 concurrent users editing same document
- [ ] Integration test: two clients edit same document, verify convergence
- [ ] Persistence test: server restart, document state preserved
- [ ] Snapshot test: document loads from snapshot + delta updates

---

### SUB-PHASE 1D: JAY Docs & JAY Notes (Weeks 11-13)

#### SPRINT 11 -- Week 11 (2026-07-13 to 2026-07-19)

**Goal:** JAY Docs editor -- ProseMirror setup with basic formatting and real-time collaboration.

**Deliverables:**
- [ ] /docs/new -- create new document
- [ ] /docs/:id -- document editor page
- [ ] ProseMirror editor setup:
  - [ ] Schema: paragraphs, headings (h1-h3), bold, italic, underline, strikethrough
  - [ ] Lists: ordered, unordered, task lists
  - [ ] Blockquotes
  - [ ] Code blocks (with language selector)
  - [ ] Horizontal rules
  - [ ] Links (inline)
  - [ ] Images (upload + embed)
  - [ ] Tables (basic)
- [ ] Toolbar:
  - [ ] Formatting buttons (bold, italic, underline, etc.)
  - [ ] Heading dropdown
  - [ ] List toggles
  - [ ] Insert menu (image, table, code block, divider)
  - [ ] Undo/redo
- [ ] Keyboard shortcuts:
  - [ ] Ctrl/Cmd+B bold, Ctrl/Cmd+I italic, Ctrl/Cmd+U underline
  - [ ] Ctrl/Cmd+K insert link
  - [ ] Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo
  - [ ] Tab indent, Shift+Tab outdent
  - [ ] Ctrl/Cmd+Enter insert line break
- [ ] Real-time collaboration:
  - [ ] Yjs-ProseMirror binding
  - [ ] Remote cursor display (colored cursors with user name)
  - [ ] Remote selection highlights
  - [ ] Active users list in top bar
- [ ] Document API:
  - [ ] POST /docs -- create document
  - [ ] GET /docs/:id -- get document metadata
  - [ ] PATCH /docs/:id -- update metadata (title, starred)
  - [ ] DELETE /docs/:id -- soft delete
  - [ ] GET /docs -- list documents (with pagination, search)
  - [ ] POST /docs/:id/duplicate -- copy document
- [ ] Document title editing (inline, auto-save)
- [ ] Auto-save indicator (saving, saved, unsaved changes)
- [ ] Document creation from Drive (right-click, New, JAY Doc)

**Dependencies:** Sprint 10 (real-time infrastructure), Sprint 9 (Drive integration)

**Risk flags:**
- ProseMirror schema design is foundational -- changes later require data migration
- Yjs-ProseMirror binding has known edge cases with complex schemas
- Image handling: embedding vs linking, storage implications

**Testing milestones:**
- [ ] Unit tests for all ProseMirror plugins
- [ ] E2E test: two users edit same document concurrently, verify convergence
- [ ] E2E test: create document, format text, save, reload, verify content
- [ ] Keyboard shortcut tests (every shortcut must work)

---

#### SPRINT 12 -- Week 12 (2026-07-20 to 2026-07-26)

**Goal:** JAY Docs advanced features + JAY Notes foundation.

**Deliverables:**
- [ ] JAY Docs advanced features:
  - [ ] Document version history:
    - [ ] GET /docs/:id/versions -- list versions
    - [ ] GET /docs/:id/versions/:versionId -- get version content
    - [ ] POST /docs/:id/versions/:versionId/restore -- restore version
    - [ ] UI: version history panel (timeline, compare view)
  - [ ] Comments on text selections:
    - [ ] Highlight text, Add comment, comment thread
    - [ ] POST /docs/:id/comments, GET /docs/:id/comments, PATCH /docs/:id/comments/:id, DELETE /docs/:id/comments/:id
    - [ ] Real-time comment notifications via Socket.io
    - [ ] Resolve/unresolve comments
  - [ ] Document sharing:
    - [ ] Share modal: invite by email, set permission (view/comment/edit)
    - [ ] Share link generation (view-only or edit)
    - [ ] Link permission management
  - [ ] Export:
    - [ ] Export as PDF
    - [ ] Export as .docx (using docx library)
    - [ ] Export as .txt
    - [ ] Export as HTML
  - [ ] Import:
    - [ ] Import .docx (using mammoth.js)
    - [ ] Import .txt
    - [ ] Import .html
  - [ ] Print view (clean, page-break aware)
  - [ ] Word count and reading time in status bar
- [ ] JAY Notes -- initial setup:
  - [ ] ProseMirror editor reused from Docs (same schema + extensions)
  - [ ] Notes list view (sidebar: search, tags, recent)
  - [ ] /notes page with split-pane (list + editor)
  - [ ] Note creation, rename, delete
  - [ ] Tag system (create, assign, filter by tag)
  - [ ] Pin notes to top
  - [ ] API: POST /notes, GET /notes, GET /notes/:id, PATCH /notes/:id, DELETE /notes/:id
  - [ ] Real-time collaboration on notes (same Yjs stack)

**Dependencies:** Sprint 11 (Docs editor working), Sprint 10 (real-time)

**Risk flags:**
- .docx import/export quality will vary -- set expectations that complex formatting may not survive
- Version history storage: storing full snapshots vs diffs affects database size
- Comment threads need their own permission model (who can resolve?)

**Testing milestones:**
- [ ] E2E test: import .docx, verify content preservation
- [ ] E2E test: export to PDF, verify formatting
- [ ] E2E test: version history -- make changes, view history, restore
- [ ] E2E test: comments -- add, reply, resolve
- [ ] Unit tests for docx import/export converters

---

#### SPRINT 13 -- Week 13 (2026-07-27 to 2026-08-02)

**Goal:** Global search, billing foundation, Phase 1 polish and hardening.

**Deliverables:**
- [ ] Global search (full implementation):
  - [ ] Typesense service running in Docker Compose
  - [ ] services/search/ -- sync service:
    - [ ] Watch PostgreSQL for changes (logical replication or polling)
    - [ ] Index: documents, notes, files, folders, workspace members
    - [ ] Reindex endpoint for full rebuild
  - [ ] Search API: GET /search?q=... (unified search across all content types)
  - [ ] CommandPalette wired to search API (fuzzy matching, recent results, result grouping)
  - [ ] Keyboard shortcut: Ctrl/Cmd+K opens global search from anywhere
- [ ] Billing foundation:
  - [ ] Stripe integration (test mode):
    - [ ] POST /billing/checkout -- create checkout session
    - [ ] POST /billing/webhook -- handle Stripe events
    - [ ] Subscription model: Free, Pro ($10/user/mo placeholder)
    - [ ] GET /billing/subscription -- current subscription
    - [ ] GET /billing/invoices -- invoice history
  - [ ] Feature gating middleware (check plan before allowing features)
  - [ ] Usage limits tracking (storage, documents, members per plan)
- [ ] Phase 1 polish:
  - [ ] Error pages (404, 500, offline)
  - [ ] Loading skeletons for all data-heavy pages
  - [ ] Toast notifications for all async operations
  - [ ] Keyboard shortcut reference modal (Ctrl/Cmd+/)
  - [ ] Onboarding tour for new users (first login)
  - [ ] Performance audit: Lighthouse score > 90 on Drive, Docs, Notes
  - [ ] Accessibility audit: WCAG 2.1 AA on all Phase 1 pages
  - [ ] OpenTelemetry instrumentation on all API endpoints
  - [ ] Sentry error tracking integrated in frontend + backend

**Dependencies:** Sprints 1-12 (everything in Phase 1)

**Risk flags:**
- Typesense sync latency: changes may take seconds to appear in search
- Stripe webhook testing requires tunneling (ngrok/stripe CLI)
- Performance targets (200ms UI response) must be measured and enforced now

**Testing milestones:**
- [ ] E2E test: global search across documents, files, notes
- [ ] E2E test: Stripe checkout flow (test mode)
- [ ] Load test: API endpoints under 100 concurrent users
- [ ] Lighthouse audit: Performance, Accessibility, Best Practices, SEO
- [ ] Full regression test suite for all Phase 1 features

---

## 3. PHASE 2: OFFICE CORE (Weeks 14-30)

**Theme:** Build the office. Sheets, Slides, Calendar, Mail, Tasks -- the productivity heart.

### SUB-PHASE 2A: JAY Sheets (Weeks 14-19)

#### SPRINT 14 -- Week 14 (2026-08-03 to 2026-08-09)

**Goal:** Spreadsheet engine core -- grid rendering, cell model, formula parser.

**Deliverables:**
- [ ] Custom canvas-based grid renderer (not HTML table):
  - [ ] Cell grid rendering (rows x columns, virtualized)
  - [ ] Smooth scrolling (both axes, 60fps)
  - [ ] Row/column headers (A-Z / 1-3...)
  - [ ] Cell selection (single, range via drag, multi-select with Ctrl/Cmd)
  - [ ] Column/row resize, insert/delete
  - [ ] Frozen panes (freeze top rows, freeze left columns)
- [ ] Cell data model: types (text/number/boolean/date/formula/error), properties (value/formula/format/style/comment), sparse data structure
- [ ] Formula engine: lexer+parser, A1 notation, range refs (A1:B10), absolute/relative ($A$1), dependency graph, circular ref detection
- [ ] Core functions (30+): Math (SUM, AVERAGE, MIN, MAX, COUNT, ROUND, FLOOR, CEILING, ABS, SQRT, POWER, MOD), Logic (IF, AND, OR, NOT, IFERROR), Text (CONCATENATE, LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER, FIND, SUBSTITUTE), Lookup (VLOOKUP, HLOOKUP, INDEX, MATCH)
- [ ] API: POST/GET/PATCH/DELETE /sheets, GET /sheets
- [ ] Drizzle migration: sheets, sheet_tabs, cells tables

**Dependencies:** Sprint 10 (real-time infrastructure for future collab)

**Risk flags:**
- **CRITICAL:** Canvas renderer performance is make-or-break. Must achieve 60fps with 10,000+ cells visible
- Formula parser complexity: spreadsheet formulas are Turing-complete in practice
- This is the most technically difficult component in the entire product

**Testing milestones:**
- [ ] Unit tests for formula parser (100+ test cases)
- [ ] Unit tests for each core function + dependency graph
- [ ] Performance test: render 10,000 cells, scroll at 60fps
- [ ] Circular reference detection tests

---

#### SPRINT 15 -- Week 15 (2026-08-10 to 2026-08-16)

**Goal:** Sheets cell editing, formatting, and copy/paste.

**Deliverables:**
- [ ] Cell editing: double-click/type to edit, formula bar, in-cell cursor, function autocomplete + tooltip, auto-fill handle
- [ ] Cell formatting: number formats (default/number/currency/percentage/date/time/scientific/fraction), text formatting (bold/italic/underline/strikethrough/font size/color), alignment, borders, decimal places, conditional formatting, merge cells, wrap/overflow
- [ ] Copy/paste: Ctrl/Cmd+C/V/X, copy between Sheets, paste plain text, paste from external (Google Sheets/Excel), paste special (values/formatting/formulas)
- [ ] Undo/redo (command pattern), multi-sheet support (tabs), sheet tab colors

**Dependencies:** Sprint 14 (grid engine working)

**Risk flags:**
- Clipboard API browser inconsistencies (especially Firefox)
- Undo stack memory management

**Testing milestones:**
- [ ] Unit tests for all formatting operations
- [ ] E2E test: enter formulas, verify calculations, check auto-fill
- [ ] E2E test: copy from Google Sheets, paste into JAY Sheets

---

#### SPRINT 16 -- Week 16 (2026-08-17 to 2026-08-23)

**Goal:** Sheets advanced features -- charts, filters, sorting, freeze, print.

**Deliverables:**
- [ ] Sorting: A-Z/Z-A, multi-column, preserves header
- [ ] Filtering: auto-filter dropdown, by value/condition/color, clear, multi-column AND logic
- [ ] Charts: bar/column/line/pie/area/scatter, range selector, title/axis/legend, live updates, resize/move
- [ ] Find and replace: highlight matches, single/all replace, match case/cell/formula, navigate
- [ ] Go to cell (Ctrl/Cmd+G), freeze panes UI, print setup (preview, orientation, paper, margins, scale, area, headers/footers)
- [ ] Sheet protection (lock cells, allow ranges)

**Dependencies:** Sprint 15 (cell editing complete)

**Testing milestones:**
- [ ] Unit tests for sort + filter algorithms
- [ ] E2E test: create chart, modify data, verify update
- [ ] E2E test: apply/clear filters

---

#### SPRINT 17 -- Week 17 (2026-08-24 to 2026-08-30)

**Goal:** Sheets collaboration, import/export, additional functions.

**Deliverables:**
- [ ] Real-time collab: Yjs for spreadsheet (custom Yjs type), remote cursors/selection, active users, cell-level locking
- [ ] Import: .xlsx, .csv (delimiter/encoding detection), .ods, Google Sheets, progress indicator
- [ ] Export: .xlsx, .csv, .pdf, selected range only
- [ ] Extended functions (50+): Date (TODAY, NOW, DATE, TIME, DAY, MONTH, YEAR, WEEKDAY, DATEDIF, EOMONTH, WORKDAY), Financial (PV, FV, PMT, RATE, NPV, IRR), Statistical (STDEV, VAR, MEDIAN, MODE, QUARTILE, PERCENTILE, CORREL), Array (TRANSPOSE, UNIQUE, SORT, FILTER, SEQUENCE), Information (ISBLANK, ISNUMBER, ISTEXT, ISERROR, TYPE, CELL)
- [ ] Named ranges, data validation, batch cell update API

**Dependencies:** Sprint 16 (advanced features), Sprint 10 (real-time)

**Risk flags:**
- **CRITICAL:** SheetJS/xlsx licensing must be verified for commercial use
- Array formulas are a rabbit hole -- scope to basic implementations only

**Testing milestones:**
- [ ] E2E test: two users edit different cells, verify convergence
- [ ] E2E test: import/export .xlsx round-trip
- [ ] Unit tests for all 80+ functions

---

#### SPRINT 18 -- Week 18 (2026-08-31 to 2026-09-06)

**Goal:** Sheets polish, performance, offline mode.

**Deliverables:**
- [ ] Performance: virtual scrolling (1M+ cells), formula recalc batching (16ms debounce), lazy chart rendering, Web Worker for formula eval, memory profiling
- [ ] Offline mode: Service Worker caching, IndexedDB storage, offline edit queue, Yjs conflict resolution on reconnect, offline indicator
- [ ] Keyboard shortcuts: Ctrl/Cmd+Arrow, Ctrl/Cmd+Shift+Arrow, Ctrl/Cmd+D, Ctrl/Cmd+R, F2, Delete, Alt+Enter, Ctrl/Cmd+;, Ctrl/Cmd+Shift+;, Ctrl/Cmd+H
- [ ] Sheet templates, Drive integration (New > JAY Sheet)

**Dependencies:** Sprint 17 (collaboration working)

**Testing milestones:**
- [ ] Performance benchmark: 1M cells, scroll smooth, recalc < 200ms
- [ ] E2E test: offline editing, reconnect, sync
- [ ] Memory leak test: 50 sheets open/close

---

#### SPRINT 19 -- Week 19 (2026-09-07 to 2026-09-13)

**Goal:** Sheets -- final hardening, edge cases, accessibility.

**Deliverables:**
- [ ] Accessibility: arrow key navigation, screen reader (ARIA grid role, cell announcements), high contrast, focus indicators
- [ ] Edge cases: long text, large numbers, date parsing, formula errors (#DIV/0!, #N/A, #REF!, #VALUE!, #NAME?, #NUM!, #NULL!), 1000+ conditional rules
- [ ] Context menu, sheet tab ops, cell comments, sheet sharing
- [ ] Sheets E2E test coverage > 80%

**Dependencies:** Sprint 18 (performance + offline)

**Testing milestones:**
- [ ] Screen reader audit (NVDA/JAWS)
- [ ] Full E2E regression for Sheets
- [ ] Cross-browser testing

---

### SUB-PHASE 2B: JAY Slides (Weeks 20-23)

#### SPRINT 20 -- Week 20 (2026-09-14 to 2026-09-20)

**Goal:** Slides editor core -- canvas, slide management, basic shapes.

**Deliverables:**
- [ ] Fabric.js canvas: 16:9/4:3/custom, zoom/pan, grid/snap
- [ ] Slide management: thumbnails, add/duplicate/delete/reorder (drag-drop)
- [ ] 11 standard layouts: title, title+content, section header, two content, comparison, title only, blank, content with caption, picture with caption
- [ ] Shapes: rectangle, ellipse, triangle, diamond, line, arrow, star, banner, callout; styling (fill/border/width/transparency); ops (resize/rotate/flip/align/distribute)
- [ ] Text boxes: rich text (bold/italic/underline/color/size/font), alignment, lists, text inside shapes
- [ ] Undo/redo, API: POST/GET/PATCH/DELETE /slides

**Dependencies:** Sprint 4 (design system), Sprint 9 (Drive)

**Risk flags:**
- Fabric.js v5 vs v6 -- lock version early
- Canvas performance with 100+ objects per slide

**Testing milestones:**
- [ ] Unit tests for shape creation/manipulation
- [ ] E2E test: create presentation, add slides/shapes, save, reload

---

#### SPRINT 21 -- Week 21 (2026-09-21 to 2026-09-27)

**Goal:** Slides -- images, tables, presenter view, themes.

**Deliverables:**
- [ ] Images: insert (Drive/computer/URL), resize, crop, adjustments (brightness/contrast/saturation), border/shadow, replace, shape fill
- [ ] Tables: insert, add/delete rows/cols, merge cells, styling, resize
- [ ] Themes: 10+ built-in, apply to all, custom creation, preview, slide master editing
- [ ] Presenter view: /slides/:id/present fullscreen, second-screen view (current/next/notes/timer), navigation (click/arrows/space), laser pointer (L), black/white screen (B/W), jump to slide (number+Enter), exit (Esc)
- [ ] Speaker notes, slide backgrounds (solid/gradient/image/pattern)

**Dependencies:** Sprint 20 (core editor)

**Testing milestones:**
- [ ] E2E test: presenter mode with keyboard navigation
- [ ] E2E test: apply theme, verify all slides update

---

#### SPRINT 22 -- Week 22 (2026-09-28 to 2026-10-04)

**Goal:** Slides -- animations, collaboration, import/export.

**Deliverables:**
- [ ] Animations: entry (fade/appear/float/fly/zoom/wipe/split), exit, emphasis (pulse/spin/grow/color); timing (click/with previous/after previous); duration/delay; animation pane; preview
- [ ] Transitions: fade/push/wipe/split/reveal/random; duration; apply to all/selected
- [ ] Real-time collab: Fabric.js sync via Yjs, remote cursors, conflict resolution
- [ ] Import: .pptx, .odp. Export: .pptx, .pdf, PNG per slide, selected slides only
- [ ] Share presentation, Drive integration

**Dependencies:** Sprint 21 (themes+presenter), Sprint 10 (real-time)

**Risk flags:**
- **CRITICAL:** .pptx import/export is extremely complex. Expect 70-80% fidelity, not 100%
- Animation sync in real-time is very complex

**Testing milestones:**
- [ ] E2E test: import .pptx from PowerPoint, verify content
- [ ] E2E test: export .pptx, open in PowerPoint, verify fidelity
- [ ] E2E test: two users edit same slide, verify convergence

---

#### SPRINT 23 -- Week 23 (2026-10-05 to 2026-10-11)

**Goal:** Slides polish, templates, accessibility.

**Deliverables:**
- [ ] 20+ templates: pitch deck, project proposal, quarterly report, training, portfolio, event announcement
- [ ] Keyboard shortcuts: Ctrl/Cmd+M, Ctrl/Cmd+D, Delete, Ctrl/Cmd+C/V/X, Ctrl/Cmd+G, Ctrl/Cmd+Shift+G, Ctrl/Cmd+[/], Shift+click, Alt+drag
- [ ] Accessibility: alt text, reading order, slide titles, color contrast, keyboard nav
- [ ] Slides E2E > 75%, 50-slide deck opens < 2s

**Dependencies:** Sprint 22 (collab + import/export)

**Testing milestones:**
- [ ] Full E2E regression for Slides
- [ ] Accessibility audit on presenter view

---

### SUB-PHASE 2C: JAY Cal, JAY Mail, JAY Tasks (Weeks 24-30)

#### SPRINT 24 -- Week 24 (2026-10-12 to 2026-10-18)

**Goal:** JAY Cal -- calendar views, event CRUD, basic scheduling.

**Deliverables:**
- [ ] /cal page with views: day, week, month, agenda (toggle persisted)
- [ ] Event CRUD: create/edit/delete, drag reschedule, drag resize, form (title/date/time/all-day/location/description/color)
- [ ] Recurring events: daily/weekly/monthly/yearly/custom; edit scope (this/this+following/all)
- [ ] API: GET/POST/PATCH/DELETE /cal/events, recurring event expansion
- [ ] Mini calendar, today button, timezone support, Drizzle migration

**Dependencies:** Sprint 7 (workspace)

**Testing milestones:**
- [ ] Unit tests for recurring event expansion
- [ ] E2E test: create recurring event, modify instance
- [ ] E2E test: drag reschedule

---

#### SPRINT 25 -- Week 25 (2026-10-19 to 2026-10-25)

**Goal:** JAY Cal -- sharing, invites, reminders, integrations.

**Deliverables:**
- [ ] Event invites: attendees, required/optional, invitation email, RSVP tracking
- [ ] Calendar sharing: workspace (free/busy or full), link, subscribe ICS, export ICS
- [ ] Reminders: default + per-event, notification/email types
- [ ] Working hours: per day/user, shown in views
- [ ] Settings: first day, 12h/24h, default duration/reminders, multiple calendars
- [ ] Holiday calendar (country-specific), Find a time (availability grid)

**Dependencies:** Sprint 24 (core calendar), Sprint 5 (email)

**Testing milestones:**
- [ ] E2E test: invite attendees, RSVP, verify tracking
- [ ] E2E test: subscribe external ICS calendar
- [ ] E2E test: find a time across 3+ attendees

---

#### SPRINT 26 -- Week 26 (2026-10-26 to 2026-11-01)

**Goal:** JAY Mail -- IMAP/SMTP integration, inbox UI, compose.

**Deliverables:**
- [ ] services/mail-worker/: IMAP pool, SMTP, syncing, IMAP IDLE push, attachments (MinIO), body parsing
- [ ] Account setup: IMAP/SMTP auto-detect, OAuth2 Gmail/Outlook
- [ ] /mail: three-panel (folders | list | view), folders (Inbox/Starred/Sent/Drafts/Archive/Trash/Spam/custom)
- [ ] Message list + view: headers, HTML rendering, inline images, attachments, threaded convos
- [ ] Search emails (Typesense), compose (to/Cc/Bcc, subject, rich text, attachments, auto-save drafts, send later)
- [ ] API: GET /mail/folders, GET/POST /mail/messages, POST /mail/send, POST /mail/drafts
- [ ] Mark read/unread, star, archive, delete, move, reply/reply-all/forward

**Dependencies:** Sprint 7 (workspace), Sprint 8 (MinIO)

**Risk flags:**
- **CRITICAL:** IMAP is a 1980s protocol -- provider quirks (Gmail labels vs folders, Outlook) will consume significant time
- Email HTML sanitization for XSS prevention

**Testing milestones:**
- [ ] Integration tests with GreenMail IMAP server
- [ ] E2E test: send email, verify received
- [ ] HTML sanitization tests

---

#### SPRINT 27 -- Week 27 (2026-11-02 to 2026-11-08)

**Goal:** JAY Mail -- advanced features, filters, labels, offline.

**Deliverables:**
- [ ] Filters: conditions (from/to/subject/contains/attachment) + actions (mark read/star/archive/delete/move/label/forward), order, apply to existing
- [ ] Labels: custom color-coded, apply/remove, filter
- [ ] Snooze: presets + custom date/time
- [ ] Undo send (5s window), templates/canned responses with variables
- [ ] Offline mode: IndexedDB (last 30 days), compose offline (queued), read/search cached, sync on reconnect
- [ ] Bulk operations, contact management (auto-add, card, search)

**Dependencies:** Sprint 26 (mail core)

**Testing milestones:**
- [ ] E2E test: create filter, verify action on matching email
- [ ] E2E test: compose offline, reconnect, sent
- [ ] Load test: 100 filters on incoming message

---

#### SPRINT 28 -- Week 28 (2026-11-09 to 2026-11-15)

**Goal:** JAY Tasks -- Kanban board, task CRUD, basic project management.

**Deliverables:**
- [ ] /tasks page, project CRUD (name/description/color/icon), sidebar, settings
- [ ] Kanban: default columns (Backlog/To Do/In Progress/Review/Done), add/rename/reorder/delete columns
- [ ] Task cards: title/description/assignee/due/priority/labels/checklist/attachments, drag between columns, detail modal
- [ ] Swimlanes (optional), WIP limits, task CRUD/duplicate/templates
- [ ] Assignee, due dates (overdue highlighting), priority, labels, checklist (progress bar)
- [ ] Drizzle migration: projects, columns, tasks, task_assignees, task_labels, checklists

**Dependencies:** Sprint 7 (workspace)

**Testing milestones:**
- [ ] E2E test: create project, add columns, drag tasks
- [ ] E2E test: two users, real-time updates

---

#### SPRINT 29 -- Week 29 (2026-11-16 to 2026-11-22)

**Goal:** JAY Tasks -- Gantt view, list view, filters, reporting.

**Deliverables:**
- [ ] Gantt chart: timeline (day/week/month), task bars, dependencies (FS/SS/FF/SF), dependency lines, drag dates, critical path, milestones, progress %, today line
- [ ] List view: spreadsheet-like, sort/filter/group, inline editing, bulk edit
- [ ] Saved filters, custom date ranges, full-text search
- [ ] Reporting: burndown, completion rate, workload view, CSV export
- [ ] Real-time: Socket.io board updates, presence, activity log
- [ ] Task comments with @mentions, My Tasks view, Calendar view

**Dependencies:** Sprint 28 (Kanban core)

**Testing milestones:**
- [ ] E2E test: Gantt with dependencies, critical path
- [ ] E2E test: switch Kanban/List/Gantt, verify consistency
- [ ] Unit tests: dependency cycle detection, burndown

---

#### SPRINT 30 -- Week 30 (2026-11-23 to 2026-11-29)

**Goal:** Phase 2 hardening -- integration, performance, gate prep.

**Deliverables:**
- [ ] Cross-app integration: Drive>Doc/Sheet/Slide, attach to Tasks, Cal>Drive, Mail>Task, Tasks>Docs, global search all apps
- [ ] Performance audit: all targets met (Sheets 60fps, Slides <2s, Cal <500ms, Mail 60fps, Tasks responsive)
- [ ] Accessibility audit, offline verification, cross-browser testing
- [ ] Phase 2 E2E regression suite, user docs, OpenAPI updated

**Dependencies:** Sprints 14-29 (all Phase 2)

**Testing milestones:**
- [ ] Integration E2E: Drive>Doc>Task>Cal>Mail chain
- [ ] Load test: 500 concurrent users across Phase 2
- [ ] Lighthouse audit all Phase 2 pages
- [ ] WCAG 2.1 AA audit

---

## 4. PHASE 3: COMMUNICATION & SCALE (Weeks 31-52)

**Theme:** Connect teams, sign documents, go mobile, enterprise-ready.

### SUB-PHASE 3A: JAY Meet & JAY Chat (Weeks 31-38)

#### SPRINT 31 -- Week 31 (2026-11-30 to 2026-12-06)

**Goal:** JAY Meet -- WebRTC setup, 1:1 video calls, audio controls.

**Deliverables:**
- [ ] services/meet/ -- mediasoup SFU: worker setup, room create/join, SDP/ICE/DTLS, producer/consumer, simulcast
- [ ] /meet/:roomId: pre-join screen, video grid (1:1), mute/unmute, camera on/off, speaker/mic selection, screen share, leave
- [ ] API: POST /meet/rooms, GET /meet/rooms/:id, POST/POST /meet/rooms/:id/join/leave
- [ ] STUN/TURN (coturn in Docker), connection quality monitoring, meeting link generation
- [ ] Drizzle migration: meet_rooms, meet_participants

**Dependencies:** Sprint 1 (Docker), Sprint 5 (auth)

**Risk flags:**
- **CRITICAL:** mediasoup is complex -- NAT traversal, media quality tuning require specialized knowledge
- TURN server costs for relayed connections (10-20% of users)
- Safari WebRTC is the most problematic

**Testing milestones:**
- [ ] Integration test: 1:1 call connects, audio/video flows
- [ ] Network degradation test: packet loss simulation, recovery
- [ ] E2E test: join, mute/unmute, toggle video, leave

---

#### SPRINT 32 -- Week 32 (2026-12-07 to 2026-12-13)

**Goal:** JAY Meet -- group calls, screen sharing quality, meeting controls.

**Deliverables:**
- [ ] Group calls (up to 25): adaptive video grid, active speaker detection, pin participant, gallery/speaker view, participant list
- [ ] Screen sharing: screen/window/tab, audio share, quality settings, stop, multiple sharers
- [ ] Meeting controls (host): mute all, remove participant, lock meeting, hand raise, transfer host
- [ ] In-meeting chat: text sidebar, all/specific messages, emoji reactions, history
- [ ] Meeting settings: host approval, mute on entry, allow/deny screen share
- [ ] Meeting notifications: join from Cal event, start notification

**Dependencies:** Sprint 31 (1:1 working)

**Testing milestones:**
- [ ] Load test: 25 participants, verify media quality
- [ ] E2E test: host controls -- mute all, remove, lock
- [ ] Screen sharing across Chrome/Firefox/Safari

---

#### SPRINT 33 -- Week 33 (2026-12-14 to 2026-12-20)

**Goal:** JAY Chat -- team messaging, channels, direct messages.

**Deliverables:**
- [ ] /chat page, channel management (create/list/settings/join/leave), API CRUD
- [ ] Direct messages: 1:1, group DM (3+), recent conversations
- [ ] Messaging: send (text/emoji/code), edit (15min window), delete, reactions, threading, pinning, @mentions, link previews, code blocks with syntax, markdown
- [ ] File sharing: drag-drop, preview (images/PDFs), download
- [ ] Search messages, unread indicators, typing indicators, online status
- [ ] API: POST/GET/PATCH/DELETE /messages, Drizzle: channels, channel_members, messages, message_reactions, threads
- [ ] Socket.io: message delivery, typing, presence

**Dependencies:** Sprint 7 (workspace), Sprint 10 (Socket.io)

**Risk flags:**
- Message ordering with concurrent sends -- need monotonic IDs
- Search across millions of messages requires Typesense optimization

**Testing milestones:**
- [ ] E2E test: create channel, send, thread, search
- [ ] E2E test: @mention triggers notification
- [ ] Load test: 1000 messages in channel, scroll performance
- [ ] Real-time test: instant message delivery

---

#### SPRINT 34 -- Week 34 (2026-12-21 to 2026-12-27)

**Goal:** JAY Chat advanced + JAY Meet recording.

**Deliverables:**
- [ ] Chat advanced: bookmarks, channel categories, notification settings, DND, scheduled messages, slash commands, custom emoji, keyboard shortcuts, incoming webhooks
- [ ] Meet recording: start/stop, indicator, storage (MinIO), processing (MP4), playback, share link, transcript placeholder, auto-delete policy
- [ ] Meet+Cal: join button on events, auto-create meeting, meeting history

**Dependencies:** Sprint 33 (Chat core), Sprint 32 (Meet group calls)

**Testing milestones:**
- [ ] E2E test: record meeting, verify playback
- [ ] E2E test: webhook posts to channel

---

#### SPRINT 35 -- Week 35 (2026-12-28 to 2027-01-03)

**Goal:** JAY Meet -- breakout rooms, virtual backgrounds, whiteboard.

**Deliverables:**
- [ ] Breakout rooms: create (auto/manual), move participants, broadcast, timer, return to main
- [ ] Virtual backgrounds: blur, preset images, custom upload
- [ ] Whiteboard: shared canvas, drawing tools (pen/shapes/text/eraser), real-time collab (Yjs), save as image
- [ ] End-of-meeting summary: duration, attendance log, chat log, recording link, action items

**Dependencies:** Sprint 34 (recording), Sprint 10 (Yjs)

**Testing milestones:**
- [ ] E2E test: breakout rooms, broadcast, return
- [ ] E2E test: whiteboard collaboration (two users draw)

---

#### SPRINT 36 -- Week 36 (2027-01-04 to 2027-01-10)

**Goal:** JAY Meet -- live captions, polling, Q&A, hand raise, reactions.

**Deliverables:**
- [ ] Live captions: Web Speech API, display on video, language selection, toggle per participant
- [ ] Polls: create, launch during meeting, vote, real-time results, anonymous/named, history
- [ ] Q&A: submit, upvote, host mark answered, panel
- [ ] Reactions: emoji on video, quick toolbar (thumbs up/heart/laugh/celebrate/clap), animation
- [ ] Hand raise: raise/lower, host list, lower all, waiting room

**Dependencies:** Sprint 35 (breakout rooms)

**Testing milestones:**
- [ ] E2E test: create and run poll
- [ ] E2E test: Q&A submit, upvote, answer

---

#### SPRINT 37 -- Week 37 (2027-01-11 to 2027-01-17)

**Goal:** JAY Meet -- large meetings (100+), webinar mode, dial-in.

**Deliverables:**
- [ ] Large meetings (up to 100): optimized grid (active speakers only), audio-only mode, bandwidth adaptation, participant limit
- [ ] Webinar mode: panelists vs attendees, Q&A, registration page, analytics, practice session
- [ ] Dial-in: SIP trunk (Twilio), dial-in number, PIN, audio-only participant
- [ ] Meeting analytics: duration trends, engagement, feature usage, CSV export

**Dependencies:** Sprint 36 (meet features)

**Risk flags:**
- **CRITICAL:** 100+ participants requires significant SFU infrastructure -- bandwidth costs high
- Webinar mode is fundamentally different -- may need separate architecture

**Testing milestones:**
- [ ] Load test: 100 participants, verify media quality
- [ ] E2E test: webinar mode -- panelist shares, attendee watches

---

#### SPRINT 38 -- Week 38 (2027-01-18 to 2027-01-24)

**Goal:** Meet & Chat hardening, integration with other apps.

**Deliverables:**
- [ ] Meet+Chat: links auto-expand in Chat, pinned messages in Meet, post-meeting chat in channel
- [ ] Meet+Cal (final): one-click join, reminders (Chat+email), notes on events
- [ ] Chat integrations: bot framework, GitHub/GitLab, Drive/Tasks/Cal notifications
- [ ] Meet accessibility: screen reader, keyboard nav, high contrast
- [ ] Chat accessibility: screen reader, keyboard nav, reduced motion
- [ ] Meet & Chat E2E > 75%, Meet connect < 3s, Chat delivery < 200ms

**Dependencies:** Sprints 31-37 (all Meet & Chat)

**Testing milestones:**
- [ ] Full E2E regression for Meet and Chat
- [ ] Integration E2E: Cal>Meet>Chat>Drive chain
- [ ] Accessibility audit

---

### SUB-PHASE 3B: JAY Forms & JAY Sign (Weeks 39-43)

#### SPRINT 39 -- Week 39 (2027-01-25 to 2027-01-31)

**Goal:** JAY Forms -- form builder, field types, form publishing.

**Deliverables:**
- [ ] /forms page, drag-and-drop form builder, title/description, theme (colors/fonts/header), live preview
- [ ] Field types: short answer, long answer, multiple choice, checkboxes, dropdown, linear scale, date, time, file upload, email, phone, URL, section divider, description text
- [ ] Field settings: required, help text, validation (min/max/regex/number/email), default value, placeholder, conditional logic (show/hide)
- [ ] Layout: all questions, one per page, section-based
- [ ] Publishing: public link, embed iframe, QR code, access control, open/close dates, response limit
- [ ] API: POST/GET/PATCH/DELETE /forms, Drizzle: forms, form_fields, form_responses, form_field_responses

**Dependencies:** Sprint 7 (workspace)

**Testing milestones:**
- [ ] E2E test: build form with all types, publish, submit
- [ ] E2E test: conditional logic show/hide
- [ ] Unit tests for validation rules

---

#### SPRINT 40 -- Week 40 (2027-02-01 to 2027-02-07)

**Goal:** JAY Forms -- response management, analytics, templates.

**Deliverables:**
- [ ] Responses: table view, individual view, filter/search, export CSV/XLSX, delete, email notifications
- [ ] Analytics: summary charts, count over time, completion rate, avg time, source tracking, export
- [ ] 15+ templates: satisfaction survey, event registration, job application, feedback, quiz, order, contact
- [ ] Quiz mode: correct answer, points, auto-grading, score display, answer feedback
- [ ] Collaboration: share for editing, co-editing (Yjs), response viewer permission
- [ ] Drive integration, Forms E2E > 70%

**Dependencies:** Sprint 39 (form builder)

**Testing milestones:**
- [ ] E2E test: quiz auto-grading
- [ ] E2E test: export responses CSV/XLSX
- [ ] Load test: 10K responses, analytics < 2s

---

#### SPRINT 41 -- Week 41 (2027-02-08 to 2027-02-14)

**Goal:** JAY Sign -- document upload, signature fields, signing flow.

**Deliverables:**
- [ ] /sign page, PDF upload, PDF.js rendering, drag-drop signature fields
- [ ] Field types: signature (draw/type/upload), initials, text, date, checkbox, dropdown, radio, company name, title
- [ ] Field properties: required, label, placeholder, font size, validation
- [ ] Recipient assignment per field, signing order (sequential/parallel), CC recipients
- [ ] Sending: add recipients, order, message, expiration, reminder schedule, email request
- [ ] Signing: /sign/:token (no login), document review, fill fields, signature capture, confirm, decline
- [ ] API: POST/GET /sign/documents, POST /sign/:token/sign/decline, Drizzle: sign_documents, sign_recipients, sign_fields, sign_events
- [ ] Audit trail: every action logged (viewed/signed/declined/sent)

**Dependencies:** Sprint 8 (Drive), Sprint 5 (email)

**Risk flags:**
- **CRITICAL:** E-sign legal compliance varies by jurisdiction (eIDAS/ESIGN/UETA). Consult legal counsel before shipping
- PDF field positioning must be pixel-accurate

**Testing milestones:**
- [ ] E2E test: upload PDF, add fields, send, sign, verify
- [ ] E2E test: sequential signing
- [ ] Audit trail test: all actions logged with timestamps/IP

---

#### SPRINT 42 -- Week 42 (2027-02-15 to 2027-02-21)

**Goal:** JAY Sign -- completed documents, templates, security.

**Deliverables:**
- [ ] Completed: signed PDF generation, certificate of completion, download, email to parties, status tracking, search/filter
- [ ] Templates: save as template, library, pre-configured fields, workspace sharing, common templates (NDA, employment, service, lease)
- [ ] Security: encryption at rest, tamper detection (hash), access control, download permissions, expiration, 2FA optional, IP logging, email verification
- [ ] Bulk send: multiple recipients, CSV upload, bulk tracking
- [ ] Webhooks: completed/declined/expired events, HMAC signing
- [ ] Sign+Drive: sign Drive documents, completed to Drive, sign JAY Docs

**Dependencies:** Sprint 41 (signing flow)

**Testing milestones:**
- [ ] E2E test: template save/create/sign
- [ ] Tamper detection test: modify signed PDF, verify hash mismatch
- [ ] Security audit: access controls, encryption
- [ ] Sign E2E > 70%

---

#### SPRINT 43 -- Week 43 (2027-02-22 to 2027-02-28)

**Goal:** Phase 3A hardening -- Meet, Chat, Forms, Sign integration tests.

**Deliverables:**
- [ ] Cross-app integration: Meet>Chat, Cal>Meet, Drive>Sign, Tasks>Meet, Forms>Sheets, Chat>Tasks, Mail>Tasks
- [ ] Performance audit: Meet <3s connect, 25 stable; Chat <200ms, 10K scroll 60fps; Forms 50 fields <1s; Sign 50-page PDF <2s
- [ ] Accessibility audit: Meet, Chat, Forms, Sign
- [ ] Security audit: Sign pen test, Meet pen test, Chat pen test
- [ ] Documentation: user guides, Phase 3A E2E regression complete

**Dependencies:** Sprints 31-42 (all Phase 3A)

**Testing milestones:**
- [ ] Integration E2E: Cal>Meet>Chat>Task>Form>Sign chain
- [ ] Load test: 1000 concurrent users
- [ ] Security penetration test report

---

### SUB-PHASE 3C: Desktop App, Mobile, Enterprise (Weeks 44-52)

#### SPRINT 44 -- Week 44 (2027-03-01 to 2027-03-07)

**Goal:** Desktop app (Electron) -- scaffolding, shell, Drive, Docs.

**Deliverables:**
- [ ] apps/desktop/ Electron: Vite config, main process (window management, auto-updater), preload (secure IPC), context isolation, icon, splash, menu bar, tray
- [ ] Web app integration: load SPA in BrowserView, native file system, drag-drop local files, local preview
- [ ] Auto-updater: silent background, notification, rollback on failure
- [ ] Offline: cached shell, indicator, sync queue
- [ ] Platform-specific: macOS (menu/Touch Bar/dmg), Windows (menu/MSI/taskbar), Linux (AppImage/menu)
- [ ] Code signing all platforms

**Dependencies:** Phase 1+2 complete (web app functional)

**Testing milestones:**
- [ ] E2E test: install, login, open Drive, create document
- [ ] Auto-update test: simulate new version
- [ ] Offline test: disconnect, load, reconnect, sync

---

#### SPRINT 45 -- Week 45 (2027-03-08 to 2027-03-14)

**Goal:** Desktop app -- native integrations, notifications, all apps.

**Deliverables:**
- [ ] Native integrations: notifications, badge on dock/taskbar, file association (.jaydoc/.jaysheet/.jayslide), copy/paste with native apps, native print, spell checking
- [ ] All JAY apps accessible, global shortcuts, quick note from tray, quick compose email
- [ ] Performance: launch <2s cold, <500MB idle, GPU acceleration
- [ ] Settings: auto-start, minimize to tray, notifications, cache, proxy, hardware acceleration
- [ ] Desktop E2E > 60%

**Dependencies:** Sprint 44 (desktop shell)

**Testing milestones:**
- [ ] E2E test: native notification opens app
- [ ] E2E test: open .jaydoc in Docs
- [ ] Memory test: 24 hours, no leaks

---

#### SPRINT 46 -- Week 46 (2027-03-15 to 2027-03-21)

**Goal:** Mobile app (React Native) -- scaffolding, auth, Drive, Docs viewer.

**Deliverables:**
- [ ] React Native setup (Expo): project structure, navigation (React Navigation), Zustand shared, API client shared, mobile design system
- [ ] Auth: login/register/forgot, biometric (Face ID/Touch ID/fingerprint), persistent session, push notification registration
- [ ] Drive mobile: file/folder list, navigation, search, upload (photo/doc/scan), download, share, star, recent
- [ ] Docs mobile: list, viewer (read-only MVP), search, basic creation, sharing
- [ ] App shell: bottom tabs, app switcher, global search, user menu, offline indicator
- [ ] Push notifications: FCM (Android), APNS (iOS), types (file shared/comment/mention/meeting/task)

**Dependencies:** Phase 1+2 complete (API stable)

**Risk flags:**
- **CRITICAL:** Mobile doubles testing surface (iOS + Android + multiple versions)
- React Native performance for complex apps (Sheets/Slides) is challenging

**Testing milestones:**
- [ ] E2E test: login, browse Drive, open document (iOS + Android)
- [ ] Biometric auth test
- [ ] Push notification test

---

#### SPRINT 47 -- Week 47 (2027-03-22 to 2027-03-28)

**Goal:** Mobile app -- Sheets viewer, Chat, Cal, Mail.

**Deliverables:**
- [ ] Sheets mobile: list, viewer (read-only), tap to view value/formula, basic cell editing
- [ ] Chat mobile: channels, DMs, send/receive (real-time), threads, file sharing, push for mentions, typing
- [ ] Cal mobile: day/week/month views, event list, create/edit, reminders (push), join meeting, RSVP
- [ ] Mail mobile: inbox, list, view (HTML), compose, reply/all/forward, attachments, push, swipe actions
- [ ] Notes mobile: list, view/edit, search, offline editing
- [ ] Settings: account, notifications, theme (light/dark/system), storage, about

**Dependencies:** Sprint 46 (mobile shell)

**Testing milestones:**
- [ ] E2E test: Chat send/receive real-time (both platforms)
- [ ] E2E test: Mail compose/send/receive (both platforms)
- [ ] E2E test: Cal create event, reminder notification (both platforms)

---

#### SPRINT 48 -- Week 48 (2027-03-29 to 2027-04-04)

**Goal:** Mobile app -- Meet, Tasks, polish, app store prep.

**Deliverables:**
- [ ] Meet mobile: join, audio/video controls, screen share (mobile), in-meeting chat, participant list, leave, notifications
- [ ] Tasks mobile: project list, Kanban, list view, create/edit, comments, push updates
- [ ] Polish: haptic feedback, pull-to-refresh, swipe gestures, share sheet, deep links, widgets, app icon badges
- [ ] App store prep: screenshots, descriptions, privacy policy, review submission, TestFlight/Internal Testing, metadata, Sentry mobile, analytics

**Dependencies:** Sprints 46-47 (mobile core)

**Testing milestones:**
- [ ] E2E test: Meet join/mute/leave (both platforms)
- [ ] App store readiness checklist
- [ ] Crash-free session rate > 99%

---

#### SPRINT 49 -- Week 49 (2027-04-05 to 2027-04-11)

**Goal:** Enterprise features -- SSO, SCIM, audit logs, admin console.

**Deliverables:**
- [ ] SSO (SAML 2.0 + OIDC): IdP config (Okta/Azure AD/OneLogin/Google), SSO login, JIT provisioning, SSO enforcement, API
- [ ] SCIM 2.0: user provisioning (create/update/deactivate), group provisioning, /scim/v2/Users, /scim/v2/Groups, IdP sync
- [ ] Admin console: /admin dashboard, user management (list/search/suspend/delete/impersonate), workspace management, device management, security settings (password policy/2FA/session timeout), audit log viewer, usage reports, API key management
- [ ] Audit logging: every sensitive action logged, retention policy (min 1 year), export
- [ ] Data residency: region choice (US/EU/APAC), all data in region, region-specific endpoints

**Dependencies:** Sprint 5 (auth), Sprint 7 (workspace)

**Testing milestones:**
- [ ] E2E test: SSO with Okta, Azure AD
- [ ] E2E test: SCIM user provisioning
- [ ] Audit log test: logged, searchable, exportable

---

#### SPRINT 50 -- Week 50 (2027-04-12 to 2027-04-18)

**Goal:** Enterprise features -- advanced admin, compliance, API.

**Deliverables:**
- [ ] Advanced admin: custom roles/permissions, organization units, bulk user CSV import, user deactivation (preserve data), workspace transfer, domain verification, custom branding
- [ ] Compliance: GDPR (data export, deletion, consent), CCPA (do-not-sell), SOC 2 readiness, data processing agreement, subprocessor list, security questionnaire
- [ ] Public API: OpenAPI docs, versioning, rate limiting per key, API key management, webhooks, TypeScript SDK, playground, changelog
- [ ] Enterprise billing: annual, invoice-based (PO/NET 30), per-seat vs unlimited, usage add-ons, custom quotes, SSO billing portal

**Dependencies:** Sprint 49 (SSO, SCIM, admin)

**Risk flags:**
- GDPR data export is complex (data spans multiple services/DBs/storage)
- SOC 2 audit takes 3-6 months and costs $20-50K -- start early

**Testing milestones:**
- [ ] GDPR data export test: all data included
- [ ] GDPR deletion test: all data purged
- [ ] API rate limiting test: 429 response

---

#### SPRINT 51 -- Week 51 (2027-04-19 to 2027-04-25)

**Goal:** Self-hosted deployment -- Docker, documentation, migration tools.

**Deliverables:**
- [ ] Docker Compose production: all services (api/realtime/search/mail-worker/meet), PostgreSQL/Redis/Typesense/MinIO persistent volumes, coturn, reverse proxy (Traefik/Caddy), SSL (Let's Encrypt), health checks, resource limits
- [ ] Deployment docs: prerequisites, installation guide, .env reference, backup/restore, upgrade, troubleshooting, performance tuning, security hardening
- [ ] Migration tools: Google Workspace (Drive/Gmail/Cal/Contacts), Microsoft 365 (OneDrive/Outlook/Cal/Teams partial), progress tracking, error handling/retry
- [ ] License management: key validation, feature tier enforcement, renewal, offline activation
- [ ] Monitoring: Grafana dashboards, alerting (email/Slack/PagerDuty), log aggregation (Loki/ELK), distributed tracing (Jaeger)

**Dependencies:** All prior sprints (complete product)

**Testing milestones:**
- [ ] E2E test: fresh Docker Compose install, all healthy
- [ ] Migration test: Google Workspace data integrity
- [ ] Backup/restore test: data integrity
- [ ] Load test: self-hosted, 100 concurrent users

---

#### SPRINT 52 -- Week 52 (2027-04-26 to 2027-05-02)

**Goal:** Launch readiness -- final polish, security audit, documentation, go-live.

**Deliverables:**
- [ ] Security audit: third-party pen test, dependency vulnerability scan, CSP/CORS/CSRF, XSS/SQLi/SSRF, rate limiting, auth bypass, encryption verification
- [ ] Performance audit: all apps UI < 200ms, API p95 < 100ms, WebSocket < 200ms, DB query optimization, CDN, image optimization, bundle size audit
- [ ] Documentation: user docs (all 12 apps), admin docs, API docs, deployment guide, migration guide, FAQ, changelog, status page
- [ ] Marketing site: landing page, pricing, feature comparison (vs Google/Microsoft), security page, blog, contact form
- [ ] Launch checklist: all critical bugs resolved, E2E passing, load test documented, security audit passed, docs reviewed, support trained, incident response plan, rollback plan, go/no-go decision

**Dependencies:** All prior sprints (complete product)

**Testing milestones:**
- [ ] Full regression suite (all apps, all features)
- [ ] Final load test: 5000 concurrent users
- [ ] Final security pen test report
- [ ] Final accessibility audit (WCAG 2.1 AA)

---

## 5. GATE CRITERIA

### GATE 1: Phase 1 to Phase 2 (End of Week 13)

| # | Criteria | Measurement | Target |
|---|---|---|---|
| G1.1 | Design system test coverage | Vitest coverage report | >= 80% |
| G1.2 | Auth flow E2E tests | Playwright test suite | All 6 flows pass |
| G1.3 | Drive file operations E2E | Upload, download, share, delete, restore | All pass |
| G1.4 | Docs real-time collab | 2 users edit same doc, convergence | Passes 10/10 runs |
| G1.5 | API response time | 100 concurrent users, p95 latency | < 100ms |
| G1.6 | UI response time | Click to render | < 200ms |
| G1.7 | Lighthouse scores | Drive, Docs, Notes pages | >= 90 all categories |
| G1.8 | Zero P0/P1 bugs | Bug tracker | 0 open |
| G1.9 | TypeScript strict mode | tsc --noEmit all packages | 0 errors |
| G1.10 | Docker Compose up | Clean machine docker compose up | All services healthy |
| G1.11 | Global search | Search across docs, files, notes | Returns correct results |
| G1.12 | Billing checkout | Stripe test mode | Payment processes |

**Gate decision:** If >= 10 of 12 criteria met, proceed to Phase 2. If < 10, extend Phase 1 by 2 weeks.

---

### GATE 2: Phase 2 to Phase 3 (End of Week 30)

| # | Criteria | Measurement | Target |
|---|---|---|---|
| G2.1 | Sheets formula engine | Unit tests for 80+ functions | >= 95% pass |
| G2.2 | Sheets performance | 10,000 cells, scroll FPS | >= 55fps |
| G2.3 | Sheets import/export | .xlsx round-trip (10 files) | >= 90% fidelity |
| G2.4 | Slides presenter | Full presentation with transitions | No crashes |
| G2.5 | Slides import/export | .pptx round-trip (5 files) | >= 75% fidelity |
| G2.6 | Calendar recurring | Complex recurrence patterns | All expand correctly |
| G2.7 | Mail send/receive | Gmail/Outlook, verify received | Passes |
| G2.8 | Mail offline | Compose offline, reconnect, sent | Passes |
| G2.9 | Tasks Kanban+Gantt | Create project, switch views, consistent | Passes |
| G2.10 | Cross-app integration | Drive>Doc>Task>Cal>Mail chain | All links functional |
| G2.11 | API test coverage | Unit + integration tests | >= 80% |
| G2.12 | Zero P0/P1 bugs | Bug tracker | 0 open |
| G2.13 | Load test | 500 concurrent users | < 1% error rate |
| G2.14 | Accessibility | WCAG 2.1 AA Phase 2 pages | >= 95% pass |
| G2.15 | Documentation | User guides for 5 Phase 2 apps | Complete |

**Gate decision:** If >= 13 of 15 criteria met, proceed to Phase 3. If < 13, extend Phase 2 by 3 weeks.

---

### GATE 3: Phase 3 to Launch (End of Week 52)

| # | Criteria | Measurement | Target |
|---|---|---|---|
| G3.1 | Meet call quality | 25-participant call, MOS score | >= 4.0 |
| G3.2 | Chat delivery | Send to receive latency | < 200ms p95 |
| G3.3 | Forms analytics | 10K responses, analytics load | < 2s |
| G3.4 | Sign legal compliance | Legal counsel review | Approved |
| G3.5 | Desktop app | Install, login, all apps | Passes macOS/Win/Linux |
| G3.6 | Mobile app | Core flows iOS + Android | iOS 15+, Android 12+ |
| G3.7 | SSO integration | Okta + Azure AD login | Passes |
| G3.8 | SCIM provisioning | User create/update/deactivate | Passes |
| G3.9 | Self-hosted deploy | Docker Compose clean Ubuntu | All services healthy |
| G3.10 | Security audit | Third-party pen test | 0 critical, 0 high |
| G3.11 | Performance targets | UI < 200ms, API p95 < 100ms | Met |
| G3.12 | Load test | 5000 concurrent users | < 0.1% error rate |
| G3.13 | Documentation complete | All user/admin/API/deploy docs | Reviewed and approved |
| G3.14 | Support readiness | Support team trained, runbooks | Confirmed |
| G3.15 | Rollback plan | Tested rollback procedure | Documented and tested |
| G3.16 | GDPR compliance | Data export + deletion | Verified |
| G3.17 | All E2E passing | Full regression suite | 100% pass |

**Gate decision:** If >= 15 of 17 criteria met, GO for launch. If 12-14, soft launch (beta). If < 12, delay launch by 4 weeks.

---

## 6. PARALLEL WORKSTREAM TRACKING

### FRONTEND TEAM (5-6 engineers)

| Sprint Range | Lead Engineer | Supporting | Focus Area |
|---|---|---|---|
| 1-4 | Design System Lead | 2 FE devs | tokens.css, 30+ components, Storybook |
| 5-7 | Platform Lead | 2 FE devs | Auth UI, workspace shell, app switcher |
| 8-9 | Drive Lead | 1 FE dev | File browser, upload, context menus |
| 10 | Real-time Lead | 1 FE dev | Yjs-WebSocket client, presence |
| 11-13 | Docs Lead | 1 FE dev | ProseMirror editor, version history, Notes |
| 14-19 | Sheets Lead | 2 FE devs | Canvas renderer, formula engine, 80+ functions |
| 20-23 | Slides Lead | 2 FE devs | Fabric.js editor, presenter, animations |
| 24-25 | Cal Lead | 1 FE dev | Calendar views, recurring events, invites |
| 26-27 | Mail Lead | 1 FE dev | Three-panel inbox, compose, filters |
| 28-29 | Tasks Lead | 1 FE dev | Kanban, Gantt, reporting |
| 30 | Integration Lead | 1 FE dev | Cross-app links, performance audit |
| 31-38 | Meet/Chat Lead | 2 FE devs | WebRTC UI, messaging, recording |
| 39-43 | Forms/Sign Lead | 2 FE devs | Form builder, PDF signing flow |
| 44-45 | Desktop Lead | 1 FE dev | Electron app, native integrations |
| 46-48 | Mobile Lead | 2 FE devs | React Native apps (iOS + Android) |
| 49-52 | Enterprise Lead | 2 FE devs | Admin console, SSO UI, self-hosted |

### BACKEND TEAM (4-5 engineers)

| Sprint Range | Lead Engineer | Supporting | Focus Area |
|---|---|---|---|
| 1-2 | Platform Lead | 1 BE dev | Monorepo, types, schema, migrations |
| 3-4 | Platform Lead | - | (supports FE design system testing) |
| 5-7 | Auth Lead | 2 BE devs | JWT, RBAC, workspace API, invitations |
| 8-9 | Drive Lead | 1 BE dev | File CRUD, MinIO, quotas, sharing |
| 10 | Real-time Lead | 1 BE dev | Socket.io server, Yjs persistence, Redis |
| 11-13 | Docs Lead | 1 BE dev | Doc API, comments, versioning, search sync |
| 14-17 | Sheets Lead | 1 BE dev | Sheet API, batch updates, collab endpoints |
| 18-19 | Sheets Lead | - | Performance, offline sync |
| 20-22 | Slides Lead | 1 BE dev | Slide API, collab endpoints |
| 24-25 | Cal Lead | 1 BE dev | Event API, recurring expansion, ICS |
| 26-27 | Mail Lead | 1 BE dev | IMAP/SMTP worker, sync, filters |
| 28-29 | Tasks Lead | 1 BE dev | Project/task API, real-time updates |
| 30 | Integration Lead | 1 BE dev | Cross-app API, load testing |
| 31-38 | Meet/Chat Lead | 2 BE devs | mediasoup SFU, message API, recording |
| 39-43 | Forms/Sign Lead | 1 BE dev | Form/response API, PDF signing API |
| 49-50 | Enterprise Lead | 2 BE devs | SAML/SCIM, audit logging, public API |
| 51-52 | DevOps Lead | 1 BE dev | Migration tools, Docker, monitoring |

### DEVOPS / INFRASTRUCTURE TEAM (2-3 engineers)

| Sprint Range | Lead Engineer | Supporting | Focus Area |
|---|---|---|---|
| 1 | DevOps Lead | - | Docker Compose skeleton, CI/CD pipeline |
| 2 | DevOps Lead | 1 Infra dev | PostgreSQL/Redis setup, migration tooling |
| 3-4 | DevOps Lead | - | Storybook hosting, CDN config |
| 5-7 | DevOps Lead | 1 Infra dev | Email service (Mailhog dev, SES prod), rate limiting infra |
| 8-9 | DevOps Lead | 1 Infra dev | MinIO setup, storage quota enforcement |
| 10 | Real-time Lead | 1 Infra dev | Socket.io Redis adapter, horizontal scaling |
| 11-13 | DevOps Lead | 1 Infra dev | Typesense setup, sync service, Stripe integration |
| 14-30 | DevOps Lead | - | Ongoing: monitoring setup, OpenTelemetry, Sentry |
| 31-32 | Infra Lead | 1 Infra dev | mediasoup SFU deployment, coturn TURN server |
| 33-38 | Infra Lead | 1 Infra dev | Message queue (BullMQ), recording storage |
| 39-43 | Infra Lead | - | PDF processing infrastructure |
| 44-45 | DevOps Lead | 1 Infra dev | Electron code signing, auto-update server |
| 46-48 | DevOps Lead | 1 Infra dev | Push notification setup (FCM/APNS), app store CI |
| 49-50 | Enterprise Lead | 1 Infra dev | SSO infrastructure, SCIM endpoints, data residency |
| 51 | DevOps Lead | 2 Infra devs | Production Docker Compose, Grafana, backup/restore |
| 52 | DevOps Lead | 1 Infra dev | CDN optimization, load test infrastructure |

### QA / TESTING TEAM (2 engineers)

| Sprint Range | Lead QA | Supporting | Focus Area |
|---|---|---|---|
| 1-2 | QA Lead | - | Test infrastructure setup, Vitest/Playwright config |
| 3-4 | QA Lead | 1 QA dev | Design system tests: visual regression, keyboard, ARIA |
| 5-7 | QA Lead | 1 QA dev | Auth E2E flows, RBAC tests, multi-tenancy isolation |
| 8-9 | QA Lead | 1 QA dev | Drive E2E: upload/download/share/delete/restore |
| 10 | QA Lead | 1 QA dev | Real-time collab load tests, convergence tests |
| 11-13 | QA Lead | 1 QA dev | Docs collab E2E, import/export tests, search E2E |
| 14-19 | QA Lead | 1 QA dev | Sheets: formula tests (100+ cases), perf benchmarks, cross-browser |
| 20-23 | QA Lead | 1 QA dev | Slides: presenter mode, import/export fidelity, accessibility |
| 24-25 | QA Lead | 1 QA dev | Calendar: recurring expansion, ICS, invites E2E |
| 26-27 | QA Lead | 1 QA dev | Mail: IMAP integration, filters, offline mode |
| 28-29 | QA Lead | 1 QA dev | Tasks: Kanban+Gantt consistency, real-time updates |
| 30 | QA Lead | 1 QA dev | Phase 2 regression suite, load test (500 users), Lighthouse |
| 31-38 | QA Lead | 1 QA dev | Meet/Chat E2E, media quality tests, message delivery latency |
| 39-43 | QA Lead | 1 QA dev | Forms/Sign E2E, security pen test coordination |
| 44-48 | QA Lead | 1 QA dev | Desktop/mobile E2E (both platforms), app store prep |
| 49-50 | QA Lead | 1 QA dev | SSO/SCIM E2E, GDPR compliance tests, API rate limiting |
| 51 | QA Lead | 1 QA dev | Self-hosted deployment test, migration tool test |
| 52 | QA Lead | 1 QA dev | Full regression suite, load test (5000 users), final pen test |

---

## 7. CRITICAL PATH ANALYSIS

The critical path is the sequence of dependent sprints where any delay cascades to the entire project. Items on the critical path have NO parallel alternatives.

### PRIMARY CRITICAL PATH (blocks everything downstream)

```
Sprint 1 (Monorepo)
  -> Sprint 2 (Types/Schema)
    -> Sprint 5 (Auth API)
      -> Sprint 6 (Auth UI)
        -> Sprint 7 (Platform Shell)
          -> Sprint 8 (Drive Backend)
            -> Sprint 9 (Drive Frontend)
              -> Sprint 10 (Real-time Infra)
                -> Sprint 11 (Docs Editor)
                  -> Sprint 14 (Sheets Engine)
                    -> Sprint 15-19 (Sheets completion)
                  -> Sprint 20 (Slides Core)
                    -> Sprint 21-23 (Slides completion)
                -> Sprint 31 (Meet WebRTC)
                  -> Sprint 32-37 (Meet completion)
                -> Sprint 33 (Chat Core)
                  -> Sprint 34-38 (Chat completion)
            -> Sprint 26 (Mail Core)
              -> Sprint 27 (Mail Advanced)
          -> Sprint 24 (Calendar Core)
            -> Sprint 25 (Calendar Advanced)
          -> Sprint 28 (Tasks Core)
            -> Sprint 29 (Tasks Advanced)
        -> Sprint 39 (Forms)
          -> Sprint 40 (Forms Advanced)
        -> Sprint 41 (Sign)
          -> Sprint 42 (Sign Advanced)
      -> Sprint 49 (SSO/SCIM)
        -> Sprint 50 (Compliance/Public API)
      -> Sprint 51 (Self-hosted)
        -> Sprint 52 (Launch)
```

### TOP 5 CRITICAL PATH ITEMS (if they slip, everything slips)

| Rank | Sprint | Item | Why Critical | Slack |
|---|---|---|---|---|
| 1 | Sprint 10 | Real-time Infrastructure (Yjs + Socket.io) | Powers Docs, Sheets, Slides, Notes, Chat, Forms collab. No alternative. | 0 weeks |
| 2 | Sprint 14 | Sheets Canvas Renderer | Most complex component. 6-week investment. Blocks all Sheets work. | 0 weeks |
| 3 | Sprint 31 | Meet WebRTC Setup | Infrastructure-heavy. 8-week investment. Powers all video features. | 0 weeks |
| 4 | Sprint 8 | Drive Backend + MinIO | Every file operation depends on it. Blocks Drive, Docs, Sheets, Slides. | 0 weeks |
| 5 | Sprint 5 | Auth API | Every authenticated feature depends on it. Blocks all user-facing work. | 0 weeks |

### NON-CRITICAL PATH ITEMS (can be delayed without blocking launch)

| Item | Sprint | Can slip by | Notes |
|---|---|---|---|
| JAY Notes advanced features | Sprint 12 | 2 weeks | Can ship basic notes, defer advanced features |
| Sheets accessibility polish | Sprint 19 | 1 week | Can ship after launch as patch |
| Slide animations | Sprint 22 | 2 weeks | Nice-to-have, not essential |
| Calendar holiday import | Sprint 25 | 2 weeks | Can be added post-launch |
| Mail templates/canned responses | Sprint 27 | 2 weeks | Can be added post-launch |
| Tasks reporting/burndown | Sprint 29 | 2 weeks | Kanban+Gantt are sufficient for v1 |
| Meet virtual backgrounds | Sprint 35 | 3 weeks | Performance-sensitive, can defer |
| Forms quiz mode | Sprint 40 | 2 weeks | Basic forms are sufficient for v1 |
| Sign bulk send | Sprint 42 | 2 weeks | Single send is sufficient for v1 |
| Desktop app polish | Sprint 45 | 2 weeks | Shell + core apps are sufficient for v1 |
| Mobile app polish | Sprint 48 | 2 weeks | Core apps are sufficient for v1 |
| Meeting analytics | Sprint 37 | 2 weeks | Can be added post-launch |

---

## 8. QUICK WINS

These items can ship early (within the first 8 weeks) to validate product direction, gather user feedback, and build momentum.

### Quick Win 1: Design System Component Gallery (Week 4)

**What:** Ship a live, browsable component gallery at /storybook showing all 30+ design system components with interactive props.

**Why it matters:**
- Validates design system decisions with stakeholders immediately
- Can be shown to early beta users for feedback
- Proves the design system works before building apps on it
- Low risk, high visual impact

**Effort:** 1 week (part of Sprint 4)

---

### Quick Win 2: Authentication + Workspace Setup (Week 7)

**What:** Working registration, login, workspace creation, and invitation flow -- fully functional.

**Why it matters:**
- First "real product" experience users can try
- Validates the multi-tenant architecture
- Can onboard first beta testers by Week 8
- Foundation for all future features

**Effort:** 3 weeks (Sprints 5-7)

---

### Quick Win 3: JAY Drive (Week 9)

**What:** Fully functional file storage with upload, download, folder navigation, sharing, and trash.

**Why it matters:**
- Immediately useful to beta testers
- Validates the storage infrastructure (MinIO)
- Competes directly with Google Drive/OneDrive core functionality
- High perceived value for early users

**Effort:** 2 weeks (Sprints 8-9)

---

### Quick Win 4: JAY Docs Basic Editor (Week 11)

**What:** Create, edit, and share documents with real-time collaboration. Basic formatting (bold, italic, headings, lists, links).

**Why it matters:**
- Proves the real-time collaboration stack works (Yjs + Socket.io)
- First collaborative editing experience
- Can be shown to investors as "the killer feature"
- Directly competes with Google Docs

**Effort:** 2 weeks (Sprints 10-11)

---

### Quick Win 5: JAY Notes (Week 12)

**What:** Create, edit, tag, and search notes with the same ProseMirror editor as Docs.

**Why it matters:**
- Reuses the proven Docs editor with minimal extra work
- Notion-style notes are a popular standalone product
- Can attract users who want a lightweight note-taking tool
- Low additional effort after Docs is built

**Effort:** 1 week (Sprint 12)

---

### Quick Win 6: Global Search (Week 13)

**What:** Cmd+K opens a search bar that searches across documents, notes, and files with fuzzy matching.

**Why it matters:**
- Highly visible feature that makes the suite feel integrated
- Demonstrates cross-app connectivity
- Users love fast, unified search
- Typesense integration is straightforward

**Effort:** 1 week (part of Sprint 13)

---

### Quick Win 7: JAY Calendar Basic (Week 24)

**What:** Create, view, and manage events with day/week/month views.

**Why it matters:**
- Calendar is a daily-use product -- gets users to log in every day
- Relatively straightforward to build (no real-time collab needed)
- Can be shipped as standalone feature
- Directly competes with Google Calendar

**Effort:** 2 weeks (Sprint 24, parallel with Sheets)

---

### Quick Win Priority Order

| Priority | Quick Win | Target Week | Beta Ready? |
|---|---|---|---|
| 1 | Design System Gallery | Week 4 | Yes (internal) |
| 2 | Auth + Workspace | Week 7 | Yes (internal) |
| 3 | JAY Drive | Week 9 | Yes (closed beta) |
| 4 | JAY Docs Basic | Week 11 | Yes (closed beta) |
| 5 | JAY Notes | Week 12 | Yes (closed beta) |
| 6 | Global Search | Week 13 | Yes (closed beta) |
| 7 | JAY Calendar Basic | Week 24 | Yes (open beta) |

---

## 9. TECHNICAL RISK REGISTER

| # | Risk | Probability | Impact | Severity | Mitigation Strategy | Owner | Trigger |
|---|---|---|---|---|---|---|---|
| R1 | Yjs + PostgreSQL persistence causes data loss or corruption | Medium | Critical | HIGH | Implement dual-write: Yjs updates to both PostgreSQL and Redis. Create automatic snapshots every 5 minutes. Build verification tool that compares Yjs state with snapshot. | Real-time Lead | Any convergence test fails 2/3 times |
| R2 | Canvas renderer cannot achieve 60fps with large spreadsheets | High | Critical | HIGH | Prototype canvas renderer in Sprint 1 (2 days). If < 60fps with 10,000 cells, pivot to virtualized HTML table approach immediately. Have fallback renderer ready. | Sheets Lead | Sprint 14 prototype benchmark fails |
| R3 | mediasoup SFU deployment fails on production infrastructure | Medium | Critical | HIGH | Start mediasoup prototype in Sprint 1 (1 day). Test on same infrastructure stack as production. Have WebRTC mesh fallback for < 4 participants if SFU fails. | Meet Lead | Sprint 31 SFU cannot handle 4 participants |
| R4 | IMAP integration breaks with major email providers | High | High | HIGH | Test with Gmail, Outlook, Yahoo in Sprint 26. Use IMAP library with active maintenance. Implement provider-specific workarrows in config. Have web-based OAuth flow for providers that block IMAP. | Mail Lead | Any of 3 major providers fail connection test |
| R5 | .xlsx/.pptx import quality is too poor for user acceptance | High | High | HIGH | Set expectations early: 80% fidelity target, not 100%. Build import quality checker that flags incompatible elements. Provide clear documentation of supported features. Consider using commercial library (Aspose) if open-source quality is insufficient. | Sheets/Slides Lead | Round-trip test shows < 70% fidelity |
| R6 | Multi-tenant data isolation bug leaks data between workspaces | Low | Critical | HIGH | Every database query MUST include workspace_id. Use Drizzle middleware that automatically scopes queries. Write comprehensive multi-tenancy tests in Sprint 7. Conduct security audit at every gate. | Auth Lead | Any test shows cross-workspace data access |
| R7 | WebSocket scaling fails beyond 1000 concurrent connections | Medium | High | HIGH | Use Redis adapter for Socket.io from day one. Load test at Sprint 10 with 1000 connections. Implement connection pooling and backpressure. Have HTTP long-polling fallback. | Real-time Lead | Load test at 1000 connections shows > 10% failure |
| R8 | Mobile app (React Native) cannot match web app performance | High | Medium | MEDIUM | Scope mobile to read-only + basic editing for v1. Use React Native Web for shared components. Defer Sheets/Slides mobile to v2. Focus mobile on Drive, Docs viewer, Chat, Cal, Mail. | Mobile Lead | React Native prototype shows > 2s load time |
| R9 | Typesense sync lag causes stale search results (> 5s delay) | Medium | Medium | MEDIUM | Use PostgreSQL logical replication (WAL) instead of polling for near-real-time sync. Implement client-side search cache. Add "searching..." indicator for queries during sync. | Search Lead | Sync latency consistently > 3s in testing |
| R10 | E-sign legal compliance fails in target jurisdictions | Low | Critical | HIGH | Engage legal counsel in Sprint 38 (before Sign development). Implement jurisdiction-specific compliance features. Use qualified electronic signatures (QES) for EU markets. Partner with existing e-sign provider (DocuSign API) as fallback. | Sign Lead | Legal counsel identifies compliance gap |

### Risk Heat Map

```
Impact
  High |  R1   R3   R6
       |  R2   R4   R5
Medium |  R7        R8
       |        R9
  Low  |              R10
       +------------------------
        Low   Medium   High   Probability
```

---

## 10. MILESTONE TABLE

### Demo-Ready Dates for Investors / Stakeholders

| # | Milestone | Target Date | Sprint | Demo Audience | What Gets Demoed | Success Criteria |
|---|---|---|---|---|---|---|
| M1 | **Foundation Demo** | 2026-05-31 | Sprint 4 | Internal team, advisors | Design system component gallery, dark mode toggle, keyboard navigation | 30+ components demoed, zero visual regressions |
| M2 | **Auth + Workspace Demo** | 2026-06-21 | Sprint 7 | Internal team, advisors | Register, login, create workspace, invite member, switch between apps | Full auth flow in < 30 seconds |
| M3 | **Drive + Docs Beta** | 2026-07-19 | Sprint 11 | Closed beta users (10-20) | Upload files, create document, real-time collaboration (2 users) | Two users edit same doc, no conflicts |
| M4 | **Phase 1 Launch** | 2026-08-02 | Sprint 13 | Closed beta users (50-100) | Drive, Docs, Notes, global search, billing checkout | All features functional, Lighthouse > 90 |
| M5 | **Sheets Alpha** | 2026-08-30 | Sprint 17 | Internal team, advisors | Create spreadsheet, enter formulas, real-time collab, import .xlsx | SUM/VLOOKUP work, 2 users edit simultaneously |
| M6 | **Office Core Demo** | 2026-09-13 | Sprint 19 | Investors, advisors | Sheets + Slides side-by-side with Google Workspace | Sheets handles 10K cells, Slides presents smoothly |
| M7 | **Calendar + Tasks Demo** | 2026-10-25 | Sprint 25 | Closed beta users | Calendar with recurring events, Tasks with Kanban board | Create event, RSVP, create project, drag tasks |
| M8 | **Mail + Tasks Demo** | 2026-11-08 | Sprint 27 | Closed beta users | Send/receive email, filters, Tasks with Gantt view | Email delivered, filter applied, Gantt renders |
| M9 | **Phase 2 Launch** | 2026-11-29 | Sprint 30 | Open beta users (500+) | All 7 apps (Drive, Docs, Sheets, Slides, Cal, Mail, Tasks) | All apps functional, cross-app integration works |
| M10 | **Meet Alpha** | 2026-12-13 | Sprint 32 | Internal team | 1:1 video call, screen sharing, 4-person group call | Call connects, audio/video clear, screen share works |
| M11 | **Chat Beta** | 2026-12-20 | Sprint 33 | Closed beta users | Channels, DMs, threading, file sharing, @mentions | Message delivery < 200ms, threads work |
| M12 | **Meet + Chat Demo** | 2027-01-03 | Sprint 35 | Investors | Group video call (10 people), breakout rooms, Chat with threads | 10-person call stable, breakout rooms functional |
| M13 | **Forms + Sign Beta** | 2027-01-31 | Sprint 39 | Closed beta users | Build form, publish, collect responses; upload PDF, send for signature | Form collects responses, PDF signed successfully |
| M14 | **Phase 3A Launch** | 2027-02-28 | Sprint 43 | Open beta users | All 10 apps (previous 7 + Meet, Chat, Forms, Sign) | All apps functional, integrations working |
| M15 | **Desktop App Demo** | 2027-03-14 | Sprint 45 | Investors | Install desktop app, native notifications, file associations | App launches < 2s, all apps accessible |
| M16 | **Mobile App Beta** | 2027-03-28 | Sprint 47 | Closed beta (TestFlight/Play Store Internal) | Drive + Docs + Chat on iOS and Android | Apps functional on both platforms |
| M17 | **Enterprise Features Demo** | 2027-04-18 | Sprint 50 | Enterprise prospects | SSO login (Okta), admin console, audit log viewer, API playground | SSO works, admin dashboard functional |
| M18 | **Self-Hosted Demo** | 2027-04-25 | Sprint 51 | Enterprise prospects | Docker Compose install on clean server, all services running | docker compose up works, all healthy |
| M19 | **LAUNCH** | 2027-05-02 | Sprint 52 | Public | All 12 apps + Desktop + Mobile + Enterprise + Self-hosted | All gate criteria met, security audit passed |

### Revenue Milestones

| # | Milestone | Target Date | Metric |
|---|---|---|---|
| R1 | First paying customer | 2026-08-15 | Stripe checkout successful |
| R2 | 100 active workspaces | 2026-10-01 | Workspace count in database |
| R3 | $10K MRR | 2026-12-01 | Stripe dashboard |
| R4 | 1,000 active workspaces | 2027-01-01 | Workspace count |
| R5 | $50K MRR | 2027-03-01 | Stripe dashboard |
| R6 | First enterprise contract | 2027-04-01 | Signed contract |
| R7 | $100K MRR | 2027-05-01 | Stripe dashboard |

---

*End of JAY Office 12-Month Roadmap Document.*
*Last updated: 2026-05-04*
*Document version: 1.0*

