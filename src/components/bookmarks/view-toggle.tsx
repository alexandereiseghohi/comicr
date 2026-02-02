"use client";

import { LayoutGridIcon, ListIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  onChange: (value: ViewMode) => void;
  value: ViewMode;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      aria-label="View mode"
      onValueChange={(v) => v && onChange(v as ViewMode)}
      type="single"
      value={value}
    >
      <ToggleGroupItem aria-label="Grid view" value="grid">
        <LayoutGridIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="List view" value="list">
        <ListIcon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
