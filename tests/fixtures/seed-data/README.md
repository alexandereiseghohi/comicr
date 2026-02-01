# Seed Data Test Fixtures

Minimal test data files for unit and integration testing of the seeding system.

## Files

### `users.fixture.json`

- 3 test users with various configurations
- Includes regular users and admin role
- Tests null/populated image fields

### `comics.fixture.json`

- 3 test comics with different statuses
- Tests various field combinations (optional fields, empty arrays, null values)
- Covers ongoing/completed/hiatus status
- Tests genres array population

### `chapters.fixture.json`

- 4 test chapters across different comics
- Tests image array handling (0, 1, 2, 3 images)
- Tests optional releaseDate field
- Tests different comics (foreign key relationships)

## Usage

```typescript
import usersFixture from "@/../tests/fixtures/seed-data/users.fixture.json";
import comicsFixture from "@/../tests/fixtures/seed-data/comics.fixture.json";
import chaptersFixture from "@/../tests/fixtures/seed-data/chapters.fixture.json";

// Use in tests
const testUsers = UserSeedSchema.array().parse(usersFixture);
```

## Design Principles

1. **Minimal**: Only essential fields for testing core logic
2. **Edge Cases**: Includes null, empty arrays, optional fields
3. **Relationships**: Foreign keys match between fixtures
4. **Deterministic**: Stable IDs for predictable test assertions
5. **Fast**: Small datasets for quick test execution

## Maintenance

Update fixtures when:

- Schema changes require new required fields
- New edge cases need coverage
- Foreign key relationships change
