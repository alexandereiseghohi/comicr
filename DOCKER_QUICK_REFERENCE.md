# Docker Quick Reference - ComicWise

## Essential Commands

### Development

```bash
docker compose -f docker-compose.dev.yml up      # Start with logs
docker compose -f docker-compose.dev.yml up -d   # Start in background
docker compose -f docker-compose.dev.yml logs -f # Follow logs
docker compose -f docker-compose.dev.yml down    # Stop all
```

### Production

```bash
docker compose up -d                 # Start in background
docker compose logs -f app            # Follow app logs
docker compose ps                     # Show running containers
docker compose down                   # Stop all
```

### Database

```bash
docker compose exec app pnpm db:migrate        # Run migrations
docker compose exec app pnpm db:seed           # Seed database
docker compose exec postgres psql -U comicwise # Connect to DB
```

### Build

```bash
docker compose build                  # Build images
docker compose build --no-cache       # Force rebuild
docker build -t comicwise:latest -f Dockerfile .  # Manual build
```

## Service Status

```bash
docker compose ps                     # List all services
docker compose exec app npm -v        # Test app connectivity
docker compose exec postgres pg_isready  # Test database
docker compose exec redis redis-cli ping  # Test cache
```

## Environment Setup

```bash
cp .env.production.example .env.production   # Create env file
bash scripts/docker-init.sh                  # Initialize setup
```

## Common Issues

| Issue                      | Solution                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Port already in use        | Change port in docker-compose.yml or stop conflicting container                     |
| Database connection failed | Check `docker compose ps postgres` is running and healthy                           |
| Hot reload not working     | Verify volume mounts with `docker compose -f docker-compose.dev.yml exec app mount` |
| Build timeout              | Increase timeout or use `docker buildx build --timeout=600`                         |
| Out of disk                | Run `docker system prune -a --volumes`                                              |

## Volume Paths

**Production**:

- `postgres-data` → PostgreSQL data directory
- `redis-data` → Redis persistence
- `app-logs` → Application logs

**Development**:

- `./src` → Bind mount for hot reload
- `./public` → Static files
- `/app/node_modules` → Anonymous volume (preserve)

## Useful Health Checks

```bash
# App health
curl http://localhost:3000/

# Database
docker compose exec postgres psql -U comicwise -c "SELECT 1"

# Redis
docker compose exec redis redis-cli -a redis_secure_password PING

# All services
docker compose ps
```

## Performance Tuning

```bash
# Monitor container stats
docker stats

# View image layers
docker history comicwise:latest

# Check disk usage
docker system df

# Rebuild without cache (fresh build)
docker compose build --no-cache app
```

## Deployment Checklist

- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Update all REQUIRED fields in `.env.production`
- [ ] Run `docker compose build`
- [ ] Test locally: `docker compose up`
- [ ] Verify all services are healthy: `docker compose ps`
- [ ] Test database: `docker compose exec app pnpm db:migrate`
- [ ] Test seeding: `docker compose exec app pnpm db:seed`
- [ ] Check logs: `docker compose logs`
- [ ] Push to registry: `docker tag comicwise:latest yourregistry/comicwise:latest && docker push ...`
- [ ] Deploy to production

## File Reference

| File                      | Purpose                        |
| ------------------------- | ------------------------------ |
| `Dockerfile`              | Production build (3 stages)    |
| `Dockerfile.dev`          | Development build (hot reload) |
| `docker-compose.yml`      | Production services            |
| `docker-compose.dev.yml`  | Development services           |
| `.dockerignore`           | Build context optimization     |
| `.env.production.example` | Production env template        |
| `scripts/init-db.sql`     | PostgreSQL init script         |

---

For full documentation, see: `DOCKER_SETUP.md`
