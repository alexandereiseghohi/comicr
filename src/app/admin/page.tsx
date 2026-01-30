import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== "admin") {
    redirect("/not-found");
  }
  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Admin Panel: Comic Upload</h1>
      <form
        aria-label="Upload Comic"
        className="space-y-4 max-w-md"
        method="post"
        encType="multipart/form-data"
      >
        <div>
          <label htmlFor="title" className="block font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label htmlFor="authorId" className="block font-medium">
            Author ID
          </label>
          <input
            id="authorId"
            name="authorId"
            type="number"
            required
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label htmlFor="coverImage" className="block font-medium">
            Cover Image
          </label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/*"
            className="file-input w-full"
          />
        </div>
        <div>
          <label htmlFor="description" className="block font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="textarea textarea-bordered w-full"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Upload Comic
        </button>
      </form>
    </main>
  );
}
