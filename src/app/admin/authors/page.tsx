import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { AuthorsTable } from "@/components/admin/authors-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthorsForAdmin } from "@/database/queries/admin.queries";

export const metadata = {
  title: "Authors - Admin",
  description: "Manage authors",
};

interface PageProps {
  searchParams: Promise<{ inactive?: string; page?: string; search?: string; }>;
}

export default async function AuthorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const showInactive = params.inactive === "true";

  const result = await getAuthorsForAdmin({
    page,
    limit: 20,
    search,
  });

  if (!result.success || !result.data) {
    return <div>Error loading authors</div>;
  }

  const { items, total, totalPages } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Authors</h1>
          <p className="text-muted-foreground">Manage comic authors</p>
        </div>
        <Button asChild>
          <Link href="/admin/authors/new">
            <PlusIcon className="mr-2 h-4 w-4" /> Add Author
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Authors</CardTitle>
          <CardDescription>
            {total} authors found {showInactive && "(including inactive)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthorsTable items={items} />
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button asChild key={p} size="sm" variant={p === page ? "default" : "outline"}>
                  <Link
                    href={`/admin/authors?page=${p}${search ? `&search=${search}` : ""}${
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
