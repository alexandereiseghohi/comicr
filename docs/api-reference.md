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

---

## Rating Endpoints

### Rate a Comic

Create or update a rating for a comic.

```http
POST /api/comics/rate
```

#### Request Body

```json
{
  "comicId": 1,
  "rating": 5,
  "review": "Amazing comic!" // optional, max 1000 chars
}
```

**Special case:** Set `rating: 0` to delete an existing rating.

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "comicId": 1,
    "rating": 5,
    "review": "Amazing comic!",
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": "2025-02-01T10:00:00Z"
  },
  "message": "Rating saved successfully"
}
```

#### Validation

- `comicId`: positive integer (required)
- `rating`: integer 1-5 or 0 to delete (required)
- `review`: string max 1000 characters (optional)

#### Errors

- `401`: Not authenticated
- `400`: Validation failed
- `500`: Server error

---

## Comment Endpoints

### Get Comments for Chapter

Retrieve threaded comments for a chapter.

```http
GET /api/comments?chapterId={id}
```

#### Query Parameters

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| chapterId | number | Yes      | Chapter ID to fetch |

#### Response

Returns nested comment tree structure:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "Great chapter!",
      "userId": 1,
      "userName": "JohnDoe",
      "userImage": "https://...",
      "chapterId": 1,
      "parentId": null,
      "createdAt": "2025-02-01T10:00:00Z",
      "updatedAt": "2025-02-01T10:00:00Z",
      "deletedAt": null,
      "children": [
        {
          "id": 2,
          "content": "I agree!",
          "parentId": 1,
          "children": [],
          ...
        }
      ]
    }
  ]
}
```

### Create Comment or Reply

Post a new comment or reply to an existing comment.

```http
POST /api/comments
```

#### Request Body

```json
{
  "chapterId": 1,
  "content": "Great chapter!",
  "parentId": null // optional, for replies
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Great chapter!",
    "userId": 1,
    "userName": "JohnDoe",
    "userImage": "https://...",
    "chapterId": 1,
    "parentId": null,
    "createdAt": "2025-02-01T10:00:00Z",
    "updatedAt": "2025-02-01T10:00:00Z",
    "deletedAt": null
  }
}
```

#### Validation

- `chapterId`: positive integer (required)
- `content`: string 1-2000 characters, trimmed (required)
- `parentId`: positive integer (optional, for threading)

### Delete Comment

Soft delete a comment (ownership check applied).

```http
DELETE /api/comments/{id}
```

#### Response

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

**Behavior:**

- If comment has replies: Sets `deletedAt` timestamp, shows `[deleted]` in UI
- If comment has no replies: Could hard delete, but soft deletes for consistency
- Only comment owner can delete

#### Errors

- `401`: Not authenticated
- `400`: Invalid comment ID or not owner
- `500`: Server error

---

## Profile Endpoints

### Update User Settings

Update user preferences (stored as JSONB).

```http
PUT /api/profile/settings
```

#### Request Body

```json
{
  "emailNotifications": true,
  "profileVisibility": "public",
  "autoSaveProgress": true
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "settings": {
      "emailNotifications": true,
      "profileVisibility": "public",
      "autoSaveProgress": true
    },
    "updatedAt": "2025-02-01T10:00:00Z"
  },
  "message": "Settings updated successfully"
}
```

### Delete User Account

Soft delete account with PII anonymization.

```http
POST /api/profile/delete-account
```

#### Request Body

```json
{
  "confirmPassword": "userPassword"
}
```

#### Response

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Behavior:**

- Sets `deletedAt` timestamp
- Anonymizes name to `"Deleted User"`
- Anonymizes email to `"deleted_{id}@example.com"`
- Removes profile image
- Preserves data structure for foreign key integrity

#### Errors

- `401`: Not authenticated
- `400`: Invalid password
- `500`: Server error

---

## Schema References

### Rating Schema

```typescript
{
  comicId: number (positive integer)
  rating: number (1-5 integer, 0 to delete)
  review?: string (max 1000 chars, optional)
}
```

### Comment Schema

```typescript
{
  chapterId: number (positive integer)
  content: string (1-2000 chars, trimmed)
  parentId?: number (positive integer, optional for threading)
}
```

### Settings Schema

```typescript
{
  emailNotifications?: boolean
  profileVisibility?: "public" | "private"
  autoSaveProgress?: boolean
  // Additional user preferences as needed
}
```

### Change Password Schema

```typescript
{
  currentPassword: string (min 8 chars, uppercase, lowercase, number)
  newPassword: string (min 8 chars, uppercase, lowercase, number)
  confirmPassword: string (must match newPassword)
}
```

**Validation rules:**

- Password must be at least 8 characters
- Must contain at least 1 uppercase letter
- Must contain at least 1 lowercase letter
- Must contain at least 1 number
- New password must be different from current password
- Confirm password must match new password
