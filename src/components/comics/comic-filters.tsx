"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    setSelectedGenres((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4 bg-slate-50 p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-5">
          <label className="text-sm font-medium text-slate-700 block mb-2">Search</label>
          <div className="relative">
            <Input
              placeholder="Search comics by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Genre Filter */}
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-slate-700 block mb-2">Genres</label>
          <Popover open={genresOpen} onOpenChange={setGenresOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn("w-full justify-between", !selectedGenres.length && "text-slate-500")}
              >
                {selectedGenres.length > 0
                  ? `${selectedGenres.length} selected`
                  : loading
                  ? "Loading..."
                  : "Select genres"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                {loading ? (
                  <div className="text-center text-sm text-slate-500 py-4">Loading genres...</div>
                ) : genres.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-4">No genres found</div>
                ) : (
                  genres.map((genre) => (
                    <div key={genre.slug} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre.slug}`}
                        checked={selectedGenres.includes(genre.slug)}
                        onCheckedChange={() => toggleGenre(genre.slug)}
                      />
                      <Label
                        htmlFor={`genre-${genre.slug}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {genre.name}
                      </Label>
                      {selectedGenres.includes(genre.slug) && (
                        <Check className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700 block mb-2">Status</label>
          <Select value={status} onValueChange={setStatus}>
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
          <label className="text-sm font-medium text-slate-700 block mb-2">Sort By</label>
          <Select value={sort} onValueChange={setSort}>
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

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
}
