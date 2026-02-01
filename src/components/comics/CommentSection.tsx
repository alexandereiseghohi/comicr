"use client";

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
import { ChevronDown, ChevronUp, Loader2, MessageSquare, Reply, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

interface Comment {
  id: number;
  content: string;
  userId: number;
  userName: string;
  userImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  parentId: number | null;
  children?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  depth: number;
  onReply: (parentId: number) => void;
  onDelete: (commentId: number) => void;
  replyingTo: number | null;
  onCancelReply: () => void;
  onSubmitReply: (parentId: number, content: string) => Promise<void>;
}

function CommentItem({
  comment,
  depth,
  onReply,
  onDelete,
  replyingTo,
  onCancelReply,
  onSubmitReply,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDelete = () => {
    onDelete(comment.id);
    setShowDeleteDialog(false);
  };

  return (
    <div
      className={cn(
        "border-l-2 pl-4",
        depth === 0 ? "border-transparent" : "border-slate-200",
        depth > 0 && "ml-4 mt-3"
      )}
    >
      {/* Comment Header */}
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {comment.userImage ? (
            <img src={comment.userImage} alt={comment.userName} className="h-8 w-8 rounded-full" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Author and Date */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900">{comment.userName}</span>
            <span className="text-xs text-slate-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
              <span className="text-xs text-slate-500 italic">(edited)</span>
            )}
          </div>

          {/* Comment Text */}
          {isDeleted ? (
            <p className="text-slate-400 italic">[deleted]</p>
          ) : (
            <p className="text-slate-700 whitespace-pre-wrap break-words">{comment.content}</p>
          )}

          {/* Actions */}
          {!isDeleted && (
            <div className="flex items-center gap-3 mt-2">
              {session && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              )}

              {hasChildren && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  {collapsed ? (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show {comment.children!.length}{" "}
                      {comment.children!.length === 1 ? "reply" : "replies"}
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
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                maxLength={2000}
                rows={3}
                disabled={submitting}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {replyContent.length}/2000 characters
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={onCancelReply} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={submitting || !replyContent.trim()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
              key={child.id}
              comment={child}
              depth={depth + 1}
              onReply={onReply}
              onDelete={onDelete}
              replyingTo={replyingTo}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
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
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
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

      if (!response.ok || !result.success) {
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

      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to post reply");
        return;
      }

      toast.success("Your reply has been added");

      // Refresh comments to show new reply in tree
      // In a real app, you'd update the state more efficiently
      window.location.reload();
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

      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to delete comment");
        return;
      }

      toast.success("Your comment has been deleted");

      // Refresh to show updated state
      window.location.reload();
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Comments ({comments.length})
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sort by:</span>
          <Button
            size="sm"
            variant={sortOrder === "newest" ? "default" : "outline"}
            onClick={() => setSortOrder("newest")}
          >
            Newest
          </Button>
          <Button
            size="sm"
            variant={sortOrder === "oldest" ? "default" : "outline"}
            onClick={() => setSortOrder("oldest")}
          >
            Oldest
          </Button>
        </div>
      </div>

      {/* New Comment Form */}
      {session ? (
        <div className="space-y-3 bg-white rounded-lg border p-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={2000}
            rows={4}
            disabled={submitting}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{newComment.length}/2000 characters</span>
            <Button onClick={handleSubmitComment} disabled={submitting || !newComment.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg border p-4 text-center">
          <p className="text-slate-600">
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Sign in
            </Link>{" "}
            to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              onReply={setReplyingTo}
              onDelete={handleDeleteComment}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onSubmitReply={handleSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
