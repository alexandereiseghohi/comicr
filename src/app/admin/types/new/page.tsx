import { TypeForm } from "@/components/admin/type-form";

export const metadata = {
  title: "New Type - Admin",
  description: "Create a new comic type",
};

export default function NewTypePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Type</h1>
        <p className="text-muted-foreground">Create a new comic type (e.g., Manga, Manhwa)</p>
      </div>
      <TypeForm />
    </div>
  );
}
