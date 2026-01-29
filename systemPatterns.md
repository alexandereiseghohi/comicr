# System Patterns

## Architecture Overview

- Next.js app-router with server components for SSR
- REST API for comic data
- PostgreSQL for persistent storage
- Redis for caching

## Key Patterns

- DRY: Shared logic in `src/lib` and `src/hooks`
- Feature-based folder structure
- React context for user/session state

## Component Relationships

- App shell wraps all pages
- Library and Reader components consume user context
- Admin panel uses protected routes
