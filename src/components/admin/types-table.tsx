"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  bulkDeleteTypesAction,
  bulkRestoreTypesAction,
  deleteTypeAction,
  restoreTypeAction,
} from "@/lib/actions/type.actions";

import { DataTable } from "./data-table";

export interface TypeRow {
  comicsCount: number;
  createdAt: Date;
  description: null | string;
  id: number;
  isActive: boolean;
  name: string;
}

interface TypesTableProps {
  items: TypeRow[];
}

export function TypesTable({ items }: TypesTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [_rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns: ColumnDef<TypeRow>[] = [
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
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="block max-w-50 truncate">{row.original.description || "—"}</span>,
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
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/types/${row.original.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            {row.original.isActive ? (
              <DropdownMenuItem
                onClick={async () => {
                  await deleteTypeAction(row.original.id);
                  router.refresh();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={async () => {
                  await restoreTypeAction(row.original.id);
                  router.refresh();
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleBulkDelete = async () => {
    await bulkDeleteTypesAction(selectedIds);
    setSelectedIds([]);
    setRowSelection({});
    router.refresh();
  };

  const handleBulkRestore = async () => {
    await bulkRestoreTypesAction(selectedIds);
    setSelectedIds([]);
    setRowSelection({});
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="bg-muted flex items-center gap-2 rounded p-2">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button onClick={handleBulkDelete} size="sm" variant="destructive">
            Deactivate Selected
          </Button>
          <Button onClick={handleBulkRestore} size="sm" variant="outline">
            Restore Selected
          </Button>
        </div>
      )}
      <DataTable columns={columns} data={items} searchKey="name" searchPlaceholder="Search types..." />
    </div>
  );
}
