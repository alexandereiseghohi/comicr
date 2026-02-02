# Operations Runbook

## Overview

This runbook provides procedures for common operational tasks and incident response for ComicWise.

## Quick Reference

| Task             | Command          |
| ---------------- | ---------------- |
| Start dev server | `pnpm dev`       |
| Run validation   | `pnpm validate`  |
| Push schema      | `pnpm db:push`   |
| Seed database    | `pnpm db:seed`   |
| Open DB studio   | `pnpm db:studio` |
| Run tests        | `pnpm test`      |
| Run E2E tests    | `pnpm test:e2e`  |

## Daily Operations

### Health Checks

```bash
# Check API health
curl https://your-domain.com/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Log Review

```bash
# View Vercel logs
npx vercel logs your-deployment-id

# View audit logs (local)
cat logs/audit/audit-$(date +%Y-%m-%d).jsonl | jq .
```

## Database Operations

### Backup Database

```bash
# Using pg_dump
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Compressed
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# From SQL dump
psql $DATABASE_URL < backup-20240101.sql

# From compressed
gunzip -c backup-20240101.sql.gz | psql $DATABASE_URL
```

### Schema Migration

```bash
# 1. Generate migration
pnpm db:generate

# 2. Review migration file
cat src/database/drizzle/migrations/*.sql

# 3. Apply migration
pnpm db:migrate

# 4. Verify
pnpm db:studio
```

### Data Cleanup

```bash
# Archive old audit logs (>1 year)
DELETE FROM audit_log
WHERE created_at < NOW() - INTERVAL '1 year';

# Vacuum after cleanup
VACUUM ANALYZE audit_log;
```

## Cache Operations

### Clear Cache

```typescript
import { getCacheProvider } from "@/lib/cache";

const cache = getCacheProvider();

// Clear specific key
await cache.delete("comics:list");

// Clear by pattern (if supported)
await cache.deletePattern("comics:*");
```

### Monitor Cache

```bash
# Check Redis connection
redis-cli ping

# View keys
redis-cli keys "comics:*"

# Check memory usage
redis-cli info memory
```

## Storage Operations

### List Files

```typescript
import { getStorageProvider } from "@/lib/storage";

const storage = getStorageProvider();
// Provider-specific listing
```

### Delete Orphaned Files

```sql
-- Find orphaned cover images
SELECT c.cover_image FROM comic c
WHERE NOT EXISTS (
  SELECT 1 FROM comic_image ci
  WHERE ci.url = c.cover_image
);
```

## User Management

### Promote User to Admin

```sql
UPDATE "user"
SET role = 'admin'
WHERE email = 'user@example.com';
```

### Reset User Password

```typescript
import { hashPassword } from "@/lib/password";

const hashedPassword = await hashPassword("new-password");
// Update in database
```

### Disable User

```sql
UPDATE "user"
SET email_verified = NULL,
    updated_at = NOW()
WHERE id = 'user-id';
```

## Incident Response

### High Latency

1. **Check database connections**

   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Check slow queries**

   ```sql
   SELECT query, mean_time, calls
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

3. **Check cache hit rate**

   ```bash
   redis-cli info stats | grep hits
   ```

4. **Actions**
   - Scale database if connection limited
   - Add indexes for slow queries
   - Increase cache TTL

### High Error Rate

1. **Check error logs**

   ```bash
   npx vercel logs --since 1h | grep ERROR
   ```

2. **Check Sentry**
   - Review recent errors
   - Identify patterns

3. **Check external services**
   - Database connectivity
   - Redis connectivity
   - Storage provider status

4. **Rollback if needed**
   ```bash
   npx vercel rollback
   ```

### Database Issues

1. **Connection pool exhausted**

   ```sql
   -- Kill idle connections
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
   AND query_start < NOW() - INTERVAL '5 minutes';
   ```

2. **Long-running queries**

   ```sql
   -- View long queries
   SELECT pid, query, state, query_start
   FROM pg_stat_activity
   WHERE state != 'idle'
   ORDER BY query_start;

   -- Kill specific query
   SELECT pg_cancel_backend(pid);
   ```

3. **Table bloat**

   ```sql
   -- Check bloat
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename))
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

   -- Vacuum
   VACUUM ANALYZE tablename;
   ```

### Authentication Issues

1. **Session issues**
   - Check `AUTH_SECRET` matches across deployments
   - Verify OAuth callback URLs

2. **OAuth failures**
   - Verify client IDs and secrets
   - Check provider status pages

## Maintenance Windows

### Pre-Maintenance

1. Notify users via banner
2. Enable maintenance mode (if available)
3. Create database backup
4. Note current deployment version

### During Maintenance

1. Apply migrations
2. Run seeds if needed
3. Clear caches
4. Verify critical paths

### Post-Maintenance

1. Verify health endpoints
2. Check error rates
3. Monitor performance
4. Disable maintenance mode

## Monitoring Alerts

### Critical (Page immediately)

- API health check failing
- Database connection errors
- Authentication failures > 50%

### Warning (Review within 1 hour)

- p99 latency > 2s
- Error rate > 5%
- Cache miss rate > 50%

### Info (Review daily)

- Disk usage > 70%
- Database connections > 80%
- Audit log size > 1GB

## Contacts

| Role     | Contact              |
| -------- | -------------------- |
| On-call  | oncall@example.com   |
| Database | dba@example.com      |
| Security | security@example.com |

---

_Last Updated: Current Session_
