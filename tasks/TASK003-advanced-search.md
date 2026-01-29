# TASK003 - Advanced Search and Filtering

**Status:** In Progress
**Added:** 2026-01-15
**Updated:** 2026-01-29

## Original Request

Enable users to filter comics by genre, author, and rating, and support full-text search.

## Thought Process

- Use PostgreSQL full-text search for performance.
- Add filter UI to search page.
- Update API endpoints for new query params.

## Implementation Plan

- [x] Update DB schema for full-text index
- [x] Add API support for filters
- [ ] Build filter UI
- [ ] Add E2E and unit tests

## Progress Tracking

**Overall Status:** In Progress

### Subtasks

| ID  | Description        | Status      | Updated    | Notes             |
| --- | ------------------ | ----------- | ---------- | ----------------- |
| 1.1 | DB schema update   | Complete    | 2026-01-20 |                   |
| 1.2 | API filter support | Complete    | 2026-01-22 |                   |
| 1.3 | Filter UI          | In Progress | 2026-01-29 | UI in development |
| 1.4 | E2E/unit tests     | Not Started |            |                   |

## Progress Log

### 2026-01-29

- Filter UI development started.
