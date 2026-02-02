import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { TypesTable } from "@/components/admin/types-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTypesForAdmin } from "@/database/queries/admin.queries";

export const metadata = {
  title: "Types - Admin",
  description: "Manage comic types",
};

interface PageProps {
  searchParams: Promise<{ inactive?: string; page?: string; search?: string; }>;
}

export default async function TypesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const showInactive = params.inactive === "true";

  const result = await getTypesForAdmin({
    page,
    limit: 20,
    search,
  });

  if (!result.success || !result.data) {
    return <div>Error loading types</div>;
  }

  const { items, total, totalPages } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Types</h1>
          <p className="text-muted-foreground">Manage comic types (Manga, Manhwa, etc.)</p>
        </div>
        <Button asChild>
          <Link href="/admin/types/new">
            <PlusIcon className="mr-2 h-4 w-4" /> Add Type
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Types</CardTitle>
          <CardDescription>
            {total} types found {showInactive && "(including inactive)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TypesTable items={items} />
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button asChild key={p} size="sm" variant={p === page ? "default" : "outline"}>
                  <Link
                    href={`/admin/types?page=${p}${search ? `&search=${search}` : ""}${
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
