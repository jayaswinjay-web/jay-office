# JAY Office API Reference

Complete REST API documentation for JAY Office.

Base URL: `http://localhost:3000/api`

All endpoints return JSON responses with appropriate HTTP status codes.

## Authentication

All API requests (except auth endpoints) require a Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**

```typescript
{
  email: string
  password: string
  name: string
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    user: {
      id: string
      email: string
      name: string
      createdAt: string
    }
    accessToken: string
    refreshToken: string
  }
}
```

---

### POST /api/auth/login

Authenticate with email and password.

**Request Body:**

```typescript
{
  email: string
  password: string
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    user: {
      id: string
      email: string
      name: string
    }
    accessToken: string
    refreshToken: string
  }
}
```

---

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**

```typescript
{
  refreshToken: string
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
  }
}
```

---

### POST /api/auth/logout

Invalidate refresh token (logout).

**Request Body:**

```typescript
{
  refreshToken: string
}
```

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

### POST /api/auth/magic-link

Send magic link for passwordless login.

**Request Body:**

```typescript
{
  email: string
}
```

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

### POST /api/auth/verify-email

Verify email with token from magic link.

**Request Body:**

```typescript
{
  token: string
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    user: {
      id: string
      email: string
      name: string
    }
    accessToken: string
    refreshToken: string
  }
}
```

---

### POST /api/auth/2fa/setup

Setup two-factor authentication.

**Request Body:** None

**Response:**

```typescript
{
  success: boolean
  data: {
    secret: string
    qrCode: string
  }
}
```

---

### POST /api/auth/2fa/verify

Verify 2FA token.

**Request Body:**

```typescript
{
  token: string
}
```

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

### GET /api/auth/sessions

List active sessions for current user.

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    deviceInfo: string
    ipAddress: string
    lastActive: string
    createdAt: string
  }>
}
```

---

### DELETE /api/auth/sessions/:id

Revoke a specific session.

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

## Files Endpoints

### GET /api/files

List files with pagination and filtering.

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `folderId` (string, optional)
- `search` (string, optional)

**Response:**

```typescript
{
  success: boolean
  data: {
    files: Array<{
      id: string
      name: string
      size: number
      mimeType: string
      url: string
      folderId: string | null
      createdAt: string
      updatedAt: string
    }>
    total: number
    page: number
    limit: number
  }
}
```

---

### GET /api/files/:id

Get file metadata by ID.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    name: string
    size: number
    mimeType: string
    url: string
    folderId: string | null
    createdAt: string
    updatedAt: string
  }
}
```

---

### POST /api/files/upload

Upload a new file.

**Request:** Multipart form data

- `file`: File binary
- `folderId` (optional): Parent folder ID

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    name: string
    size: number
    mimeType: string
    url: string
    folderId: string | null
    createdAt: string
  }
}
```

---

### PATCH /api/files/:id

Update file metadata.

**Request Body:**

```typescript
{
  name?: string;
  folderId?: string | null;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    name: string
    size: number
    mimeType: string
    url: string
    folderId: string | null
    updatedAt: string
  }
}
```

---

### DELETE /api/files/:id

Soft delete a file (moves to trash).

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

### POST /api/files/:id/restore

Restore a soft-deleted file from trash.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    name: string
    deletedAt: null
  }
}
```

---

### DELETE /api/files/:id/permanent

Permanently delete a file.

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

### POST /api/folders

Create a new folder.

**Request Body:**

```typescript
{
  name: string;
  parentId?: string | null;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    name: string
    parentId: string | null
    createdAt: string
  }
}
```

---

### GET /api/folders

List folders.

**Query Parameters:**

