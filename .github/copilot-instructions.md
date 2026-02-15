# GitHub Copilot Instructions

## Priority Guidelines

When generating code for this repository:

1. **Version Compatibility**: Always detect and respect the exact versions of languages, frameworks, and libraries used in this project
2. **Context Files**: Prioritize patterns and standards defined in the .github/copilot directory
3. **Codebase Patterns**: When context files don't provide specific guidance, scan the codebase for established patterns
4. **Architectural Consistency**: Maintain our Layered architectural style and established boundaries
5. **Code Quality**: Prioritize maintainability, performance, security, accessibility, and testability in all generated code

## Technology Version Detection

Before generating code, scan the codebase to identify:

1. **Language Versions**: Detect the exact versions of programming languages in use
   - Examine project files, configuration files, and package managers
   - Look for language-specific version indicators (e.g., tsconfig.json, package.json)
   - Never use language features beyond the detected version

2. **Framework Versions**: Identify the exact versions of all frameworks
   - Check package.json, tsconfig.json, etc.
   - Respect version constraints when generating code
   - Never suggest features not available in the detected framework versions

3. **Library Versions**: Note the exact versions of key libraries and dependencies
   - Generate code compatible with these specific versions
   - Never use APIs or features not available in the detected versions

## Context Files

Prioritize the following files in .github/copilot directory (if they exist):

- **architecture.md**: System architecture guidelines
- **tech-stack.md**: Technology versions and framework details
- **coding-standards.md**: Code style and formatting standards
- **folder-structure.md**: Project organization guidelines
- **exemplars.md**: Exemplary code patterns to follow

## Codebase Scanning Instructions

When context files don't provide specific guidance:

1. Identify similar files to the one being modified or created
2. Analyze patterns for:
   - Naming conventions
   - Code organization
   - Error handling
   - Logging approaches
   - Documentation style
   - Testing patterns
3. Follow the most consistent patterns found in the codebase
4. When conflicting patterns exist, prioritize patterns in newer files or files with higher test coverage
5. Never introduce patterns not found in the existing codebase

## Code Quality Standards

### Maintainability

- Write self-documenting code with clear naming
- Follow the naming and organization conventions evident in the codebase
- Follow established patterns for consistency
- Keep functions focused on single responsibilities
- Limit function complexity and length to match existing patterns

### Performance

- Follow existing patterns for memory and resource management
- Match existing patterns for handling computationally expensive operations
- Follow established patterns for asynchronous operations
- Apply caching consistently with existing patterns
- Optimize according to patterns evident in the codebase

### Security

- Follow existing patterns for input validation
- Apply the same sanitization techniques used in the codebase
- Use parameterized queries matching existing patterns
- Follow established authentication and authorization patterns
- Handle sensitive data according to existing patterns

### Accessibility

- Follow existing accessibility patterns in the codebase
- Match ARIA attribute usage with existing components
- Maintain keyboard navigation support consistent with existing code
- Follow established patterns for color and contrast
- Apply text alternative patterns consistent with the codebase

### Testability

- Follow established patterns for testable code
- Match dependency injection approaches used in the codebase
- Apply the same patterns for managing dependencies
- Follow established mocking and test double patterns
- Match the testing style used in existing tests

## Documentation Requirements

- Follow the most detailed documentation patterns found in the codebase
- Match the style and completeness of the best-documented code
- Document exactly as the most thoroughly documented files do
- Follow existing patterns for linking documentation
- Match the level of detail in explanations of design decisions

## Testing Approach

### Unit Testing

- Match the exact structure and style of existing unit tests
- Follow the same naming conventions for test files and methods
- Use the same assertion patterns found in existing tests
- Apply the same mocking approach used in the codebase
- Follow existing patterns for test isolation

### Integration Testing

- Follow the same integration test patterns found in the codebase
- Match existing patterns for test data setup and teardown
- Use the same approach for testing component interactions
- Follow existing patterns for verifying system behavior

### End-to-End Testing

- Match the existing E2E test structure and patterns
- Follow established patterns for UI testing
- Apply the same approach for verifying user journeys

### Test-Driven Development

