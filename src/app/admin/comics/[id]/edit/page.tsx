/**
 * Comic Edit Page
 * @description Admin page for editing comic details
 */

import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { ComicEditForm } from "@/components/admin/comic-edit-form";
import { db } from "@/database/db";
import { comic } from "@/database/schema";
import { auth } from "@/lib/auth-config";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getComic(id: number) {
  return await db.query.comic.findFirst({
    where: eq(comic.id, id),
  });
}

export default async function ComicEditPage({ params }: PageProps) {
  // Verify admin access
  const session = await auth();
  const currentUser = session?.user as { role?: string } | undefined;
  if (currentUser?.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;
  const comicId = parseInt(id, 10);

  if (isNaN(comicId)) {
    notFound();
  }

  const comicData = await getComic(comicId);

  if (!comicData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Comic</h1>
        <p className="text-muted-foreground">Update comic details and metadata</p>
      </div>

      <ComicEditForm comic={comicData} />
    </div>
  );
}
