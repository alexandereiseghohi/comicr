import { AuthorForm } from "@/components/admin/author-form";

export const metadata = {
  title: "New Author - Admin",
  description: "Create a new author",
};

export default function NewAuthorPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Author</h1>
        <p className="text-muted-foreground">Create a new author profile</p>
      </div>
      <AuthorForm />
    </div>
  );
}
