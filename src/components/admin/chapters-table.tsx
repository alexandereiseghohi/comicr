"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteChapterAction } from "@/lib/actions/admin.actions";

/**
 * Chapters Table Component
 * @description Admin table for managing chapters with comic filter
 */

interface Chapter {
  comicId: number;
  comicTitle: string;
  createdAt: Date | null;
  id: number;
  number: number;
  title: null | string;
}

interface ChaptersTableProps {
  chapters: Chapter[];
}

export function ChaptersTable({ chapters }: ChaptersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<null | number>(null);

  const handleDelete = (id: number) => {
    startTransition(async () => {
      const result = await deleteChapterAction(id);
      if (result.ok) {
        router.refresh();
      }
      setDeleteId(null);
    });
  };

  const columns: ColumnDef<Chapter>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "number",
      header: "Chapter",
      cell: ({ row }) => <Badge variant="outline">Ch. {row.getValue("number")}</Badge>,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="max-w-50 truncate">{row.getValue("title") || "—"}</span>,
    },
    {
      accessorKey: "comicTitle",
      header: "Comic",
      cell: ({ row }) => (
        <Link className="text-primary block max-w-50 truncate hover:underline" href={`/admin/comics`}>
          {row.getValue("comicTitle")}
        </Link>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date | null;
        return date ? new Date(date).toLocaleDateString() : "—";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const chapter = row.original;

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
              <DropdownMenuItem asChild>
                <Link href={`/comics/${chapter.comicId}/chapters/${chapter.number}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(chapter.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
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
      <DataTable columns={columns} data={chapters} searchKey="comicTitle" searchPlaceholder="Filter by comic..." />

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={() => setDeleteId(null)} open={deleteId !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chapter? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
