"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const STATUSES = ["All", "Ongoing", "Completed", "Hiatus", "Dropped", "Season End", "Coming Soon"];
const SORT_OPTIONS = [
  { label: "Latest", value: "createdAt-desc" },
  { label: "Oldest", value: "createdAt-asc" },
  { label: "Most Viewed", value: "views-desc" },
  { label: "Highest Rated", value: "rating-desc" },
];

export function ComicFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt-desc");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "All") params.set("status", status);
    if (sort) params.set("sort", sort);
    params.set("page", "1");

    router.push(`/comics?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("All");
    setSort("createdAt-desc");
    router.push("/comics");
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4 bg-slate-50 p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
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

        {/* Status Filter */}
        <div>
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
        <div>
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
