# Project Architecture Blueprint

**Project:** ComicWise (comicr)
**Generated:** 2026-02-15

---

## 1. Architecture Detection and Analysis

### Technology Stacks

- **Frontend:** Next.js 16 (React 19), TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Zustand, TanStack Query/Table
- **Backend:** Next.js API routes, Drizzle ORM, PostgreSQL, Redis (optional)
- **Validation:** Zod
- **Authentication:** NextAuth.js
- **Testing:** Vitest (unit), Playwright (E2E)
- **Other:** Sentry, Cloudinary/ImageKit/S3 (optional), ESLint/Prettier

### Architectural Pattern

- **Strict 3-layer architecture:**
  1. **Schema Layer:** Zod schemas for input validation (`src/schemas/`)
  2. **Database Layer:** Drizzle ORM queries/mutations (`src/database/`)
  3. **Action Layer:** Server actions with `"use server"` (`src/lib/actions/`)
- **Data Flow:** UI Component → Server Action → DAL/Mutation/Query → Drizzle → PostgreSQL
- **Boundaries:** Each layer is strictly separated; all mutations/queries go through server actions, which validate input and enforce RBAC.
- **Hybrid patterns:** Incorporates elements of Clean Architecture (layered, dependency flow), with some DDD influences (domain models, repositories).

---

## 2. Architectural Overview

- **Guiding Principles:**
  - Separation of concerns
  - Strong typing and validation at boundaries
  - Security by default (RBAC, soft delete, audit logging)
  - Extensibility and modularity
  - Automated testing and validation
- **Boundaries:**
  - No direct DB access from UI/components
  - All input validated via Zod schemas
  - All sensitive actions logged
- **Hybridization:**
  - Clean layering, but pragmatic use of Next.js conventions (App Router, API routes)

---

## 3. Architecture Visualization (C4 Diagrams)

### System Context Diagram

```
      +-------------------+
      |   End User        |
      +--------+----------+
               |
               v
      +--------+----------+
      |  Next.js App      |
      |  (React UI)       |
      +--------+----------+
               |
               v
      +--------+----------+
      | Server Actions    |
      | (API Layer)       |
      +--------+----------+
               |
               v
      +--------+----------+
      | Drizzle ORM       |
      +--------+----------+
               |
               v
      +--------+----------+
      | PostgreSQL DB     |
      +-------------------+
```

### Container Diagram

```
+-------------------+      +-------------------+
|  Next.js Frontend |<---->|  Next.js API      |
|  (React, UI)      |      |  (Server Actions) |
+-------------------+      +-------------------+
         |                          |
         v                          v
+-------------------+      +-------------------+
|  Zustand, Query   |      |  Drizzle ORM      |
|  TanStack Query   |      +-------------------+
+-------------------+              |
         |                          v
         |                +-------------------+
         |                |  PostgreSQL DB    |
         |                +-------------------+
         |
         v
+-------------------+
|  Redis, S3, etc.  |
+-------------------+
```

### Component Diagram (Sample)

```
[UI Component] → [Server Action] → [Mutation/Query] → [Drizzle] → [DB]
```

---

## 4. Core Architectural Components

### Schema Layer

- **Purpose:** Input validation, type safety, business rule enforcement
- **Structure:** Zod schemas in `src/schemas/`
- **Patterns:** Schema composition, refinement, cross-field validation
- **Interaction:** Consumed by server actions; never used directly in UI
- **Extensibility:** Add new schemas for new features; compose for complex validation

### Database Layer

- **Purpose:** Data access, persistence, query/mutation logic
- **Structure:** Drizzle ORM queries/mutations in `src/database/queries/` and `src/database/mutations/`
- **Patterns:** Repository, data mapper, upsert, soft delete
- **Interaction:** Only called from server actions
- **Extensibility:** Add new queries/mutations as needed; keep logic isolated

### Action Layer

- **Purpose:** Orchestrate business logic, enforce validation/auth, expose server actions
- **Structure:** Server actions in `src/lib/actions/` (must use `"use server"`)
- **Patterns:** Command, orchestrator, RBAC enforcement
- **Interaction:** Called from UI components; call into database layer
- **Extensibility:** Add new actions for new features; always validate input and check permissions

### UI Layer

- **Purpose:** User interaction, presentation, state management
- **Structure:** React components in `src/components/`, pages in `src/app/`
- **Patterns:** Container/presentational, hooks, state stores (Zustand)
- **Interaction:** Calls server actions, manages local state, renders data
- **Extensibility:** Add new components/pages as features grow

---

## 5. Architectural Layers and Dependencies

- **Layer Structure:**
  - UI → Action → Database → DB
- **Dependency Rules:**
  - No direct DB access from UI
  - No business logic in UI or DB layer
  - All mutations/queries go through actions
- **Abstraction Mechanisms:**
  - DAL (data access layer) for all DB operations
  - Zod schemas for all input
- **Dependency Injection:**
  - Next.js/React context for UI; explicit imports for actions/DB

---

## 6. Data Architecture

- **Domain Model:**
  - Users, Comics, Chapters, Comments, Ratings, Bookmarks, Notifications, RBAC, AuditLog
- **Entity Relationships:**
  - Comic has many Chapters, Genres, Authors, Artists
  - User has many Bookmarks, Ratings, Comments
  - Comments are threaded via parentId
- **Data Access Patterns:**
  - Repository, upsert, soft delete, audit log
- **Data Transformation:**
  - Mapping DB rows to DTOs in actions
- **Caching:**
  - Redis for hot data (optional)
- **Validation:**
  - Zod schemas for all input

---

## 7. Cross-Cutting Concerns Implementation

