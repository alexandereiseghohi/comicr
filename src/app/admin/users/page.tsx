/**
 * Users Management Page
 * @description Admin page for managing all users
 */

import { UsersTable } from "@/components/admin/users-table";
import { getUsersForAdmin } from "@/database/queries/admin.queries";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;

  if (user?.role !== "admin") {
    redirect("/");
  }

  const result = await getUsersForAdmin();
  const users = result.success && result.data ? result.data.users : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and roles ({users.length} total)
          </p>
        </div>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
