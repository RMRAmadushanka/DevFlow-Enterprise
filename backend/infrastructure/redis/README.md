# Redis

## Purpose (Phase 1)

| Use | Status |
|---|---|
| API Gateway rate limiting | Foundation configured |
| Caching | Client wired (`StringRedisTemplate`) — no domain caches yet |
| Session / token denylist | Placeholder for later auth hardening |
| Temporary data | Available |

## Connection

- Host: `localhost` (local) / `redis` (docker network)
- Port: `6379`
- Password: optional via `REDIS_PASSWORD`
