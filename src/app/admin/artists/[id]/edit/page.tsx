import { ArtistForm } from "@/components/admin/artist-form";
import { db } from "@/database/db";
import { artist } from "@/database/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Artist - Admin",
  description: "Edit artist details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArtistPage({ params }: PageProps) {
  const { id } = await params;
  const artistId = Number(id);

  if (isNaN(artistId)) {
    notFound();
  }

  const [artistData] = await db.select().from(artist).where(eq(artist.id, artistId)).limit(1);

  if (!artistData) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Artist</h1>
        <p className="text-muted-foreground">Update artist profile for {artistData.name}</p>
      </div>
      <ArtistForm artist={artistData} />
    </div>
  );
}
