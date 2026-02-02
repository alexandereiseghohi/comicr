import { BookOpenIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ComicsTable } from "@/components/admin/comics-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getComicsForAdmin } from "@/database/queries/admin.queries";
import { auth } from "@/lib/auth-config";

export const metadata = {
  title: "Comics Management | Admin",
  description: "Manage comics in the admin panel",
};

interface ComicsPageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          {[...Array(10)].map((_, i) => (
            <div className="flex items-center gap-4 border-b py-3 last:border-0" key={i}>
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-12 w-9" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function ComicsContent({ page, search, status }: { page: number; search?: string; status?: string }) {
  const result = await getComicsForAdmin({ page, limit: 50, search, status });

  if (!result.success || !result.data) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Failed to load comics</p>
      </div>
    );
  }

  const { comics, total, totalPages } = result.data;

  if (comics.length === 0) {
    return (
      <div className="py-12 text-center">
        <BookOpenIcon className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-medium">No comics found</h3>
        <p className="text-muted-foreground mb-4">
          {search ? `No comics match "${search}"` : "Get started by adding your first comic"}
        </p>
        <Link href="/admin/comics/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Comic
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-muted-foreground mb-4 text-sm">
        Showing {comics.length} of {total} comics
        {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
      </div>
      <ComicsTable comics={comics} />
    </>
  );
}

export default async function AdminComicsPage({ searchParams }: ComicsPageProps) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;

  if (!user || user.role !== "admin") {
    redirect("/not-found");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search;
  const status = params.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comics</h1>
          <p className="text-muted-foreground">Manage your comic collection</p>
        </div>
        <Link href="/admin/comics/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Comic
          </Button>
        </Link>
      </div>

      {/* Content */}
      <Suspense fallback={<TableSkeleton />}>
        <ComicsContent page={page} search={search} status={status} />
      </Suspense>
    </div>
  );
}
