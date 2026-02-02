"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useOptimisticAction } from "@/hooks/use-optimistic-action";

export interface BookmarkButtonProps {
  comicId: number;
  initialBookmarked?: boolean;
  userId: string;
}

async function postAdd(payload: { comicId: number; userId: string; }) {
  const resp = await fetch("/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return resp.json();
}

async function postRemove(payload: { comicId: number; userId: string; }) {
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
        className="rounded-md border bg-white px-3 py-1 text-slate-800"
        onClick={() => router.push("/auth/sign-in")}
      >
        Sign in to bookmark
      </button>
    );
  }

  return (
    <button
      aria-pressed={bookmarked}
      className={`rounded-md border px-3 py-1 ${
        bookmarked ? "bg-blue-600 text-white" : "bg-white text-slate-800"
      }`}
      disabled={adding || removing}
      onClick={toggle}
    >
      {bookmarked ? "Bookmarked" : "Add Bookmark"}
    </button>
  );
}
