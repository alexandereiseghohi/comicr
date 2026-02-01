# API Reference

## Overview

ComicWise API follows REST conventions with JSON request/response bodies. All endpoints requiring authentication use NextAuth sessions.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://comicr.vercel.app/api`

## Authentication

Most endpoints require authentication via NextAuth session cookie. The session is automatically included in browser requests.

### Headers

```
Cookie: next-auth.session-token=<token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Comics

### List Comics

```http
GET /api/comics
```

#### Query Parameters

| Parameter | Type   | Default   | Description                                   |
| --------- | ------ | --------- | --------------------------------------------- |
| page      | number | 1         | Page number                                   |
| limit     | number | 20        | Items per page (max 100)                      |
| status    | string | -         | Filter by status (ongoing, completed, hiatus) |
| genre     | string | -         | Filter by genre ID                            |
| search    | string | -         | Search in title/description                   |
| sortBy    | string | createdAt | Sort field                                    |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Comic Title",
      "slug": "comic-title",
      "description": "...",
      "coverImage": "https://...",
      "status": "ongoing",
      "rating": "4.5",
      "views": 1000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

### Get Comic by Slug

```http
GET /api/comics/{slug}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Comic Title",
    "slug": "comic-title",
    "description": "Full description...",
    "coverImage": "https://...",
    "status": "ongoing",
    "type": "manhwa",
    "author": { "id": 1, "name": "Author Name" },
    "artist": { "id": 1, "name": "Artist Name" },
    "genres": [{ "id": 1, "name": "Action" }],
    "chapters": [{ "id": 1, "title": "Chapter 1", "chapterNumber": 1 }],
    "rating": "4.5",
    "views": 1000,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Trending Comics

```http
GET /api/comics/trending
```

#### Query Parameters

| Parameter | Type   | Default | Description                    |
| --------- | ------ | ------- | ------------------------------ |
| period    | string | week    | Time period (day, week, month) |

---

## Chapters

### List Chapters by Comic

```http
GET /api/comics/{comicId}/chapters
```

#### Query Parameters

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| page      | number | 1       | Page number    |
| limit     | number | 50      | Items per page |

### Get Chapter by ID

```http
GET /api/chapters/{chapterId}
```

### Get Chapter Images

```http
GET /api/chapters/{chapterId}/images
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "chapterId": 1,
      "imageUrl": "https://...",
      "pageNumber": 1
    }
  ]
}
```

### Increment Chapter Views

```http
POST /api/chapters/{chapterId}/view
```

**Authentication Required**: No

---

## Upload

### Upload File

```http
POST /api/upload
```

**Authentication Required**: Yes

#### Request Body (multipart/form-data)

| Field    | Type   | Required | Description       |
| -------- | ------ | -------- | ----------------- |
| file     | File   | Yes      | File to upload    |
| folder   | string | No       | Target folder     |
| filename | string | No       | Custom filename   |
| access   | string | No       | public or private |
| metadata | JSON   | No       | Custom metadata   |

#### Response

```json
{
  "success": true,
  "url": "https://storage.example.com/path/file.jpg",
  "key": "uploads/user-id/file.jpg",
  "size": 102400,
  "contentType": "image/jpeg"
}
```

### Delete File

```http
DELETE /api/upload?key={fileKey}
```

**Authentication Required**: Yes

---

## Bookmarks

### List User Bookmarks

```http
GET /api/bookmarks
```

**Authentication Required**: Yes

### Add Bookmark

```http
POST /api/bookmarks
```

**Authentication Required**: Yes

#### Request Body

```json
{
  "comicId": 1
}
```

### Remove Bookmark

```http
DELETE /api/bookmarks/{bookmarkId}
```

**Authentication Required**: Yes

---

## User

### Get Current User

```http
GET /api/user/me
```

**Authentication Required**: Yes

### Update Profile

```http
PATCH /api/user/profile
```

**Authentication Required**: Yes

#### Request Body

```json
{
  "name": "New Name",
  "image": "https://..."
}
```

---

## Admin (Requires Admin Role)

### List Users

```http
GET /api/admin/users
```

### Get Audit Logs

```http
GET /api/admin/audit-logs
```

#### Query Parameters

| Parameter | Type     | Description           |
| --------- | -------- | --------------------- |
| userId    | string   | Filter by user        |
| action    | string   | Filter by action type |
| resource  | string   | Filter by resource    |
| startDate | ISO date | Start date filter     |
| endDate   | ISO date | End date filter       |
| page      | number   | Page number           |
| limit     | number   | Items per page        |

---

## Error Codes

| Code             | Description              |
| ---------------- | ------------------------ |
| UNAUTHORIZED     | Authentication required  |
| FORBIDDEN        | Insufficient permissions |
| NOT_FOUND        | Resource not found       |
| VALIDATION_ERROR | Invalid request data     |
| RATE_LIMITED     | Too many requests        |
| INTERNAL_ERROR   | Server error             |

---

## Rate Limiting

- **Standard endpoints**: 100 requests/minute
- **Upload endpoints**: 10 requests/minute
- **Auth endpoints**: 5 requests/minute

---

_See also: [Architecture](architecture.md), [Deployment Guide](deployment.md)_
