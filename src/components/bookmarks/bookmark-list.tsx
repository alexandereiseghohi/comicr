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
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { BookmarkCard } from "./bookmark-card";
import { BookmarkListItem } from "./bookmark-list-item";
import { ViewToggle, type ViewMode } from "./view-toggle";

export interface BookmarkData {
  bookmark: {
    userId: string;
    comicId: number;
    lastReadChapterId: number | null;
    createdAt: Date | null;
  };
  comic: {
    id: number;
    title: string;
    slug: string;
    coverImage: string | null;
    status: string | null;
    rating: string | null;
    views: number | null;
    description: string | null;
  };
  lastReadChapter: {
    id: number;
    chapterNumber: number | null;
    title: string | null;
  } | null;
}

interface BookmarkListProps {
  initialBookmarks: BookmarkData[];
  userId: string;
}

const VIEW_MODE_KEY = "comicwise-bookmarks-view";

export function BookmarkList({ initialBookmarks, userId }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = React.useState(initialBookmarks);
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [removing, setRemoving] = React.useState<number | null>(null);
  const [confirmRemove, setConfirmRemove] = React.useState<number | null>(null);

  // Load view preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  // Save view preference
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  // Handle bookmark removal
  const handleRemove = async (comicId: number) => {
    const bookmarkData = bookmarks.find((b) => b.bookmark.comicId === comicId);
    if (!bookmarkData) return;

    setRemoving(comicId);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          comicId: bookmarkData.comic.id,
        }),
      });

      if (res.ok) {
        setBookmarks((prev) => prev.filter((b) => b.bookmark.comicId !== comicId));
      }
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    } finally {
      setRemoving(null);
      setConfirmRemove(null);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16">
        <BookmarkIcon className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
        <p className="text-muted-foreground mb-6">
          Start bookmarking your favorite comics to see them here
        </p>
        <Link href="/comics">
          <Button>Browse Comics</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
        </p>
        <ViewToggle value={viewMode} onChange={handleViewChange} />
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookmarks.map(({ bookmark, comic, lastReadChapter }) => (
            <BookmarkCard
              key={bookmark.comicId}
              comicId={comic.id}
              comicTitle={comic.title}
              comicSlug={comic.slug}
              coverImage={comic.coverImage}
              status={comic.status}
              rating={comic.rating}
              views={comic.views}
              lastReadChapter={lastReadChapter}
              onRemove={() => setConfirmRemove(bookmark.comicId)}
              removing={removing === bookmark.comicId}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {bookmarks.map(({ bookmark, comic, lastReadChapter }) => (
            <BookmarkListItem
              key={bookmark.comicId}
              comicId={comic.id}
              comicTitle={comic.title}
              comicSlug={comic.slug}
              coverImage={comic.coverImage}
              status={comic.status}
              rating={comic.rating}
              views={comic.views}
              lastReadChapter={lastReadChapter}
              onRemove={() => setConfirmRemove(bookmark.comicId)}
              removing={removing === bookmark.comicId}
            />
          ))}
        </div>
      )}

      {/* Confirmation dialog */}
      <AlertDialog open={confirmRemove !== null} onOpenChange={() => setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this comic from your bookmarks? You can always add it
              back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemove && handleRemove(confirmRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function BookmarkListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
