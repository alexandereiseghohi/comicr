"use client";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

import { SearchModal } from "./search-modal";

export function SearchTrigger() {
  const [open, setOpen] = React.useState(false);

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button
        aria-label="Search comics"
        className="relative h-9 w-9 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
        size="sm"
        variant="outline"
      >
        <SearchIcon className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search comics...</span>
        <span className="sr-only xl:not-sr-only xl:absolute xl:top-1/2 xl:right-2 xl:-translate-y-1/2">
          <Kbd className="pointer-events-none hidden xl:inline-flex">⌘K</Kbd>
        </span>
      </Button>
      <SearchModal onOpenChange={setOpen} open={open} />
    </>
  );
}
