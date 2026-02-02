import { ArtistForm } from "@/components/admin/artist-form";

export const metadata = {
  title: "New Artist - Admin",
  description: "Create a new artist",
};

export default function NewArtistPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Artist</h1>
        <p className="text-muted-foreground">Create a new artist profile</p>
      </div>
      <ArtistForm />
    </div>
  );
}