- Follow TDD patterns evident in the codebase
- Match the progression of test cases seen in existing code
- Apply the same refactoring patterns after tests pass

### Behavior-Driven Development

- Match the existing Given-When-Then structure in tests
- Follow the same patterns for behavior descriptions
- Apply the same level of business focus in test cases

## Technology-Specific Guidelines

### JavaScript/TypeScript Guidelines

- Detect and adhere to the specific ECMAScript/TypeScript version in use
- Follow the same module import/export patterns found in the codebase
- Match TypeScript type definitions with existing patterns
- Use the same async patterns (promises, async/await) as existing code
- Follow error handling patterns from similar files

### React Guidelines

- Detect and adhere to the specific React version in use
- Match component structure patterns from existing components
- Follow the same hooks and lifecycle patterns found in the codebase
- Apply the same state management approach used in existing components
- Match prop typing and validation patterns from existing code

## Version Control Guidelines

- Follow Semantic Versioning patterns as applied in the codebase
- Match existing patterns for documenting breaking changes
- Follow the same approach for deprecation notices

## General Best Practices

- Follow naming conventions exactly as they appear in existing code
- Match code organization patterns from similar files
- Apply error handling consistent with existing patterns
- Follow the same approach to testing as seen in the codebase
- Match logging patterns from existing code
- Use the same approach to configuration as seen in the codebase

## Project-Specific Guidance

- Scan the codebase thoroughly before generating any code
- Respect existing architectural boundaries without exception
- Match the style and patterns of surrounding code
- When in doubt, prioritize consistency with existing code over external best practices

# ComicWise (comicr) — AI Agent Coding & Architecture Guide

## 1. Code Style & Naming

- **TypeScript, React, Next.js**: Strict typing everywhere. Use PascalCase for components, kebab-case for utilities, `{entity}.schema.ts` for Zod schemas.
- **Formatting**: Enforced by ESLint/Prettier. Run `pnpm lint` and `pnpm lint:fix` before commit.
- **Naming**:
  - Components: `PascalCase.tsx`
  - Utilities: `kebab-case.ts`
  - Schemas: `{entity}.schema.ts`
  - Types: `{entity}.ts` in `src/types/`
- **Examples**: See `src/components/ui/`, `src/utils/`, `src/schemas/`.

## 2. Architecture & Data Flow

- **Strict 3-Layer Pattern** (enforced):
  1. **Schema Layer**: Zod schemas in `src/schemas/` for all input validation (never use Drizzle schema for validation).
  2. **Database Layer**: Drizzle ORM queries/mutations in `src/database/queries/` and `src/database/mutations/`.
  3. **Action Layer**: All mutations/queries go through server actions in `src/actions/` (must start with `"use server"`).
- **Data Flow**: UI Component → Server Action (Zod validation, auth check) → DAL/Mutation/Query → Drizzle → PostgreSQL
- **DAL First**: Use DAL (e.g., `userDAL.getById()`) for CRUD, not direct DB queries.
- **Return Shape**: Always `{ success: true, data }` or `{ success: false, error }` (see `ActionResult` in `src/types/common.ts`).
- **Comment Threading**: Flat-to-tree conversion, see `docs/architecture.md` (`buildCommentTree`).
- **Soft Delete**: Set `deletedAt` and anonymize PII for users, show `[deleted]` for comments. Never hard-delete users/comments with children.
- **RBAC**: Roles: `user`, `moderator`, `admin` (see `docs/rbac.md`). Use `verifyAdmin()` for admin-only actions. All sensitive actions are logged to audit table.
- **Performance**: Use Redis for hot data caching. Avoid N+1 queries, index all FKs/search fields. Use WebP/AVIF for images, lazy load in UI, code split for bundle size.

