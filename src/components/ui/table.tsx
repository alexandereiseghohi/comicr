"use client";

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { atom, useAtom } from "jotai";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { createContext, memo, useCallback, useContext, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed import of aliased Table* components to avoid redeclaration conflicts
import { cn } from "@/lib/utils";

import type { Cell, Column, ColumnDef, Header, HeaderGroup, Row, SortingState, Table } from "@tanstack/react-table";
import type { HTMLAttributes, ReactNode } from "react";

export type { ColumnDef } from "@tanstack/react-table";

const sortingAtom = atom<SortingState>([]);

export const TableContext = createContext<{
  columns: ColumnDef<unknown, unknown>[];
  data: unknown[];
  table: null | Table<unknown>;
}>({
  data: [],
  columns: [],
  table: null,
});

export interface TableProviderProps<TData, TValue> {
  children: ReactNode;
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function TableProvider<TData, TValue>({
  columns,
  data,
  children,
  className,
}: TableProviderProps<TData, TValue>) {
  const [sorting, setSorting] = useAtom(sortingAtom);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      // @ts-expect-error updater is a function that returns a sorting object
      const newSorting = updater(sorting);

      setSorting(newSorting);
    },
    state: {
      sorting,
    },
  });

  return (
    <TableContext.Provider
      value={{
        data,
        columns: columns as never,
        table: table as never,
      }}
    >
      <TableRaw className={className}>{children}</TableRaw>
    </TableContext.Provider>
  );
}

export interface TableHeadProps {
  className?: string;
  header: Header<unknown, unknown>;
}

export const TableHead = memo(({ header, className }: TableHeadProps) => (
  <TableHeadRaw className={className} key={header.id}>
    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
  </TableHeadRaw>
));

TableHead.displayName = "TableHead";

export interface TableHeaderGroupProps {
  children: (props: { header: Header<unknown, unknown> }) => ReactNode;
  headerGroup: HeaderGroup<unknown>;
}

export const TableHeaderGroup = ({ headerGroup, children }: TableHeaderGroupProps) => (
  <TableRowRaw key={headerGroup.id}>{headerGroup.headers.map((header) => children({ header }))}</TableRowRaw>
);

export interface TableHeaderProps {
  children: (props: { headerGroup: HeaderGroup<unknown> }) => ReactNode;
  className?: string;
}

export const TableHeader = ({ className, children }: TableHeaderProps) => {
  const { table } = useContext(TableContext);

  return (
    <TableHeaderRaw className={className}>
      {table?.getHeaderGroups().map((headerGroup) => children({ headerGroup }))}
    </TableHeaderRaw>
  );
};

export interface TableColumnHeaderProps<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function TableColumnHeader<TData, TValue>({ column, title, className }: TableColumnHeaderProps<TData, TValue>) {
  // Extract inline event handlers to prevent unnecessary re-renders
  const handleSortAsc = useCallback(() => {
    column.toggleSorting(false);
  }, [column]);

  const handleSortDesc = useCallback(() => {
    column.toggleSorting(true);
  }, [column]);

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2 rtl:space-x-reverse", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="data-[state=open]:bg-accent -ms-3 h-8" size="sm" variant="ghost">
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ms-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ms-2 h-4 w-4" />
            ) : (
              <ChevronsUpDownIcon className="ms-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleSortAsc}>
            <ArrowUpIcon className="text-muted-foreground/70 me-2 h-3.5 w-3.5" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSortDesc}>
            <ArrowDownIcon className="text-muted-foreground/70 me-2 h-3.5 w-3.5" />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export interface TableCellProps {
  cell: Cell<unknown, unknown>;
  className?: string;
}

export const TableCell = ({ cell, className }: TableCellProps) => (
  <TableCellRaw className={className}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCellRaw>
);

export interface TableRowProps {
  children: (props: { cell: Cell<unknown, unknown> }) => ReactNode;
  className?: string;
  row: Row<unknown>;
}

export const TableRow = ({ row, children, className }: TableRowProps) => (
  <TableRowRaw className={className} data-state={row.getIsSelected() && "selected"} key={row.id}>
    {row.getVisibleCells().map((cell) => children({ cell }))}
  </TableRowRaw>
);

export interface TableBodyProps {
  children: (props: { row: Row<unknown> }) => ReactNode;
  className?: string;
}

export const TableBody = ({ children, className }: TableBodyProps) => {
  const { columns, table } = useContext(TableContext);
  const rows = table?.getRowModel().rows;

  return (
    <TableBodyRaw className={className}>
      {rows?.length ? (
        rows.map((row) => children({ row }))
      ) : (
        <TableRowRaw>
          <TableCellRaw className="h-24 text-center" colSpan={columns.length}>
            No results.
          </TableCellRaw>
        </TableRowRaw>
      )}
    </TableBodyRaw>
  );
};

// Demo
type DemoUser = {
  email: string;
  id: string;
  name: string;
  role: string;
  status: "active" | "inactive";
};

const demoData: DemoUser[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "Developer", status: "active" },
  { id: "3", name: "Carol White", email: "carol@example.com", role: "Designer", status: "active" },
  {
    id: "4",
    name: "David Brown",
    email: "david@example.com",
    role: "Developer",
    status: "inactive",
  },
  { id: "5", name: "Eve Davis", email: "eve@example.com", role: "Manager", status: "active" },
  {
    id: "6",
    name: "Frank Miller",
    email: "frank@example.com",
    role: "Developer",
    status: "active",
  },
  {
    id: "7",
    name: "Grace Wilson",
    email: "grace@example.com",
    role: "Designer",
    status: "inactive",
  },
  { id: "8", name: "Henry Taylor", email: "henry@example.com", role: "Admin", status: "active" },
];

const demoColumns: ColumnDef<DemoUser, string>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <TableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <TableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <TableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => <div>{row.getValue("role")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div
          className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
            status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          )}
        >
          {status}
        </div>
      );
    },
  },
];

export function TableDemo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-muted/50 h-96 w-full max-w-4xl animate-pulse rounded-lg" />;
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-lg border">
        <TableProvider columns={demoColumns} data={demoData}>
          <TableHeader>
            {({ headerGroup }) => (
              <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
                {({ header }) => <TableHead header={header} key={header.id} />}
              </TableHeaderGroup>
            )}
          </TableHeader>
          <TableBody>
            {({ row }) => (
              <TableRow key={row.id} row={row}>
                {({ cell }) => <TableCell cell={cell} key={cell.id} />}
              </TableRow>
            )}
          </TableBody>
        </TableProvider>
      </div>
    </div>
  );
}

// Fallback table element wrappers for missing raw components
const TableRaw = ({ className, children }: { children: React.ReactNode; className?: string }) => (
  <table className={className}>{children}</table>
);
const TableHeadRaw = ({ className, children, ...props }: { children: React.ReactNode; className?: string }) => (
  <thead className={className} {...props}>
    {children}
  </thead>
);
const TableHeaderRaw = ({ className, children, ...props }: { children: React.ReactNode; className?: string }) => (
  <thead className={className} {...props}>
    {children}
  </thead>
);
const TableRowRaw = ({ className, children, ...props }: { children: React.ReactNode; className?: string }) => (
  <tr className={className} {...props}>
    {children}
  </tr>
);
interface TableCellRawProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
}
const TableCellRaw = ({ className, children, ...props }: TableCellRawProps) => (
  <td className={className} {...props}>
    {children}
  </td>
);
const TableBodyRaw = ({ className, children, ...props }: { children: React.ReactNode; className?: string }) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);
