import { GenreForm } from "@/components/admin/genre-form";
import { db } from "@/database/db";
import { genre } from "@/database/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Genre - Admin",
  description: "Edit genre details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGenrePage({ params }: PageProps) {
  const { id } = await params;
  const genreId = Number(id);

  if (isNaN(genreId)) {
    notFound();
  }

  const [genreData] = await db.select().from(genre).where(eq(genre.id, genreId)).limit(1);

  if (!genreData) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Genre</h1>
        <p className="text-muted-foreground">Update genre: {genreData.name}</p>
      </div>
      <GenreForm genre={genreData} />
    </div>
  );
}
