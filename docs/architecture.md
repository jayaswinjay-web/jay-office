# JAY Office — Architecture

## Overview

JAY Office is a cloud-based productivity suite organized as a Turborepo monorepo.

## Repository Structure

```
jay-office/
├── apps/
│   ├── web/              # Main React SPA (Vite 5)
│   └── desktop/          # Electron wrapper (Phase 3)
├── services/
│   ├── api/              # Fastify REST API
│   ├── realtime/         # Socket.io + Yjs WebSocket server
│   ├── search/           # Typesense sync worker
│   ├── mail-worker/      # IMAP/SMTP sync (BullMQ)
│   └── meet/             # mediasoup SFU (Phase 3)
├── packages/
│   ├── types/            # Shared TypeScript interfaces
│   ├── schema/           # Zod schemas + Drizzle ORM schema
│   └── utils/            # Pure utility functions
└── infra/                # Docker Compose, nginx
```

## Data Flow

1. **Client** (React SPA) → **API** (Fastify, port 4000) → **PostgreSQL**
2. **Client** → **Realtime** (Socket.io, port 4001) → **Yjs** CRDT sync
3. **API** → **MinIO** (port 9000) for file storage
4. **Search worker** → **Typesense** (port 8108) for indexing
5. **Mail worker** → **Redis** (port 6379) for job queue

## Authentication

- JWT access tokens (15min expiry) + refresh tokens (7d expiry)
- Refresh token rotation on each use
- Password hashing: bcrypt (12 rounds)
- 2FA: TOTP (authenticator app)

## Real-time Collaboration

- Yjs CRDT for conflict-free editing
- Awareness protocol for cursor presence
- WebSocket transport via Socket.io
