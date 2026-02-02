import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { GenresTable } from "@/components/admin/genres-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGenresForAdmin } from "@/database/queries/admin.queries";

export const metadata = {
  title: "Genres - Admin",
  description: "Manage genres",
};

interface PageProps {
  searchParams: Promise<{ inactive?: string; page?: string; search?: string }>;
}

export default async function GenresPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const showInactive = params.inactive === "true";

  const result = await getGenresForAdmin({
    page,
    limit: 20,
    search,
  });

  if (!result.success || !result.data) {
    return <div>Error loading genres</div>;
  }

  const { items, total, totalPages } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Genres</h1>
          <p className="text-muted-foreground">Manage comic genres</p>
        </div>
        <Button asChild>
          <Link href="/admin/genres/new">
            <PlusIcon className="mr-2 h-4 w-4" /> Add Genre
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Genres</CardTitle>
          <CardDescription>
            {total} genres found {showInactive && "(including inactive)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenresTable items={items} />
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button asChild key={p} size="sm" variant={p === page ? "default" : "outline"}>
                  <Link
                    href={`/admin/genres?page=${p}${search ? `&search=${search}` : ""}${
                      showInactive ? "&inactive=true" : ""
                    }`}
                  >
                    {p}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
