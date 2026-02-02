/**
 * Comic Edit Form
 * @description Client component for editing comic details
 */

"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateComicAction } from "@/lib/actions/admin.actions";

interface Comic {
  coverImage: null | string;
  createdAt: Date | null;
  description: null | string;
  id: number;
  rating: null | string;
  slug: string;
  status: null | string;
  title: string;
  views: null | number;
}

interface ComicEditFormProps {
  comic: Comic;
}

const COMIC_STATUSES = [
  "Ongoing",
  "Completed",
  "Hiatus",
  "Dropped",
  "Season End",
  "Coming Soon",
] as const;

export function ComicEditForm({ comic }: ComicEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<null | string>(null);

  const [formData, setFormData] = useState({
    title: comic.title,
    slug: comic.slug,
    description: comic.description ?? "",
    coverImage: comic.coverImage ?? "",
    status: comic.status ?? "Ongoing",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateComicAction(comic.id, {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        coverImage: formData.coverImage || null,
        status: formData.status as (typeof COMIC_STATUSES)[number],
      });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      router.push("/admin/comics");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the comic&apos;s title, slug, and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Comic title"
                  required
                  value={formData.title}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="comic-slug"
                  required
                  value={formData.slug}
                />
                <p className="text-muted-foreground text-sm">
                  URL-friendly identifier (e.g., my-comic-name)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Comic description..."
                  rows={6}
                  value={formData.description}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
              <CardDescription>Update the comic cover image URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://example.com/cover.jpg"
                  type="url"
                  value={formData.coverImage}
                />
              </div>

              {formData.coverImage && (
                <div className="relative aspect-2/3 w-32 overflow-hidden rounded-md border">
                  <Image
                    alt="Cover preview"
                    className="object-cover"
                    fill
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-cover.jpg";
                    }}
                    src={formData.coverImage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Set the publication status</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                value={formData.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {COMIC_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Read-only metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Views</span>
                <span className="font-medium">{comic.views?.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Rating</span>
                <span className="font-medium">{comic.rating ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Created</span>
                <span className="font-medium">
                  {comic.createdAt ? new Date(comic.createdAt).toLocaleDateString() : "Unknown"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button className="w-full" disabled={isPending} type="submit">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/comics">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Comics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
