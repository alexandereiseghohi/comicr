import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { AuthorForm } from "@/components/admin/author-form";
import { db } from "@/database/db";
import { author } from "@/database/schema";

export const metadata = {
  title: "Edit Author - Admin",
  description: "Edit author details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAuthorPage({ params }: PageProps) {
  const { id } = await params;
  const authorId = Number(id);

  if (isNaN(authorId)) {
    notFound();
  }

  const [authorData] = await db.select().from(author).where(eq(author.id, authorId)).limit(1);

  if (!authorData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Author</h1>
        <p className="text-muted-foreground">Update author profile for {authorData.name}</p>
      </div>
      <AuthorForm author={authorData} />
    </div>
  );
}
