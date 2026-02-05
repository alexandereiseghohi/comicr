"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  rectIntersection,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

interface Status {
  id: string;
  name: string;
  color: string;
}

interface Feature {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
}

export interface ListItemsProps {
  children: ReactNode;
  className?: string;
}

export const ListItems = ({ children, className }: ListItemsProps) => (
  <div className={cn("flex flex-1 flex-col gap-2 p-3", className)}>{children}</div>
);

export type ListHeaderProps =
  | {
      children: ReactNode;
    }
  | {
      name: Status["name"];
      color: Status["color"];
      className?: string;
    };

export const ListHeader = (props: ListHeaderProps) =>
  "children" in props ? (
    props.children
  ) : (
    <div className={cn("flex shrink-0 items-center gap-2 bg-foreground/5 p-3", props.className)}>
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: props.color }} />
      <p className="m-0 font-semibold text-sm">{props.name}</p>
    </div>
  );

export interface ListGroupProps {
  id: Status["id"];
  children: ReactNode;
  className?: string;
}

export const ListGroup = ({ id, children, className }: ListGroupProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className={cn("bg-secondary transition-colors", isOver && "bg-foreground/10", className)} ref={setNodeRef}>
      {children}
    </div>
  );
};

export type ListItemProps = Pick<Feature, "id" | "name"> & {
  readonly index: number;
  readonly parent: string;
  readonly children?: ReactNode;
  readonly className?: string;
};

export const ListItem = ({ id, name, index, parent, children, className }: ListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { index, parent },
  });

  return (
    <div
      className={cn(
        "flex cursor-grab items-center gap-2 rounded-md border bg-background p-2 shadow-sm",
        isDragging && "opacity-50",
        className
      )}
      style={{
        transform: transform ? `translateX(${transform.x}px) translateY(${transform.y}px)` : "none",
      }}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      {children ?? <p className="m-0 font-medium text-sm">{name}</p>}
    </div>
  );
};

export interface ListProviderProps {
  children: ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  className?: string;
}

export const ListProvider = ({ children, onDragEnd, className }: ListProviderProps) => (
  <DndContext collisionDetection={rectIntersection} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
    <div className={cn("flex size-full flex-col", className)}>{children}</div>
  </DndContext>
);

// Demo
import { useEffect, useState } from "react";

const initialData = {
  todo: [
    { id: "1", name: "Research competitors" },
    { id: "2", name: "Write documentation" },
  ],
  inProgress: [
    { id: "3", name: "Build dashboard" },
    { id: "4", name: "API integration" },
  ],
  done: [{ id: "5", name: "Setup project" }],
};

const statuses = [
  { id: "todo", name: "To Do", color: "#6b7280" },
  { id: "inProgress", name: "In Progress", color: "#3b82f6" },
  { id: "done", name: "Done", color: "#22c55e" },
];

export function Demo() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState(initialData);
  const [activeItem, setActiveItem] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    for (const groupItems of Object.values(items)) {
      const item = groupItems.find((item) => item.id === activeId);
      if (item) {
        setActiveItem(item);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source group
    let sourceGroup: keyof typeof items | null = null;
    let sourceIndex = -1;
    for (const [group, groupItems] of Object.entries(items)) {
      const idx = groupItems.findIndex((item) => item.id === activeId);
      if (idx !== -1) {
        sourceGroup = group as keyof typeof items;
        sourceIndex = idx;
        break;
      }
    }

    if (!sourceGroup || sourceIndex === -1) return;

    // Determine target group
    let targetGroup: keyof typeof items = overId as keyof typeof items;
    if (!statuses.find((s) => s.id === overId)) {
      // Dropped on an item, find its group
      for (const [group, groupItems] of Object.entries(items)) {
        if (groupItems.find((item) => item.id === overId)) {
          targetGroup = group as keyof typeof items;
          break;
        }
      }
    }

    if (sourceGroup === targetGroup) return;

    // Move item
    const item = items[sourceGroup][sourceIndex];
    setItems((prev) => ({
      ...prev,
      [sourceGroup]: prev[sourceGroup].filter((_, i) => i !== sourceIndex),
      [targetGroup]: [...prev[targetGroup], item],
    }));
  };

  if (!mounted) {
    return <div className="fixed inset-0 bg-muted/50 animate-pulse" />;
  }

  return (
    <div className="fixed inset-0 p-4 overflow-auto">
      <DndContext
        collisionDetection={rectIntersection}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex size-full flex-col gap-4 max-w-md mx-auto">
          {statuses.map((status) => (
            <ListGroup key={status.id} id={status.id} className="rounded-lg overflow-hidden">
              <ListHeader name={status.name} color={status.color} />
              <ListItems>
                {items[status.id as keyof typeof items].map((item, index) => (
                  <ListItem key={item.id} id={item.id} name={item.name} index={index} parent={status.id} />
                ))}
              </ListItems>
            </ListGroup>
          ))}
        </div>
        <DragOverlay>
          {activeItem ? (
            <div className="flex cursor-grabbing items-center gap-2 rounded-md border bg-background p-2 shadow-lg">
              <p className="m-0 font-medium text-sm">{activeItem.name}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
