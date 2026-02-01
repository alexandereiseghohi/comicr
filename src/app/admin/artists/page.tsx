import { ArtistsTable } from "@/components/admin/artists-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getArtistsForAdmin } from "@/database/queries/admin.queries";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Artists - Admin",
  description: "Manage artists",
};

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; inactive?: string }>;
}

export default async function ArtistsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const showInactive = params.inactive === "true";

  const result = await getArtistsForAdmin({
    page,
    limit: 20,
    search,
  });

  if (!result.success || !result.data) {
    return <div>Error loading artists</div>;
  }

  const { items, total, totalPages } = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Artists</h1>
          <p className="text-muted-foreground">Manage comic artists</p>
        </div>
        <Button asChild>
          <Link href="/admin/artists/new">
            <PlusIcon className="h-4 w-4 mr-2" /> Add Artist
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Artists</CardTitle>
          <CardDescription>
            {total} artists found {showInactive && "(including inactive)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArtistsTable items={items} />
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" asChild>
                  <Link
                    href={`/admin/artists?page=${p}${search ? `&search=${search}` : ""}${
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
