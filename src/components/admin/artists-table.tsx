"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  bulkDeleteArtistsAction,
  bulkRestoreArtistsAction,
  deleteArtistAction,
  restoreArtistAction,
} from "@/lib/actions/artist.actions";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable } from "./data-table";

export interface ArtistRow {
  id: number;
  name: string;
  bio: string | null;
  image: string | null;
  isActive: boolean;
  comicsCount: number;
  createdAt: Date;
}

interface ArtistsTableProps {
  items: ArtistRow[];
}

export function ArtistsTable({ items }: ArtistsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [_rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns: ColumnDef<ArtistRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            if (value) {
              setSelectedIds(items.map((r) => r.id));
            } else {
              setSelectedIds([]);
            }
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (value) {
              setSelectedIds((prev) => [...prev, row.original.id]);
            } else {
              setSelectedIds((prev) => prev.filter((id) => id !== row.original.id));
            }
          }}
        />
      ),
    },
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "bio",
      header: "Bio",
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block">{row.original.bio || "—"}</span>
      ),
    },
    {
      accessorKey: "comicsCount",
      header: "Comics",
      cell: ({ row }) => <Badge variant="secondary">{row.original.comicsCount}</Badge>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "destructive"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/artists/${row.original.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Link>
            </DropdownMenuItem>
            {row.original.isActive ? (
              <DropdownMenuItem
                onClick={async () => {
                  await deleteArtistAction(row.original.id);
                  router.refresh();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={async () => {
                  await restoreArtistAction(row.original.id);
                  router.refresh();
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleBulkDelete = async () => {
    await bulkDeleteArtistsAction(selectedIds);
    setSelectedIds([]);
    setRowSelection({});
    router.refresh();
  };

  const handleBulkRestore = async () => {
    await bulkRestoreArtistsAction(selectedIds);
    setSelectedIds([]);
    setRowSelection({});
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            Deactivate Selected
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkRestore}>
            Restore Selected
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={items}
        searchKey="name"
        searchPlaceholder="Search artists..."
      />
    </div>
  );
}
