"use client";

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
import { ArrowRightIcon, BookOpenIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  status: string;
  rating: number;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
      open={open}
      onOpenChange={onOpenChange}
      title="Search Comics"
      description="Search for comics by title"
    >
      <CommandInput placeholder="Search comics..." value={query} onValueChange={setQuery} />
      <CommandList>
        {loading && (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
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
                  key={comic.id}
                  value={comic.title}
                  onSelect={() => handleSelect(comic.slug)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded">
                    {comic.coverImage ? (
                      <Image
                        src={comic.coverImage}
                        alt={`Cover of ${comic.title}`}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{comic.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs px-1 py-0">
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
                <CommandItem
                  onSelect={handleViewAll}
                  className="justify-center text-primary cursor-pointer"
                >
                  <span>View all results for &quot;{query}&quot;</span>
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </CommandItem>
              </CommandGroup>
            )}
          </>
        )}

        {!loading && !query && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <SearchIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>Type to search comics...</p>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