## 3. Directory & File Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # React components (ui/, comics/, auth/, navigation/)
├── database/               # Drizzle ORM: schema.ts, queries/, mutations/
├── lib/                    # Core utilities (storage/, cache/, audit/)
├── actions/                # Server actions (must use "use server")
├── schemas/                # Zod validation schemas
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
├── hooks/                  # Custom React hooks
```

## 4. Build, Test, and Validate

- **Install**: `pnpm install`
- **Build**: `pnpm build`
- **Dev server**: `pnpm dev`
- **Lint**: `pnpm lint`, `pnpm lint:fix`
- **Type-check**: `pnpm type-check`
- **Unit tests**: `pnpm test` or `pnpm test:unit`
- **E2E tests**: `pnpm test:e2e`
- **Validate all**: `pnpm validate`
- **Database**: `pnpm db:push`, `pnpm db:seed`, `pnpm db:studio`

## 5. API & Integration

- **API routes**: See `docs/api-reference.md` and OpenAPI spec. All responses: `{ success, data?, error?, message? }`.
- **Drizzle ORM**: Used for all DB access.
- **Zod**: Used for all input validation.
- **Playwright**: For E2E tests.
- **Vitest**: For unit tests.

## 6. Security & Environment

- **Environment**: All secrets/config in `.env.local` (see `src/lib/env.ts`). All env vars validated at startup.
- **Sensitive actions**: All sensitive actions are logged to audit table.
- **CSRF/XSS**: NextAuth handles CSRF; React + CSP headers for XSS.
- **Rate Limiting**: See API docs for limits.

## 7. RBAC & Permissions

- **Roles**: `user`, `moderator`, `admin` (see `docs/rbac.md`).
- **Permission Model**: Resource/action format (e.g., `comic:create`).
- **Pattern**: Always check role before action. Use `verifyAdmin()` for admin-only actions. Return `{ success: false, error }` for unauthorized.
- **Session**: User session includes role info via NextAuth.

## 8. Soft Delete & PII Anonymization

- **Users**: Set `deletedAt`, anonymize name/email, remove image, preserve structure.
- **Comments**: Set `deletedAt` for comments with children, show `[deleted]` in UI.

## 9. Comment Threading

- **Flat-to-tree**: Use `buildCommentTree` utility for O(n) conversion.
- **ParentId**: Self-referencing for infinite nesting. Orphaned comments become root.

## 10. Testing

- **Unit**: Zod schemas, utilities, RBAC, DAL, actions. Target 80%+ coverage.
- **E2E**: Reader, profile, rating, comments, admin panel. Use Playwright.
- **Validation**: `pnpm validate` runs type-check, lint, and all tests.

## 11. Error Handling & API Response

- **Success**: `{ success: true, data }`
- **Error**: `{ success: false, error: string }` or `{ success: false, error: { code, message } }`
- **Paginated**: `{ success: true, data: [...], meta: { page, limit, total, totalPages, hasNextPage, hasPrevPage } }`

## 12. Audit Logging

- **All sensitive actions**: Log to both DB and file (see `docs/architecture.md`).
- **Audit log schema**: See `docs/rbac.md` and `docs/architecture.md`.

## 13. Storage & Caching

- **Storage**: Multi-provider (S3, ImageKit, Cloudinary, local). Use factory for runtime selection.
- **Caching**: Redis (Upstash/ioredis) for hot data. Use cache abstraction in `lib/cache/`.

## 14. Conventions for AI Agents

- **Never** bypass the 3-layer pattern. All mutations/queries must:
  1. Validate input with Zod schema (`src/schemas/`)
  2. Use Drizzle ORM in `src/database/queries/` or `src/database/mutations/`
  3. Be exposed only via server actions in `src/actions/` (with `"use server"`)
- **All API responses** must match `{ success, data?, error?, message? }`.
- **All new files** must follow naming conventions and directory structure above.
- **All new features** must include unit and E2E tests.
- **All sensitive actions** must be logged to audit table.
- **All environment variables** must be validated in `src/lib/env.ts`.

---

**For more, see:**

- `README.md` (project overview, features, quick start)
- `docs/architecture.md` (deep architecture, data flow, RBAC, storage, caching)
- `docs/api-reference.md` (API endpoints, response shapes, error codes)
- `docs/rbac.md` (roles, permissions, patterns)
- `docs/deployment.md` (deployment, env vars, troubleshooting)
- `docs/runbook.md` (operations, incident response)
- `docs/phase-status.md` (phase progress)
- `src/lib/env.ts` (env validation)

---

_Last updated: [auto-generated by AI agent]_

---

Please review and let me know if any section is unclear, missing, or needs more project-specific detail!