- `parentId` (string, optional - null for root)

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    name: string
    parentId: string | null
    createdAt: string
  }>
}
```

---

### PATCH /api/folders/:id

Update folder name.

**Request Body:**

```typescript
{
  name: string
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    name: string
    updatedAt: string
  }
}
```

---

## Share Endpoints

### POST /api/share

Share a resource with users.

**Request Body:**

```typescript
{
  resourceType: 'file' | 'folder' | 'doc' | 'sheet' | 'slide';
  resourceId: string;
  userIds: string[];
  permission: 'view' | 'edit';
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    resourceType: string
    resourceId: string
    sharedWith: Array<{
      userId: string
      permission: string
    }>
    createdAt: string
  }
}
```

---

### GET /api/share/:resourceId

Get share information for a resource.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    resourceType: string
    resourceId: string
    sharedWith: Array<{
      userId: string
      permission: string
      user: {
        id: string
        name: string
        email: string
      }
    }>
  }
}
```

---

### DELETE /api/share/:id

Remove share access.

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

### POST /api/share/link

Create a shareable link.

**Request Body:**

```typescript
{
  resourceType: 'file' | 'folder' | 'doc' | 'sheet' | 'slide';
  resourceId: string;
  expiresIn?: string; // e.g., '7d', '24h'
  password?: string;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    token: string
    url: string
    expiresAt: string | null
  }
}
```

---

## Docs Endpoints

### GET /api/docs

List documents.

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional)

**Response:**

```typescript
{
  success: boolean
  data: {
    docs: Array<{
      id: string
      title: string
      ownerId: string
      createdAt: string
      updatedAt: string
    }>
    total: number
  }
}
```

---

### POST /api/docs

Create a new document.

**Request Body:**

```typescript
{
  title: string;
  content?: string;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    content: string
    ownerId: string
    createdAt: string
    updatedAt: string
  }
}
```

---

### GET /api/docs/:id

Get document by ID.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    content: string
    ownerId: string
    createdAt: string
    updatedAt: string
  }
}
```

---

### PATCH /api/docs/:id

Update document.

**Request Body:**

```typescript
{
  title?: string;
  content?: string;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    content: string
    updatedAt: string
  }
}
```

---

### DELETE /api/docs/:id

Delete document.

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

## Sheets Endpoints

### GET /api/sheets

List spreadsheets.

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    title: string
    ownerId: string
    createdAt: string
    updatedAt: string
  }>
}
```

---

### POST /api/sheets

Create a new spreadsheet.

**Request Body:**

```typescript
{
  title: string;
  data?: Array<Array<string | number>>;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    data: Array<Array<string | number>>
    ownerId: string
    createdAt: string
    updatedAt: string
  }
}
```

---

### GET /api/sheets/:id

Get spreadsheet by ID.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    data: Array<Array<string | number>>
    ownerId: string
    createdAt: string
    updatedAt: string
  }
}
```

---

### PATCH /api/sheets/:id

Update spreadsheet data.

**Request Body:**

```typescript
{
  title?: string;
  data?: Array<Array<string | number>>;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    updatedAt: string
  }
}
```

---

## Slides Endpoints

### GET /api/slides

List presentations.

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    title: string
    ownerId: string
    createdAt: string
    updatedAt: string
  }>
}
```

---

### POST /api/slides

Create a new presentation.

**Request Body:**

```typescript
{
  title: string;
  slides?: Array<{
    content: string;
    notes?: string;
  }>;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    slides: Array<{
      id: string
      content: string
      notes: string
      order: number
    }>
    ownerId: string
    createdAt: string
    updatedAt: string
  }
}
```

---

### GET /api/slides/:id

Get presentation by ID.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    slides: Array<{
      id: string
      content: string
      notes: string
      order: number
    }>
    ownerId: string
    createdAt: string
    updatedAt: string
  }
}
```

---

### PATCH /api/slides/:id

Update presentation.

**Request Body:**

```typescript
{
  title?: string;
  slides?: Array<{
    id?: string;
    content: string;
    notes?: string;
    order: number;
  }>;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    updatedAt: string
  }
}
```

---

## Notes Endpoints

### GET /api/notes

List notes.

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    title: string
    content: string
    ownerId: string
    createdAt: string
    updatedAt: string
  }>
}
```

---

### POST /api/notes

Create a new note.

**Request Body:**

```typescript
{
  title: string
  content: string
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    content: string
    ownerId: string
    createdAt: string
    updatedAt: string
  }
}
```

---

### GET /api/notes/:id

