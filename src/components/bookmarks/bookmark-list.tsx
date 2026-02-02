import { BookmarkIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

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

import { BookmarkCard } from "./bookmark-card";
import { BookmarkListItem } from "./bookmark-list-item";
import { type ViewMode, ViewToggle } from "./view-toggle";

("use client");

export interface BookmarkData {
  bookmark: {
    comicId: number;
    createdAt: Date | null;
    lastReadChapterId: null | number;
    userId: string;
  };
  comic: {
    coverImage: null | string;
    description: null | string;
    id: number;
    rating: null | string;
    slug: string;
    status: null | string;
    title: string;
    views: null | number;
  };
  lastReadChapter: {
    chapterNumber: null | number;
    id: number;
    title: null | string;
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
  const [removing, setRemoving] = React.useState<null | number>(null);
  const [confirmRemove, setConfirmRemove] = React.useState<null | number>(null);

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
      <div className="py-16 text-center">
        <BookmarkIcon className="text-muted-foreground/30 mx-auto mb-4 h-16 w-16" />
        <h3 className="mb-2 text-lg font-medium">No bookmarks yet</h3>
        <p className="text-muted-foreground mb-6">Start bookmarking your favorite comics to see them here</p>
        <Link href="/comics">
          <Button>Browse Comics</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header with view toggle */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
        </p>
        <ViewToggle onChange={handleViewChange} value={viewMode} />
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bookmarks.map(({ bookmark, comic, lastReadChapter }) => (
            <BookmarkCard
              comicId={comic.id}
              comicSlug={comic.slug}
              comicTitle={comic.title}
              coverImage={comic.coverImage}
              key={bookmark.comicId}
              lastReadChapter={lastReadChapter}
              onRemove={() => setConfirmRemove(bookmark.comicId)}
              rating={comic.rating}
              removing={removing === bookmark.comicId}
              status={comic.status}
              views={comic.views}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {bookmarks.map(({ bookmark, comic, lastReadChapter }) => (
            <BookmarkListItem
              comicId={comic.id}
              comicSlug={comic.slug}
              comicTitle={comic.title}
              coverImage={comic.coverImage}
              key={bookmark.comicId}
              lastReadChapter={lastReadChapter}
              onRemove={() => setConfirmRemove(bookmark.comicId)}
              rating={comic.rating}
              removing={removing === bookmark.comicId}
              status={comic.status}
              views={comic.views}
            />
          ))}
        </div>
      )}

      {/* Confirmation dialog */}
      <AlertDialog onOpenChange={() => setConfirmRemove(null)} open={confirmRemove !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this comic from your bookmarks? You can always add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmRemove && handleRemove(confirmRemove)}
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div className="space-y-3" key={i}>
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
