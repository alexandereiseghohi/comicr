"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Shield, ShieldAlert, UserCheck, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { DataTable } from "@/components/admin/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { banUserAction, unbanUserAction, updateUserRoleAction } from "@/lib/actions/admin.actions";

/**
 * Users Table Component
 * @description Admin table for managing users with role management
 */

interface User {
  createdAt: Date | null;
  email: null | string;
  emailVerified: Date | null;
  id: string;
  image: null | string;
  name: null | string;
  role: null | string;
}

interface UsersTableProps {
  users: User[];
}

const ROLES = [
  { value: "admin", label: "Admin", icon: ShieldAlert },
  { value: "moderator", label: "Moderator", icon: Shield },
  { value: "user", label: "User", icon: null },
] as const;

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [banUserId, setBanUserId] = useState<null | string>(null);
  const [unbanUserId, setUnbanUserId] = useState<null | string>(null);

  const handleRoleChange = (userId: string, role: string) => {
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, { role });
      if (result.ok) {
        router.refresh();
      }
    });
  };

  const handleBan = (userId: string) => {
    startTransition(async () => {
      const result = await banUserAction(userId);
      if (result.ok) {
        router.refresh();
      }
      setBanUserId(null);
    });
  };

  const handleUnban = (userId: string) => {
    startTransition(async () => {
      const result = await unbanUserAction(userId);
      if (result.ok) {
        router.refresh();
      }
      setUnbanUserId(null);
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        const initials =
          user.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "?";

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage alt={user.name ?? "User"} src={user.image ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name ?? "Unknown"}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as null | string;
        const roleConfig = ROLES.find((r) => r.value === role) ?? ROLES[2];

        return (
          <Badge variant={role === "admin" ? "destructive" : role === "moderator" ? "default" : "secondary"}>
            {roleConfig.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Status",
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified") as Date | null;
        return <Badge variant={verified ? "outline" : "destructive"}>{verified ? "Active" : "Banned"}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date | null;
        return date ? new Date(date).toLocaleDateString() : "—";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isBanned = !user.emailVerified;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Shield className="mr-2 h-4 w-4" />
                  Change Role
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {ROLES.map((role) => (
                    <DropdownMenuItem
                      disabled={isPending || user.role === role.value}
                      key={role.value}
                      onClick={() => handleRoleChange(user.id, role.value)}
                    >
                      {role.icon && <role.icon className="mr-2 h-4 w-4" />}
                      {role.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              {isBanned ? (
                <DropdownMenuItem onClick={() => setUnbanUserId(user.id)}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-destructive" onClick={() => setBanUserId(user.id)}>
                  <UserX className="mr-2 h-4 w-4" />
                  Ban User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Search users..." />

      {/* Ban Confirmation Dialog */}
      <AlertDialog onOpenChange={() => setBanUserId(null)} open={banUserId !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban this user? They will not be able to sign in until unbanned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={() => banUserId && handleBan(banUserId)}
            >
              {isPending ? "Banning..." : "Ban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban Confirmation Dialog */}
      <AlertDialog onOpenChange={() => setUnbanUserId(null)} open={unbanUserId !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban this user? They will be able to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={() => unbanUserId && handleUnban(unbanUserId)}>
              {isPending ? "Unbanning..." : "Unban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
