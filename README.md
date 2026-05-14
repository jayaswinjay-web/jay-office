<div align="center">
  <h1>📁 JAY OFFICE</h1>
  <p><em>Monorepo office productivity suite for modern teams</em></p>

  <p>
    <img src="https://img.shields.io/badge/monorepo-Turborepo-EF4444?style=flat-square&logo=turborepo" alt="Turborepo">
    <img src="https://img.shields.io/badge/language-TypeScript-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
  </p>
</div>

![License](https://img.shields.io/github/license/jayaswinjay-web/jay-office?style=flat&color=1a8a7a)
![Last Commit](https://img.shields.io/github/last-commit/jayaswinjay-web/jay-office?style=flat&color=1a8a7a)
![CI](https://github.com/jayaswinjay-web/jay-office/actions/workflows/ci.yml/badge.svg)
![GitHub Repo](https://img.shields.io/github/repo-size/jayaswinjay-web/jay-office?style=flat&color=1a8a7a)

## Overview

JAY OFFICE is a complete monorepo workspace integrating multiple business tools — document management, communication, scheduling, and collaboration features into one seamless experience. Built with Turborepo for efficient monorepo management.

Part of the JAY TECH SOLUTIONS product suite.

## Features

- **Document management** — Create, edit, and collaborate on documents
- **Team communication** — Internal messaging and notifications
- **Task management** — Assign, track, and manage tasks
- **Calendar & scheduling** — Event planning and team scheduling
- **File sharing** — Upload and share files within the organisation
- **Admin dashboard** — User management, permissions, and analytics
- **Modular architecture** — Each feature is a separate package/app

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo |
| Package Manager | pnpm |
| Language | TypeScript |
| Frontend | Next.js / React |
| Backend | Node.js |
| Database | PostgreSQL |

## Project Structure

```
jay-office/
├── apps/                # Applications
│   ├── web/             # Main web application
│   ├── docs/            # Documentation portal
│   └── api/             # Backend API service
├── packages/            # Shared packages
│   ├── ui/              # Shared UI components
│   ├── config/          # Shared configurations
│   └── utils/           # Shared utilities
├── services/            # Microservices
├── infra/               # Infrastructure & deployment config
├── docs/                # Additional documentation
├── turbo.json           # Turborepo configuration
├── pnpm-workspace.yaml  # pnpm workspace definition
└── ROADMAP.md           # Product roadmap
```

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the detailed product roadmap and planned features.

## About JAY TECH SOLUTIONS

JAY OFFICE is part of the [JAY TECH SOLUTIONS](https://jaytechsoln.in) product suite — a collection of business software products serving 50,000+ users across India.

## License

MIT License
