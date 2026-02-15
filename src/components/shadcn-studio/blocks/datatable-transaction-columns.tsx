import { EllipsisVerticalIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ColumnDef } from "@tanstack/react-table";

export type Item = {
  amount: number;
  avatar: string;
  avatarFallback: string;
  email: string;
  id: string;
  name: string;
  paidBy: "mastercard" | "visa";
  status: "failed" | "paid" | "pending" | "processing";
};

function RowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Edit item" className="flex rounded-full p-2" size="icon" variant="ghost">
          <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Duplicate</span>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="size-9">
          <AvatarImage alt="Hallie Richards" src={row.original.avatar} />
          <AvatarFallback className="text-xs">{row.original.avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-sm">
          <span className="text-card-foreground font-medium">{row.getValue("name")}</span>
          <span className="text-muted-foreground">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="bg-primary/10 text-primary rounded-sm px-1.5 capitalize">{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "paidBy",
    header: () => <span className="w-fit">Paid by</span>,
    cell: ({ row }) => (
      <img
        alt="Payment platform"
        className="w-10.5"
        src={
          row.getValue("paidBy") === "mastercard"
            ? "https://cdn.shadcnstudio.com/ss-assets/blocks/data-table/image-1.png"
            : "https://cdn.shadcnstudio.com/ss-assets/blocks/data-table/image-2.png"
        }
      />
    ),
  },
  {
    id: "actions",
    header: () => "Actions",
    cell: () => <RowActions />,
    size: 60,
    enableHiding: false,
  },
];
