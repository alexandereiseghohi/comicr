# Role-Based Access Control (RBAC)

ComicWise implements a comprehensive RBAC system to manage user permissions across the application.

## Roles

The system defines three user roles:

| Role        | Description        | Permissions                                                  |
| ----------- | ------------------ | ------------------------------------------------------------ |
| `user`      | Regular users      | Browse comics, read chapters, manage bookmarks, rate content |
| `moderator` | Content moderators | All user permissions + moderate comments                     |
| `admin`     | Administrators     | Full access to all features including CRUD operations        |

## Role Definitions

Roles are defined in the database schema as a PostgreSQL enum:

```typescript
// src/database/schema.ts
export const userRole = pgEnum("user_role", ["user", "admin", "moderator"]);
```

## Authorization Pattern

All admin-only server actions use a consistent authorization pattern:

```typescript
// src/lib/actions/genre.actions.ts
async function verifyAdmin(): Promise<{ userId: string } | null> {
  const session = await auth();
  const currentUser = session?.user as { id?: string; role?: string } | undefined;
  if (!currentUser?.id || currentUser.role !== "admin") return null;
  return { userId: currentUser.id };
}

export async function createGenreAction(input: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }
  // ... action logic
}
```

## Protected Resources

### Admin-Only Actions

The following server actions require admin role:

**Genre Management**

- `createGenreAction` - Create new genre
- `updateGenreAction` - Update existing genre
- `deleteGenreAction` - Soft delete genre
- `restoreGenreAction` - Restore deleted genre
- `bulkDeleteGenresAction` - Bulk soft delete
- `bulkRestoreGenresAction` - Bulk restore

**Type Management**

- `createTypeAction`, `updateTypeAction`, `deleteTypeAction`, `restoreTypeAction`
- `bulkDeleteTypesAction`, `bulkRestoreTypesAction`

**Author Management**

- `createAuthorAction`, `updateAuthorAction`, `deleteAuthorAction`, `restoreAuthorAction`
- `bulkDeleteAuthorsAction`, `bulkRestoreAuthorsAction`

**Artist Management**

- `createArtistAction`, `updateArtistAction`, `deleteArtistAction`, `restoreArtistAction`
- `bulkDeleteArtistsAction`, `bulkRestoreArtistsAction`

**Comic Management**

- `createComicAction` - Create new comic
- `updateComicAction` - Update comic metadata
- `deleteComicAction` - Delete comic

**Chapter Management**

- `createChapterAction` - Create new chapter
- `updateChapterAction` - Update chapter
- `deleteChapterAction` - Delete chapter

### User Actions (Authenticated)

These actions require authentication but any role:

- `addBookmarkAction` - Add comic to bookmarks
- `removeBookmarkAction` - Remove bookmark
- `updateProfileAction` - Update user profile
- `rateComicAction` - Rate a comic

### Public Actions (No Auth)

- `getComicsAction` - List comics
- `getComicBySlugAction` - Get comic details
- `searchComicsAction` - Search comics

## Database Tables

### RBAC Support Tables

The database includes additional tables for fine-grained permissions:

```sql
-- Role definitions
CREATE TABLE "role" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Available permissions
CREATE TABLE "permission" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50),
  action VARCHAR(50)
);

-- Role-permission mapping
CREATE TABLE "role_permission" (
  role_id INTEGER REFERENCES role(id),
  permission_id INTEGER REFERENCES permission(id),
  PRIMARY KEY (role_id, permission_id)
);

-- Audit logging for sensitive actions
CREATE TABLE "audit_log" (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Session Structure

User sessions include role information via NextAuth:

```typescript
// Extended session type
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: "user" | "admin" | "moderator";
  };
  expires: string;
}
```

## Client-Side Authorization

For UI-level access control, check user role in components:

```tsx
import { auth } from "@/auth";

export default async function AdminLayout({ children }) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
```

## Testing

RBAC is tested via unit tests in `tests/unit/rbac.spec.ts`:

```bash
# Run RBAC tests
pnpm test:unit tests/unit/rbac.spec.ts
```

Test scenarios include:

- Unauthenticated access rejection
- Regular user access rejection
- Moderator access rejection (admin-only endpoints)
- Admin access approval
- Session edge cases (missing user, no role, no id)

## Error Codes

| Code           | Description                                   |
| -------------- | --------------------------------------------- |
| `UNAUTHORIZED` | User not authenticated or lacks required role |
| `FORBIDDEN`    | User authenticated but action not permitted   |

## Best Practices

1. **Always use `verifyAdmin()` pattern** for admin-only actions
2. **Check authorization first** before any business logic
3. **Return consistent error shapes** (`{ ok: false, error: { code, message } }`)
4. **Log sensitive actions** to audit table
5. **Use type guards** for session user properties
6. **Test all authorization paths** including edge cases
