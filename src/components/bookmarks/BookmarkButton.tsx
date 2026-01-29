"use client";
import { useOptimisticAction } from "@/hooks/useOptimisticAction";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface BookmarkButtonProps {
  userId: string;
  comicId: number;
  initialBookmarked?: boolean;
}

async function postAdd(payload: { userId: string; comicId: number }) {
  const resp = await fetch("/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return resp.json();
}

async function postRemove(payload: { userId: string; comicId: number }) {
  const resp = await fetch("/api/bookmarks", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return resp.json();
}

export default function BookmarkButton({
  userId,
  comicId,
  initialBookmarked = false,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState<boolean>(initialBookmarked);
  const { run: addRun, loading: adding } = useOptimisticAction(postAdd);
  const { run: removeRun, loading: removing } = useOptimisticAction(postRemove);
  const router = useRouter();

  const toggle = async () => {
    if (!bookmarked) {
      try {
        await addRun(
          { userId, comicId },
          () => setBookmarked(true),
          () => setBookmarked(false)
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await removeRun(
          { userId, comicId },
          () => setBookmarked(false),
          () => setBookmarked(true)
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  // If no userId provided, show sign-in prompt button
  if (!userId) {
    return (
      <button
        onClick={() => router.push("/auth/sign-in")}
        className="px-3 py-1 rounded-md border bg-white text-slate-800"
      >
        Sign in to bookmark
      </button>
    );
  }

  return (
    <button
      aria-pressed={bookmarked}
      onClick={toggle}
      className={`px-3 py-1 rounded-md border ${
        bookmarked ? "bg-blue-600 text-white" : "bg-white text-slate-800"
      }`}
      disabled={adding || removing}
    >
      {bookmarked ? "Bookmarked" : "Add Bookmark"}
    </button>
  );
}
