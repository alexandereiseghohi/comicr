"use client";
import { ArrowRightIcon, BookOpenIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResult {
  coverImage: null | string;
  id: number;
  rating: number;
  slug: string;
  status: string;
  title: string;
}

interface SearchModalProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comics/search?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data || []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    router.push(`/comics/${slug}`);
  };

  const handleViewAll = () => {
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <CommandDialog
      description="Search for comics by title"
      onOpenChange={onOpenChange}
      open={open}
      title="Search Comics"
    >
      <CommandInput onValueChange={setQuery} placeholder="Search comics..." value={query} />
      <CommandList>
        {loading && (
          <div className="space-y-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div className="flex items-center gap-3" key={i}>
                <Skeleton className="h-12 w-9 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <CommandEmpty>No comics found for &quot;{query}&quot;</CommandEmpty>
        )}

        {!loading && results.length > 0 && (
          <>
            <CommandGroup heading="Comics">
              {results.map((comic) => (
                <CommandItem
                  className="flex cursor-pointer items-center gap-3"
                  key={comic.id}
                  onSelect={() => handleSelect(comic.slug)}
                  value={comic.title}
                >
                  <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded">
                    {comic.coverImage ? (
                      <Image
                        alt={`Cover of ${comic.title}`}
                        className="object-cover"
                        fill
                        sizes="36px"
                        src={comic.coverImage}
                      />
                    ) : (
                      <div className="bg-muted flex h-full w-full items-center justify-center">
                        <BookOpenIcon className="text-muted-foreground h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{comic.title}</p>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Badge className="px-1 py-0 text-xs" variant="outline">
                        {comic.status}
                      </Badge>
                      <span>⭐ {comic.rating?.toFixed(1) ?? "N/A"}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            {query.trim() && (
              <CommandGroup>
                <CommandItem className="text-primary cursor-pointer justify-center" onSelect={handleViewAll}>
                  <span>View all results for &quot;{query}&quot;</span>
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </CommandItem>
              </CommandGroup>
            )}
          </>
        )}

        {!loading && !query && (
          <div className="text-muted-foreground py-6 text-center text-sm">
            <SearchIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Type to search comics...</p>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
