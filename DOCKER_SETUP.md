# ComicWise Docker Setup Guide

Complete Docker containerization for the ComicWise Next.js application with PostgreSQL and Redis.

## 📋 Overview

This setup provides:

- **Multi-stage Dockerfile**: Optimized production build with minimal image size
- **Development Dockerfile**: Hot-reload support for development
- **Docker Compose**: Orchestration for app, PostgreSQL, and Redis
- **Security**: Non-root user, health checks, signal handling
- **Best Practices**: .dockerignore, BuildKit caching, Alpine Linux

## 🚀 Quick Start

### Development (with hot reload)

```bash
# Initialize Docker setup
bash scripts/docker-init.sh

# Start development environment
docker compose -f docker-compose.dev.yml up

# Run in background
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f app

# Stop all services
docker compose -f docker-compose.dev.yml down
```

The app will be available at `http://localhost:3000` with hot-reload enabled.

### Production

```bash
# Copy and configure environment
cp .env.production.example .env.production
# Edit .env.production with your actual secrets

# Build and start
docker compose up -d

# View logs
docker compose logs -f app

# Stop all services
docker compose down
```

## 📁 Files Included

| File                      | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `Dockerfile`              | Production multi-stage build                  |
| `Dockerfile.dev`          | Development build with hot reload             |
| `docker-compose.yml`      | Production orchestration                      |
| `docker-compose.dev.yml`  | Development orchestration                     |
| `.dockerignore`           | Excludes unnecessary files from build context |
| `.env.production.example` | Template for production environment variables |
| `scripts/init-db.sql`     | PostgreSQL initialization                     |
| `scripts/docker-init.sh`  | Setup automation script                       |

## 🔧 Services

### app (Next.js)

- **Image**: Built from local Dockerfile
- **Port**: 3000
- **Depends on**: PostgreSQL (healthy), Redis (healthy)
- **Health Check**: HTTP endpoint at `/`
- **Volume**: Logs directory for production

### postgres (Database)

- **Image**: `postgres:17-alpine`
- **Port**: 5432
- **User**: `comicwise`
- **Password**: `comicwise_pass` (change in .env.production!)
- **Database**: `comicwise`
- **Volumes**: Persistent data storage
- **Init Script**: `scripts/init-db.sql` (runs on startup)

### redis (Cache)

- **Image**: `redis:7-alpine`
- **Port**: 6379
- **Password**: `redis_secure_password` (change in .env.production!)
- **Persistence**: AOF enabled
- **Volumes**: Persistent data storage

## 🔐 Security Best Practices

### Production Checklist

1. **Change default passwords**:

   ```bash
   # Edit .env.production
   POSTGRES_PASSWORD="your-secure-password"
   REDIS_PASSWORD="your-secure-password"
   ```

2. **Generate AUTH_SECRET**:

   ```bash
   openssl rand -base64 32
   ```

3. **Configure environment variables**:
   - Fill all REQUIRED fields in `.env.production`
   - Use managed secrets in deployment platforms
   - Never commit `.env.production` to version control

4. **Network security**:
   - Use `docker-compose.yml` as-is (internal bridge network)
   - Database and Redis only accessible to app container
   - Expose only necessary ports (app: 3000)

5. **Image security**:
   - Non-root user (`nextjs:nodejs`) runs the app
   - Alpine Linux base images (minimal attack surface)
   - Signal handling with dumb-init
   - Health checks for automatic recovery

### Development Notes

Development compose file exposes all ports (5432, 6379) for direct access:

```bash
# Access PostgreSQL directly
psql -h localhost -U comicwise -d comicwise

# Access Redis directly
redis-cli -p 6379 -a redis_secure_password
```

## 📊 Volume Management

### Production Volumes

```
postgres-data    → /var/lib/postgresql/data
redis-data       → /data
app-logs         → Container logs
```

### Development Volumes

```
postgres-data-dev    → Development database
redis-data-dev       → Development cache
app-logs-dev         → Development logs
src:/app/src        → Hot reload (bound mount)
public:/app/public  → Static files hot reload
```

### Persistent Data

Data persists between container restarts:

```bash
# Stop and restart (data preserved)
docker compose stop
docker compose start

# Remove all data
docker compose down -v
```

## 🛠 Common Commands

### Build Management

```bash
# Build production image
docker build -t comicwise:latest -f Dockerfile .

# Build with custom tag
docker build -t comicwise:v1.0 -f Dockerfile .

# View build cache
docker buildx du

# Rebuild without cache
docker compose build --no-cache
```

### Container Management

