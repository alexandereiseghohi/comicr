"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDownIcon, ExternalLinkIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ComicRow {
  coverImage: null | string;
  createdAt: Date | null;
  id: number;
  rating: null | string;
  slug: string;
  status: null | string;
  title: string;
  views: null | number;
}

interface ComicsTableProps {
  comics: ComicRow[];
  onDelete?: (id: number) => Promise<void>;
}

export function ComicsTable({ comics, onDelete }: ComicsTableProps) {
  const [deleteId, setDeleteId] = React.useState<null | number>(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!deleteId || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<ComicRow>[] = [
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
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "coverImage",
      header: "Cover",
      cell: ({ row }) => {
        const coverImage = row.getValue("coverImage") as null | string;
        const title = row.original.title;
        return (
          <div className="relative h-12 w-9 overflow-hidden rounded">
            {coverImage ? (
              <Image alt={`Cover of ${title}`} className="object-cover" fill sizes="36px" src={coverImage} />
            ) : (
              <div className="bg-muted h-full w-full" />
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
          Title
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-50">
          <p className="truncate font-medium">{row.getValue("title")}</p>
          <p className="text-muted-foreground truncate text-xs">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as null | string;
        return (
          <Badge variant={status === "Ongoing" ? "default" : status === "Completed" ? "secondary" : "outline"}>
            {status ?? "Unknown"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "views",
      header: ({ column }) => (
        <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
          Views
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const views = row.getValue("views") as null | number;
        return <span>{(views ?? 0).toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
          Rating
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rating = row.getValue("rating") as null | string;
        return <span>⭐ {rating ? parseFloat(rating).toFixed(1) : "N/A"}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} variant="ghost">
          Created
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date | null;
        return (
          <span className="text-muted-foreground text-sm">{date ? new Date(date).toLocaleDateString() : "N/A"}</span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const comic = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/comics/${comic.slug}`} target="_blank">
                  <ExternalLinkIcon className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/comics/${comic.id}/edit`}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteId(comic.id)}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={comics} pageSize={20} searchKey="title" searchPlaceholder="Search comics..." />

      {/* Delete confirmation */}
      <AlertDialog onOpenChange={() => setDeleteId(null)} open={deleteId !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comic? This action cannot be undone. All associated chapters and data
              will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
