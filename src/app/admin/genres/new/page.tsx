import { GenreForm } from "@/components/admin/genre-form";

export const metadata = {
  title: "New Genre - Admin",
  description: "Create a new genre",
};

export default function NewGenrePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Genre</h1>
        <p className="text-muted-foreground">Create a new comic genre</p>
      </div>
      <GenreForm />
    </div>
  );
}
