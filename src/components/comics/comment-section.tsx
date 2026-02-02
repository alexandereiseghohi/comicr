"use client";
import { ChevronDown, ChevronUp, Loader2, MessageSquare, Pencil, Reply, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Comment {
  children?: Comment[];
  content: string;
  createdAt: Date;
  deletedAt: Date | null;
  id: number;
  parentId: null | number;
  updatedAt: Date;
  userId: number;
  userImage?: null | string;
  userName: string;
}

interface CommentItemProps {
  comment: Comment;
  depth: number;
  onCancelReply: () => void;
  onDelete: (commentId: number) => void;
  onEdit: (commentId: number, content: string) => Promise<void>;
  onReply: (parentId: number) => void;
  onSubmitReply: (parentId: number, content: string) => Promise<void>;
  replyingTo: null | number;
}

function CommentItem({
  comment,
  depth,
  onReply,
  onDelete,
  onEdit,
  replyingTo,
  onCancelReply,
  onSubmitReply,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const isDeleted = comment.deletedAt !== null;
  const isOwner = session?.user?.id && Number(session.user.id) === comment.userId;
  const hasChildren = comment.children && comment.children.length > 0;
  const isReplying = replyingTo === comment.id;

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await onSubmitReply(comment.id, replyContent);
      setReplyContent("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }

    setEditSubmitting(true);
    try {
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleDelete = () => {
    onDelete(comment.id);
    setShowDeleteDialog(false);
  };

  return (
    <div
      className={cn(
        "border-l-2 pl-4",
        depth === 0 ? "border-transparent" : "border-slate-200",
        depth > 0 && "mt-3 ml-4"
      )}
    >
      {/* Comment Header */}
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="shrink-0">
          {comment.userImage ? (
            <Image
              alt={comment.userName}
              className="h-8 w-8 rounded-full"
              height={32}
              src={comment.userImage}
              width={32}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-700">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="min-w-0 flex-1">
          {/* Author and Date */}
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-slate-900">{comment.userName}</span>
            <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
            {comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
              <span className="text-xs text-slate-500 italic">(edited)</span>
            )}
          </div>

          {/* Comment Text or Edit Form */}
          {isDeleted ? (
            <p className="text-slate-400 italic">[deleted]</p>
          ) : isEditing ? (
            <div className="space-y-2">
              <Textarea
                disabled={editSubmitting}
                maxLength={2000}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                value={editContent}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{editContent.length}/2000 characters</span>
                <div className="flex gap-2">
                  <Button disabled={editSubmitting} onClick={handleCancelEdit} size="sm" variant="outline">
                    Cancel
                  </Button>
                  <Button disabled={editSubmitting || !editContent.trim()} onClick={handleSubmitEdit} size="sm">
                    {editSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="wrap-break-word whitespace-pre-wrap text-slate-700">{comment.content}</p>
          )}

          {/* Actions */}
          {!isDeleted && !isEditing && (
            <div className="mt-2 flex items-center gap-3">
              {session && (
                <button
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                  onClick={() => onReply(comment.id)}
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </button>
              )}

              {isOwner && (
                <button
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              )}

              {isOwner && (
                <button
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              )}

              {hasChildren && (
                <button
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show {comment.children!.length} {comment.children!.length === 1 ? "reply" : "replies"}
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Hide {comment.children!.length === 1 ? "reply" : "replies"}
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                disabled={submitting}
                maxLength={2000}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={3}
                value={replyContent}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{replyContent.length}/2000 characters</span>
                <div className="flex gap-2">
                  <Button disabled={submitting} onClick={onCancelReply} size="sm" variant="outline">
                    Cancel
                  </Button>
                  <Button disabled={submitting || !replyContent.trim()} onClick={handleSubmitReply} size="sm">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Reply"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Child Comments */}
      {hasChildren && !collapsed && (
        <div className="mt-2">
          {comment.children!.map((child) => (
            <CommentItem
              comment={child}
              depth={depth + 1}
              key={child.id}
              onCancelReply={onCancelReply}
              onDelete={onDelete}
              onEdit={onEdit}
              onReply={onReply}
              onSubmitReply={onSubmitReply}
              replyingTo={replyingTo}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              {hasChildren
                ? "This comment has replies. It will be marked as [deleted] but the replies will remain visible."
                : "Are you sure you want to delete this comment? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface CommentSectionProps {
  chapterId: number;
  initialComments: Comment[];
}

export function CommentSection({ chapterId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<null | number>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          content: newComment,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        toast.error(result.error || "Failed to post comment");
        return;
      }

      toast.success("Your comment has been added");

      setComments([result.data, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Comment submission error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number, content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          content,
          parentId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        toast.error(result.error || "Failed to post reply");
        return;
      }

      toast.success("Your reply has been added");

      // Optimistic update: Add reply to comment tree
      setComments((prevComments) => {
        const addReplyToTree = (items: Comment[]): Comment[] => {
          return items.map((item) => {
            if (item.id === parentId) {
              return {
                ...item,
                children: [...(item.children || []), result.data],
              };
            }
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: addReplyToTree(item.children),
              };
            }
            return item;
          });
        };
        return addReplyToTree(prevComments);
      });
    } catch (error) {
      console.error("Reply submission error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setReplyingTo(null);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        toast.error(result.error || "Failed to delete comment");
        return;
      }

      toast.success("Your comment has been deleted");

      // Optimistic update: Mark comment as deleted in tree
      setComments((prevComments) => {
        const markDeletedInTree = (items: Comment[]): Comment[] => {
          return items.map((item) => {
            if (item.id === commentId) {
              return {
                ...item,
                deletedAt: new Date(),
                content: "[deleted]",
              };
            }
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: markDeletedInTree(item.children),
              };
            }
            return item;
          });
        };
        return markDeletedInTree(prevComments);
      });
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        toast.error(result.error || "Failed to update comment");
        return;
      }

      toast.success("Your comment has been updated");

      // Optimistic update: Update comment in tree
      setComments((prevComments) => {
        const updateInTree = (items: Comment[]): Comment[] => {
          return items.map((item) => {
            if (item.id === commentId) {
              return {
                ...item,
                content,
                updatedAt: new Date(),
              };
            }
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: updateInTree(item.children),
              };
            }
            return item;
          });
        };
        return updateInTree(prevComments);
      });
    } catch (error) {
      console.error("Edit comment error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <MessageSquare className="h-6 w-6" />
          Comments ({comments.length})
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sort by:</span>
          <Button
            onClick={() => setSortOrder("newest")}
            size="sm"
            variant={sortOrder === "newest" ? "default" : "outline"}
          >
            Newest
          </Button>
          <Button
            onClick={() => setSortOrder("oldest")}
            size="sm"
            variant={sortOrder === "oldest" ? "default" : "outline"}
          >
            Oldest
          </Button>
        </div>
      </div>

      {/* New Comment Form */}
      {session ? (
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <Textarea
            disabled={submitting}
            maxLength={2000}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            value={newComment}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{newComment.length}/2000 characters</span>
            <Button disabled={submitting || !newComment.trim()} onClick={handleSubmitComment}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-slate-50 p-4 text-center">
          <p className="text-slate-600">
            <Link className="text-blue-600 hover:underline" href="/sign-in">
              Sign in
            </Link>{" "}
            to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <MessageSquare className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="comment-section">
          {sortedComments.map((comment) => (
            <CommentItem
              comment={comment}
              depth={0}
              key={comment.id}
              onCancelReply={() => setReplyingTo(null)}
              onDelete={handleDeleteComment}
              onEdit={handleEditComment}
              onReply={setReplyingTo}
              onSubmitReply={handleSubmitReply}
              replyingTo={replyingTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
