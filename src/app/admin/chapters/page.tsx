/**
 * Chapters Management Page
 * @description Admin page for managing all chapters
 */

import { redirect } from "next/navigation";

import { ChaptersTable } from "@/components/admin/chapters-table";
import { getChaptersForAdmin } from "@/database/queries/admin.queries";
import { auth } from "@/lib/auth-config";

export default async function ChaptersPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;

  if (user?.role !== "admin") {
    redirect("/");
  }

  const result = await getChaptersForAdmin();
  const chapters = result.success && result.data ? result.data.chapters : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chapters</h1>
          <p className="text-muted-foreground">
            Manage all comic chapters ({chapters.length} total)
          </p>
        </div>
      </div>

      <ChaptersTable chapters={chapters} />
    </div>
  );
}