```bash
# List running containers
docker compose ps

# Restart a service
docker compose restart app

# Rebuild and restart a service
docker compose up -d --build app

# Run one-off command
docker compose exec app pnpm db:seed

# Run in new container
docker compose run app pnpm db:migrate
```

### Logs and Debugging

```bash
# View all logs
docker compose logs

# Follow app logs
docker compose logs -f app

# Last 100 lines of postgres
docker compose logs --tail=100 postgres

# Follow specific service with timestamps
docker compose logs -f --timestamps redis
```

### Database Operations

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U comicwise -d comicwise

# Run migrations
docker compose exec app pnpm db:migrate

# Seed database
docker compose exec app pnpm db:seed

# Backup database
docker compose exec postgres pg_dump -U comicwise comicwise > backup.sql

# Restore database
docker compose exec -T postgres psql -U comicwise comicwise < backup.sql
```

### Redis Operations

```bash
# Connect to Redis CLI
docker compose exec redis redis-cli -a redis_secure_password

# Check Redis info
docker compose exec redis redis-cli -a redis_secure_password INFO

# Clear all cache
docker compose exec redis redis-cli -a redis_secure_password FLUSHALL
```

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs app

# Verify dependencies are healthy
docker compose ps

# Check service health
docker compose logs postgres
docker compose logs redis
```

### Database Connection Error

```bash
# Verify PostgreSQL is running and healthy
docker compose ps postgres

# Test connection manually
docker compose exec postgres psql -U comicwise -d comicwise -c "SELECT 1"
```

### Redis Connection Timeout

```bash
# Check Redis is running
docker compose ps redis

# Test Redis connection
docker compose exec redis redis-cli -a redis_secure_password ping
```

### Out of Disk Space

```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes
```

### Hot Reload Not Working (Dev)

```bash
# Verify volume mounts
docker compose -f docker-compose.dev.yml exec app mount | grep '/app'

# Restart with rebuild
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build

# Check file permissions
docker compose -f docker-compose.dev.yml exec app ls -la /app/src
```

## 📈 Performance Optimization

### Build Caching

The multi-stage Dockerfile leverages Docker's layer caching:

1. Dependencies layer (slow, cached)
2. Builder layer (medium, cached)
3. Runtime layer (fast, minimal)

Only modified layers rebuild.

### Image Size

Production image optimizations:

- Alpine Linux base (~170MB)
- Multi-stage build (no dev dependencies)
- Non-root user (no sudo)
- Result: ~500-800MB final image

### Database Optimization

```bash
# Enable query logging (slow queries)
docker compose exec postgres psql -U comicwise -d comicwise << EOF
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
EOF

# Check index usage
docker compose exec postgres psql -U comicwise -d comicwise << EOF
SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;
EOF
```

## 🚢 Deployment Options

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy
docker stack deploy -c docker-compose.yml comicwise
```

### Kubernetes

Convert docker-compose.yml to Kubernetes manifests:

```bash
# Option 1: kompose
kompose convert -f docker-compose.yml

# Option 2: Manual Deployment manifests
kubectl apply -f k8s/
```

### Managed Services

- **AWS**: ECS with RDS (PostgreSQL) and ElastiCache (Redis)
- **GCP**: Cloud Run with Cloud SQL and Cloud Memorystore
- **Azure**: Container Instances with Azure Database
- **Vercel**: Next.js deployment with external DB/Redis

## 📝 Environment Variables Reference

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: NextAuth secret (32+ chars)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`: Image storage

### Optional Variables

- `SENTRY_DSN`: Error tracking
- `STRIPE_SECRET_KEY`: Payment processing
- `RESEND_API_KEY`: Email service

See `.env.production.example` for complete reference.

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Docker Image
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/build-push-action@v4
        with:
          context: .
          push: false
          tags: comicwise:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment/docker)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)
- [Redis in Docker](https://hub.docker.com/_/redis)

## ❓ FAQ

**Q: Can I use this in production?**
A: Yes, but ensure you change all default passwords and fill environment variables from `.env.production.example`.

**Q: How do I scale horizontally?**
A: Use Docker Swarm or Kubernetes. For Compose, use multiple instances behind a load balancer.

**Q: Can I use different database/cache?**
A: Yes, modify docker-compose.yml. For MySQL, use `mysql:8` image. For Memcached, use `memcached:latest`.

**Q: How do I update the app?**
A: Pull new code, run `docker compose build` and `docker compose up -d`.

**Q: Can I access the database from outside Docker?**
A: In production compose, only app container can access it (secure). In dev, port 5432 is exposed for direct `psql` access.
