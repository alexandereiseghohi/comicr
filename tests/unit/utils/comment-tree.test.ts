import { buildCommentTree } from "@/database/queries/comment-queries";
import type { CommentWithUser } from "@/types";
import { describe, expect, it } from "vitest";

describe("buildCommentTree", () => {
  it("should build tree from flat comment list", () => {
    const comments: CommentWithUser[] = [
      {
        id: 1,
        content: "Root comment",
        userId: 1,
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
        content: "Reply to root",
        userId: 2,
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
        content: "Another root",
        userId: 3,
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
        content: "Level 1",
        userId: 1,
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
        content: "Level 2",
        userId: 2,
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
        content: "Level 3",
        userId: 3,
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
        content: "Root",
        userId: 1,
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
        content: "Reply to deleted parent",
        userId: 2,
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
        content: "Test comment",
        userId: 1,
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
      userId: 1,
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
        content: "[deleted]",
        userId: 1,
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
        content: "Reply to deleted comment",
        userId: 2,
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