Get note by ID.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    content: string
    ownerId: string
    createdAt: string
    updatedAt: string
  }
}
```

---

### PATCH /api/notes/:id

Update note.

**Request Body:**

```typescript
{
  title?: string;
  content?: string;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    updatedAt: string
  }
}
```

---

### DELETE /api/notes/:id

Delete note.

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

## Tasks Endpoints

### GET /api/tasks

List tasks.

**Query Parameters:**

- `status` (string, optional): 'todo' | 'in-progress' | 'done'
- `assigneeId` (string, optional)

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    title: string
    description: string
    status: 'todo' | 'in-progress' | 'done'
    assigneeId: string | null
    dueDate: string | null
    createdAt: string
    updatedAt: string
  }>
}
```

---

### POST /api/tasks

Create a new task.

**Request Body:**

```typescript
{
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  assigneeId?: string;
  dueDate?: string;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    description: string
    status: 'todo' | 'in-progress' | 'done'
    assigneeId: string | null
    dueDate: string | null
    createdAt: string
    updatedAt: string
  }
}
```

---

### GET /api/tasks/:id

Get task by ID.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    description: string
    status: 'todo' | 'in-progress' | 'done'
    assigneeId: string | null
    dueDate: string | null
    comments: Array<{
      id: string
      content: string
      userId: string
      createdAt: string
    }>
    createdAt: string
    updatedAt: string
  }
}
```

---

### PATCH /api/tasks/:id

Update task.

**Request Body:**

```typescript
{
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  assigneeId?: string | null;
  dueDate?: string | null;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    updatedAt: string
  }
}
```

---

### DELETE /api/tasks/:id

Delete task.

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

### POST /api/tasks/:id/comments

Add comment to task.

**Request Body:**

```typescript
{
  content: string
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    content: string
    userId: string
    createdAt: string
  }
}
```

---

## Mail Endpoints

### GET /api/mail/messages

List mail messages.

**Query Parameters:**

- `folder` (string, default: 'inbox'): 'inbox' | 'sent' | 'drafts' | 'trash'
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**

```typescript
{
  success: boolean
  data: {
    messages: Array<{
      id: string
      from: {
        name: string
        email: string
      }
      to: Array<{
        name: string
        email: string
      }>
      subject: string
      preview: string
      isRead: boolean
      createdAt: string
    }>
    total: number
  }
}
```

---

### GET /api/mail/messages/:id

Get mail message by ID.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    from: {
      name: string
      email: string
    }
    to: Array<{
      name: string
      email: string
    }>
    subject: string
    body: string
    isRead: boolean
    folder: string
    createdAt: string
  }
}
```

---

### POST /api/mail/send

Send an email.

**Request Body:**

```typescript
{
  to: Array<{
    name: string;
    email: string;
  }>;
  subject: string;
  body: string;
  cc?: Array<{
    name: string;
    email: string;
  }>;
  bcc?: Array<{
    name: string;
    email: string;
  }>;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    status: 'sent'
    createdAt: string
  }
}
```

---

## Calendar Endpoints

### GET /api/cal/events

List calendar events.

**Query Parameters:**

- `startDate` (string, ISO 8601)
- `endDate` (string, ISO 8601)

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    title: string
    description: string | null
    startDate: string
    endDate: string
    location: string | null
    attendees: Array<{
      userId: string
      name: string
      email: string
      status: 'pending' | 'accepted' | 'declined'
    }>
    createdAt: string
  }>
}
```

---

### POST /api/cal/events

Create a calendar event.

**Request Body:**

```typescript
{
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  attendeeIds?: string[];
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    startDate: string
    endDate: string
    createdAt: string
  }
}
```

---

### PATCH /api/cal/events/:id

Update calendar event.

**Request Body:**

```typescript
{
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  attendeeIds?: string[];
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    updatedAt: string
  }
}
```

---

### DELETE /api/cal/events/:id

Delete calendar event.

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

## Meet Endpoints

### POST /api/meet

Create a meeting room.

**Request Body:**

```typescript
{
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    roomUrl: string
    startTime: string
    endTime: string | null
    createdAt: string
  }
}
```

---

### POST /api/meet/:id/join

Join a meeting room.

**Response:**

```typescript
{
  success: boolean
  data: {
    meetingId: string
    userId: string
    joinedAt: string
    token: string
  }
}
```

---

### POST /api/meet/:id/leave

Leave a meeting room.

**Response:**

```typescript
{
  success: boolean
  message: string
}
```

---

## Chat Endpoints

### GET /api/chat/channels

List chat channels.

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    name: string
    description: string | null
    type: 'public' | 'private' | 'dm'
    memberCount: number
    createdAt: string
  }>
}
```

