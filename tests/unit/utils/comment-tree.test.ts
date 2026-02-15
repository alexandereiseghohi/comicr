const ROOT_COMMENT = "Root comment";
const REPLY_TO_ROOT = "Reply to root";
const ANOTHER_ROOT = "Another root";
const LEVEL_1 = "Level 1";
const LEVEL_2 = "Level 2";
const LEVEL_3 = "Level 3";
const TEST_COMMENT = "Test comment";
const DELETED = "[deleted]";
const REPLY_TO_DELETED = "Reply to deleted comment";
const ROOT = "Root";
const REPLY_TO_DELETED_PARENT = "Reply to deleted parent";
import { describe, expect, it } from "vitest";

import { buildCommentTree, type CommentWithUser } from "@/database/queries/comment-queries";

describe("buildCommentTree", () => {
  it("should build tree from flat comment list", () => {
    const comments: CommentWithUser[] = [
      {
        id: 1,
        content: ROOT_COMMENT,
        userId: "1",
        userName: "User1",
        userImage: null,
        chapterId: 1,
        parentId: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
        deletedAt: null,
      },
      {
        id: 2,
        content: REPLY_TO_ROOT,
        userId: "2",
        userName: "User2",
        userImage: null,
        chapterId: 1,
        parentId: 1,
        createdAt: new Date("2025-01-02"),
        updatedAt: new Date("2025-01-02"),
        deletedAt: null,
      },
      {
        id: 3,
        content: ANOTHER_ROOT,
        userId: "3",
        userName: "User3",
        userImage: null,
        chapterId: 1,
        parentId: null,
        createdAt: new Date("2025-01-03"),
        updatedAt: new Date("2025-01-03"),
        deletedAt: null,
      },
    ];

    const tree = buildCommentTree(comments);

    expect(tree).toHaveLength(2); // Two root comments
    expect(tree[0]?.children).toHaveLength(1); // First root has one reply
    expect(tree[1]?.children).toHaveLength(0); // Second root has no replies
    expect(tree[0]?.children[0]?.id).toBe(2); // Reply id is 2
  });

  it("should handle nested threading (multiple levels)", () => {
    const comments: CommentWithUser[] = [
      {
        id: 1,
        content: LEVEL_1,
        userId: "1",
        userName: "User1",
        userImage: null,
        chapterId: 1,
        parentId: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
        deletedAt: null,
      },
      {
        id: 2,
        content: LEVEL_2,
        userId: "2",
        userName: "User2",
        userImage: null,
        chapterId: 1,
        parentId: 1,
        createdAt: new Date("2025-01-02"),
        updatedAt: new Date("2025-01-02"),
        deletedAt: null,
      },
      {
        id: 3,
        content: LEVEL_3,
        userId: "3",
        userName: "User3",
        userImage: null,
        chapterId: 1,
        parentId: 2,
        createdAt: new Date("2025-01-03"),
        updatedAt: new Date("2025-01-03"),
        deletedAt: null,
      },
    ];

    const tree = buildCommentTree(comments);

    expect(tree).toHaveLength(1); // One root
    expect(tree[0]?.children).toHaveLength(1); // Root has one child
    expect(tree[0]?.children[0]?.children).toHaveLength(1); // Child has one child
    expect(tree[0]?.children[0]?.children[0]?.id).toBe(3); // Nested id is 3
  });

  it("should handle orphaned comments (deleted parent)", () => {
    const comments: CommentWithUser[] = [
      {
        id: 1,
        content: ROOT,
        userId: "1",
        userName: "User1",
        userImage: null,
        chapterId: 1,
        parentId: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
        deletedAt: null,
      },
      {
        id: 2,
        content: REPLY_TO_DELETED_PARENT,
        userId: "2",
        userName: "User2",
        userImage: null,
        chapterId: 1,
        parentId: 999, // Parent doesn't exist
        createdAt: new Date("2025-01-02"),
        updatedAt: new Date("2025-01-02"),
        deletedAt: null,
      },
    ];

    const tree = buildCommentTree(comments);

    // Orphaned comment becomes root level
    expect(tree).toHaveLength(2);
    expect(tree.find((c) => c.id === 2)).toBeDefined();
  });

  it("should handle empty comment list", () => {
    const tree = buildCommentTree([]);
    expect(tree).toHaveLength(0);
  });

  it("should preserve all comment properties", () => {
    const comments: CommentWithUser[] = [
      {
        id: 1,
        content: TEST_COMMENT,
        userId: "1",
        userName: "TestUser",
        userImage: "https://example.com/avatar.jpg",
        chapterId: 1,
        parentId: null,
        createdAt: new Date("2025-01-01T10:00:00Z"),
        updatedAt: new Date("2025-01-02T10:00:00Z"),
        deletedAt: null,
      },
    ];

    const tree = buildCommentTree(comments);

    expect(tree[0]).toMatchObject({
      id: 1,
      content: "Test comment",
      userId: "1",
      userName: "TestUser",
      userImage: "https://example.com/avatar.jpg",
      chapterId: 1,
      parentId: null,
    });
    expect(tree[0]?.createdAt.toISOString()).toBe("2025-01-01T10:00:00.000Z");
    expect(tree[0]?.updatedAt.toISOString()).toBe("2025-01-02T10:00:00.000Z");
  });

  it("should handle soft-deleted comments", () => {
    const comments: CommentWithUser[] = [
      {
        id: 1,
        content: DELETED,
        userId: "1",
        userName: "User1",
        userImage: null,
        chapterId: 1,
        parentId: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
        deletedAt: new Date("2025-01-03"),
      },
      {
        id: 2,
        content: REPLY_TO_DELETED,
        userId: "2",
        userName: "User2",
        userImage: null,
        chapterId: 1,
        parentId: 1,
        createdAt: new Date("2025-01-02"),
        updatedAt: new Date("2025-01-02"),
        deletedAt: null,
      },
    ];

    const tree = buildCommentTree(comments);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.deletedAt).not.toBeNull(); // Parent is deleted
    expect(tree[0]?.children).toHaveLength(1); // But has children
    expect(tree[0]?.children[0]?.deletedAt).toBeNull(); // Child not deleted
  });
});
