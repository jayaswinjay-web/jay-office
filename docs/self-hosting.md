# Self-Hosting JAY Office

Complete guide to deploying JAY Office on your own infrastructure.

## Prerequisites

- **Docker** 24.0 or later
- **Docker Compose** v2.0 or later
- **Node.js** 20.x or later
- **pnpm** 8.x or later
- **Minimum 8GB RAM** (16GB recommended for production)
- **Minimum 50GB disk space** (more for file storage)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/anomalyco/jay-office.git
cd jay-office
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see Environment Variables below).

### 3. Start Infrastructure Services

```bash
docker compose up -d
```

This starts:

- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (ports 9000, 9001)
- Typesense (port 8108)

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Run Database Migrations

```bash
pnpm turbo run db:migrate
```

### 6. Start Development Server

```bash
pnpm dev
```

Access JAY Office at `http://localhost:3000`

## Environment Variables

### Required Variables

#### Database

```env
DATABASE_URL="postgresql://jayoffice:jayoffice@localhost:5432/jayoffice"
```

#### Redis

```env
REDIS_URL="redis://localhost:6379"
```

#### MinIO (Object Storage)

```env
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="jayoffice"
MINIO_USE_SSL="false"
```

#### Typesense (Search)

```env
TYPESENSE_API_KEY="typesense-key"
TYPESENSE_HOST="localhost"
TYPESENSE_PORT="8108"
TYPESENSE_PROTOCOL="http"
```

#### Authentication

```env
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
```

### Optional Variables

#### SMTP (Email)

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="no-reply@jayoffice.com"
```

#### Sentry (Error Tracking)

```env
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
```

#### OAuth Providers

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## Production Deployment

### Using Docker Compose (Production)

```bash
docker compose -f docker-compose.prod.yml up -d
```

The production compose file includes:

- Optimized build stages
- No exposed database ports
- Resource limits
- Restart policies
- Log rotation

### Manual Production Build

```bash
pnpm build
pnpm start
```

## Backup & Restore

### PostgreSQL Backup

```bash
# Backup
docker exec jayoffice-postgres pg_dump -U jayoffice jayoffice > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i jayoffice-postgres psql -U jayoffice jayoffice < backup_20260101.sql
```

### MinIO Backup

```bash
# Install MinIO Client (mc)
# https://min.io/docs/minio/linux/reference/minio-mc.html

# Configure alias
mc alias set jayoffice http://localhost:9000 minioadmin minioadmin

# Backup
mc mirror jayoffice/jayoffice ./minio-backup/

# Restore
mc mirror ./minio-backup/ jayoffice/jayoffice
```

### Automated Backup Script

Create `/etc/cron.daily/jayoffice-backup`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/jayoffice"
mkdir -p "$BACKUP_DIR"

# Database backup
docker exec jayoffice-postgres pg_dump -U jayoffice jayoffice | gzip > "$BACKUP_DIR/db_$(date +%Y%m%d).sql.gz"

# MinIO backup
mc mirror jayoffice/jayoffice "$BACKUP_DIR/minio/"

# Keep last 7 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
```

## Scaling

### Horizontal API Server Scaling

Run multiple API server instances behind a load balancer:

```yaml
# docker-compose.scale.yml
services:
  api-1:
    build: .
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Nginx Load Balancer Configuration

```nginx
upstream api_servers {
    server api-1:3001;
    server api-2:3001;
    server api-3:3001;
}

server {
    listen 80;
    server_name office.yourdomain.com;

    location / {
        proxy_pass http://api_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Check Service Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f minio
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
docker exec -it jayoffice-postgres psql -U jayoffice -d jayoffice

# Check if database is ready
docker exec jayoffice-postgres pg_isready
```

### Redis Connection Issues

```bash
# Test Redis connection
docker exec -it jayoffice-redis redis-cli ping

# Check Redis info
docker exec jayoffice-redis redis-cli info
```

### MinIO Issues

```bash
# Check MinIO status
mc admin info jayoffice

# List buckets
mc ls jayoffice
```

### Common Issues

| Issue                    | Solution                                                      |
| ------------------------ | ------------------------------------------------------------- |
| Port already in use      | Change port in docker-compose.yml or stop conflicting service |
| Database migration fails | Check DATABASE_URL and ensure PostgreSQL is running           |
| MinIO bucket not found   | Run `pnpm turbo run minio:init` to create bucket              |
| Typesense not connecting | Verify TYPESENSE_API_KEY matches in all services              |
| JWT errors               | Ensure JWT_SECRET is set and consistent across services       |

## Security Recommendations

1. Change all default passwords in production
2. Use strong JWT_SECRET (minimum 32 characters)
3. Enable HTTPS with Let's Encrypt or proper certificates
4. Restrict database ports to internal network only
5. Regularly update dependencies: `pnpm audit` and `pnpm update`
6. Configure firewall rules to limit exposed ports
7. Enable rate limiting on API endpoints
8. Use secrets management for sensitive environment variables
