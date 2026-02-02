import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

("use client");
const STATUSES = ["All", "Ongoing", "Completed", "Hiatus", "Dropped", "Season End", "Coming Soon"];
const SORT_OPTIONS = [
  { label: "Latest", value: "createdAt-desc" },
  { label: "Oldest", value: "createdAt-asc" },
  { label: "Most Viewed", value: "views-desc" },
  { label: "Highest Rated", value: "rating-desc" },
];

interface Genre {
  id: number;
  name: string;
  slug: string;
}

export function ComicFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt-desc");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresOpen, setGenresOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load genres on mount
  useEffect(() => {
    async function loadGenres() {
      try {
        const response = await fetch("/api/genres");
        if (response.ok) {
          const data = await response.json();
          setGenres(data.genres || []);
        }
      } catch (error) {
        console.error("Failed to load genres:", error);
      } finally {
        setLoading(false);
      }
    }
    loadGenres();
  }, []);

  // Initialize selected genres from URL
  useEffect(() => {
    const genresParam = searchParams.get("genres");
    if (genresParam) {
      setSelectedGenres(genresParam.split(","));
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "All") params.set("status", status);
    if (selectedGenres.length > 0) params.set("genres", selectedGenres.join(","));
    if (sort) params.set("sort", sort);
    params.set("page", "1");

    router.push(`/comics?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("All");
    setSelectedGenres([]);
    setSort("createdAt-desc");
    router.push("/comics");
  };

  const toggleGenre = (slug: string) => {
    setSelectedGenres((prev) => (prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]));
  };

  return (
    <form className="space-y-4 rounded-lg bg-slate-50 p-6" onSubmit={handleSearch}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Search */}
        <div className="md:col-span-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
          <div className="relative">
            <Input
              className="pl-10"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comics by title..."
              value={search}
            />
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Genre Filter */}
        <div className="md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-slate-700">Genres</label>
          <Popover onOpenChange={setGenresOpen} open={genresOpen}>
            <PopoverTrigger asChild>
              <Button
                className={cn("w-full justify-between", !selectedGenres.length && "text-slate-500")}
                role="combobox"
                variant="outline"
              >
                {selectedGenres.length > 0
                  ? `${selectedGenres.length} selected`
                  : loading
                    ? "Loading..."
                    : "Select genres"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[300px] p-0">
              <div className="max-h-[300px] space-y-2 overflow-y-auto p-4">
                {loading ? (
                  <div className="py-4 text-center text-sm text-slate-500">Loading genres...</div>
                ) : genres.length === 0 ? (
                  <div className="py-4 text-center text-sm text-slate-500">No genres found</div>
                ) : (
                  genres.map((genre) => (
                    <div className="flex items-center space-x-2" key={genre.slug}>
                      <Checkbox
                        checked={selectedGenres.includes(genre.slug)}
                        id={`genre-${genre.slug}`}
                        onCheckedChange={() => toggleGenre(genre.slug)}
                      />
                      <Label className="flex-1 cursor-pointer text-sm font-normal" htmlFor={`genre-${genre.slug}`}>
                        {genre.name}
                      </Label>
                      {selectedGenres.includes(genre.slug) && <Check className="h-4 w-4 text-emerald-600" />}
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Sort By</label>
          <Select onValueChange={setSort} value={sort}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={handleClear} type="button" variant="outline">
          Clear
        </Button>
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
}
