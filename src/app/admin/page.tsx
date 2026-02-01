import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardStats,
  getPopularComics,
  getRecentComics,
  getRecentUsers,
} from "@/database/queries/admin.queries";
import { auth } from "@/lib/auth-config";
import {
  ArrowRightIcon,
  BookOpenIcon,
  EyeIcon,
  FileTextIcon,
  PlusIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
  title: "Admin Dashboard | ComicWise",
  description: "ComicWise admin dashboard",
};

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  );
}

async function DashboardStats() {
  const result = await getDashboardStats();

  if (!result.success || !result.data) {
    return <p className="text-destructive">Failed to load stats</p>;
  }

  const { comics, chapters, users, views } = result.data;

  const stats = [
    {
      title: "Total Comics",
      value: comics.toLocaleString(),
      icon: BookOpenIcon,
      href: "/admin/comics",
    },
    {
      title: "Total Chapters",
      value: chapters.toLocaleString(),
      icon: FileTextIcon,
      href: "/admin/chapters",
    },
    {
      title: "Total Users",
      value: users.toLocaleString(),
      icon: UsersIcon,
      href: "/admin/users",
    },
    {
      title: "Total Views",
      value: views.toLocaleString(),
      icon: EyeIcon,
      href: "/admin",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link key={stat.title} href={stat.href}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

async function RecentComicsCard() {
  const result = await getRecentComics(5);

  if (!result.success || !result.data) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Comics</CardTitle>
          <CardDescription>Newly added comics</CardDescription>
        </div>
        <Link href="/admin/comics">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {result.data.map((comic) => (
            <div key={comic.id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{comic.title}</p>
                <p className="text-sm text-muted-foreground">
                  {comic.views?.toLocaleString() ?? 0} views
                </p>
              </div>
              <Badge
                variant={
                  comic.status === "Ongoing"
                    ? "default"
                    : comic.status === "Completed"
                    ? "secondary"
                    : "outline"
                }
              >
                {comic.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function PopularComicsCard() {
  const result = await getPopularComics(5);

  if (!result.success || !result.data) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            Popular Comics
          </CardTitle>
          <CardDescription>Top comics by views</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {result.data.map((comic, index) => (
            <div key={comic.id} className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{comic.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>👁️ {(comic.views ?? 0).toLocaleString()}</span>
                  <span>⭐ {Number(comic.rating)?.toFixed(1) ?? "N/A"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function RecentUsersCard() {
  const result = await getRecentUsers(5);

  if (!result.success || !result.data) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Newly registered users</CardDescription>
        </div>
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {result.data.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name ?? "No name"}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <Badge variant="outline">{user.role ?? "user"}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;

  if (!user || user.role !== "admin") {
    redirect("/not-found");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your comic platform</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/comics/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Comic
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      {/* Cards grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          }
        >
          <RecentComicsCard />
        </Suspense>

        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          }
        >
          <PopularComicsCard />
        </Suspense>

        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          }
        >
          <RecentUsersCard />
        </Suspense>
      </div>
    </div>
  );
}