- **Authentication & Authorization:**
  - NextAuth.js, RBAC enforced in actions, roles/permissions in DB
- **Error Handling & Resilience:**
  - Try/catch in actions, error boundaries in UI, Sentry for monitoring
- **Logging & Monitoring:**
  - Winston logger, Sentry, audit log table
- **Validation:**
  - Zod schemas, error reporting via API responses
- **Configuration Management:**
  - All env vars validated at startup (`src/lib/env.ts`), secrets in `.env.local`

---

## 8. Service Communication Patterns

- **Service Boundaries:**
  - All external communication via server actions or API routes
- **Protocols:**
  - HTTP/REST for API, WebSockets (future), OAuth for auth
- **Sync/Async:**
  - Mostly synchronous; async for notifications, email, etc.
- **API Versioning:**
  - Versioned API routes (planned)
- **Service Discovery:**
  - N/A (monolith)
- **Resilience:**
  - Retry logic in actions, error handling in API

---

## 9. Technology-Specific Architectural Patterns

### Next.js/React

- App Router, file-based routing, server actions, React 19 features
- Component composition, hooks, state management (Zustand)
- Data fetching via server actions, TanStack Query
- Rendering optimization: memoization, suspense, code splitting

### Drizzle ORM

- Schema-first, type-safe queries, migrations, upsert, soft delete

### Zod

- Composable schemas, cross-field validation, error mapping

### NextAuth.js

- Provider-based auth, session management, RBAC integration

---

## 10. Implementation Patterns

- **Interface Design:**
  - All public APIs typed, interfaces in `src/types/`
- **Service Implementation:**
  - Server actions as entry points, orchestrate DB and validation
- **Repository Implementation:**
  - All DB access via DAL, upsert, soft delete, audit log
- **Controller/API:**
  - API routes in `src/app/api/`, response shape `{ success, data?, error? }`
- **Domain Model:**
  - Entities in DB schema, value objects for settings, enums for status/roles

---

## 11. Testing Architecture

- **Unit:** Vitest, Zod schema tests, utility tests
- **E2E:** Playwright, covers reader, profile, rating, comments
- **Test Boundaries:** Unit (schemas, utils), integration (actions), E2E (UI)
- **Test Data:** Seed scripts, test DB
- **Tools:** Vitest, Playwright, Testing Library

---

## 12. Deployment Architecture

- **Topology:** Monolithic Next.js app, deployable to Vercel or container
- **Config:** `.env.local` for secrets, validated at startup
- **Containerization:** Dockerfile, docker-compose for local/dev
- **Cloud Integration:** S3/ImageKit/Cloudinary, Sentry, Redis (optional)

---

## 13. Extension and Evolution Patterns

- **Feature Addition:**
  - Add Zod schema → DAL query/mutation → server action → UI component
  - Extend RBAC as needed
- **Modification:**
  - Update schema, migrate DB, update actions, maintain backward compatibility
- **Integration:**
  - Add adapters for new services, use anti-corruption layer for external APIs

---

## 14. Architectural Pattern Examples

### Layer Separation Example

```ts
// src/actions/user.ts
import { userSchema } from "@/schemas/user";
import { createUser } from "@/database/mutations/user";

export async function registerUser(input: unknown) {
  const data = userSchema.parse(input);
  return await createUser(data);
}
```

### Component Communication Example

```ts
// src/components/Rating.tsx
import { rateComic } from "@/lib/actions/rating";

function Rating({ comicId }) {
  // ...
  const handleRate = (value) => rateComic({ comicId, value });
  // ...
}
```

### Extension Point Example

### Component Communication Example

```ts
// src/components/Rating.tsx
import { rateComic } from "@/lib/actions/rating";

function Rating({ comicId }) {
  // ...
  const handleRate = (value) => rateComic({ comicId, value });
  // ...
}
```

### Extension Point Example

```ts
// src/database/mutations/auditLog.ts
export async function logAudit(action, resource, resourceId, details) {
  // ...
}
```

---

## 15. Architectural Decision Records

- **3-layer pattern chosen** for strict separation, maintainability, and testability
- **Zod for validation**: Type safety, composability, error reporting
- **Drizzle ORM**: Type-safe, schema-first, modern Postgres support
- **NextAuth.js**: Secure, extensible, provider-based auth
- **Soft delete/PII anonymization**: Compliance, data integrity
- **RBAC in DB**: Fine-grained, extensible permissions
- **Audit logging**: Security, traceability
- **Testing pipeline**: Quality, regression prevention

---

## 16. Architecture Governance

- **Consistency:** Enforced by ESLint, Prettier, type-check, and test coverage
- **Automated checks:** `pnpm validate` runs type-check, lint, and tests
- **Review:** PRs require validation, code review, and architectural review for major changes
- **Documentation:** README, docs/architecture.md, API reference, ADRs

---

## 17. Blueprint for New Development

- **Workflow:**
  1. Define Zod schema for new feature
  2. Add DAL query/mutation
  3. Create server action (with validation, RBAC)
  4. Build UI component/page
  5. Add/extend tests (unit, E2E)
  6. Update docs
- **Templates:** Use existing files in `src/schemas/`, `src/database/`, `src/lib/actions/`, `src/components/`
- **Pitfalls:**
  - Bypassing server actions (never access DB directly from UI)
  - Skipping validation or RBAC checks
  - Not updating tests/docs
  - Breaking API response shape
- **Performance:**
  - Avoid N+1 queries, use indexes, cache hot data
- **Testing:**
  - Cover all layers, use seed data, maintain 80%+ coverage

---

**Keep this blueprint updated as the architecture evolves.**