---

### GET /api/chat/channels/:id/messages

Get messages from a channel.

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 50)
- `before` (string, optional - message ID for pagination)

**Response:**

```typescript
{
  success: boolean
  data: {
    messages: Array<{
      id: string
      content: string
      userId: string
      user: {
        id: string
        name: string
      }
      createdAt: string
    }>
    hasMore: boolean
  }
}
```

---

### POST /api/chat/channels/:id/messages

Send a message to a channel.

**Request Body:**

```typescript
{
  content: string
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    content: string
    userId: string
    createdAt: string
  }
}
```

---

## Forms Endpoints

### GET /api/forms

List forms.

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    title: string
    description: string | null
    responseCount: number
    createdAt: string
    updatedAt: string
  }>
}
```

---

### POST /api/forms

Create a new form.

**Request Body:**

```typescript
{
  title: string;
  description?: string;
  fields: Array<{
    type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea';
    label: string;
    required: boolean;
    options?: string[];
  }>;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    description: string | null
    fields: Array<{
      id: string
      type: string
      label: string
      required: boolean
      options: string[]
    }>
    createdAt: string
  }
}
```

---

### GET /api/forms/:id

Get form by ID.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    description: string | null
    fields: Array<{
      id: string
      type: string
      label: string
      required: boolean
      options: string[]
    }>
    createdAt: string
  }
}
```

---

### POST /api/forms/:id/responses

Submit a form response.

**Request Body:**

```typescript
{
  responses: Array<{
    fieldId: string
    value: string | string[] | number
  }>
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    formId: string
    submittedAt: string
  }
}
```

---

## Sign Endpoints

### GET /api/sign/requests

List signature requests.

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string
    title: string
    documentId: string
    status: 'pending' | 'completed' | 'expired'
    signers: Array<{
      email: string
      name: string
      status: 'pending' | 'signed'
    }>
    createdAt: string
  }>
}
```

---

### POST /api/sign/requests

Create a signature request.

**Request Body:**

```typescript
{
  title: string;
  documentId: string;
  signers: Array<{
    email: string;
    name: string;
  }>;
  message?: string;
  expiresIn?: string;
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    status: 'pending'
    createdAt: string
  }
}
```

---

### POST /api/sign/requests/:id/sign

Sign a document.

**Request Body:**

```typescript
{
  signature: string // Base64 encoded signature image
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    status: string
    signedAt: string
  }
}
```

---

## Notifications Endpoints

### GET /api/notifications

List notifications for current user.

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `unreadOnly` (boolean, default: false)

**Response:**

```typescript
{
  success: boolean
  data: {
    notifications: Array<{
      id: string
      type: 'info' | 'warning' | 'error' | 'success'
      title: string
      message: string
      isRead: boolean
      relatedResourceId: string | null
      createdAt: string
    }>
    total: number
    unreadCount: number
  }
}
```

---

### POST /api/notifications/:id/read

Mark notification as read.

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    isRead: boolean
  }
}
```

---

## Search Endpoint

### GET /api/search

Search across all resources.

**Query Parameters:**

- `q` (string, required): Search query
- `types` (string, optional): Comma-separated resource types (docs,sheets,slides,files,notes)
- `limit` (number, default: 20)

**Response:**

```typescript
{
  success: boolean
  data: {
    results: Array<{
      id: string
      type: 'doc' | 'sheet' | 'slide' | 'file' | 'note'
      title: string
      snippet: string
      updatedAt: string
    }>
    total: number
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```typescript
{
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
