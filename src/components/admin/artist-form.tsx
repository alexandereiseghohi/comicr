"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createArtistAction, updateArtistAction } from "@/lib/actions/artist.actions";
import { createArtistSchema, updateArtistSchema } from "@/schemas/artist-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUploadField } from "./image-upload-field";

type CreateFormValues = z.infer<typeof createArtistSchema>;
type UpdateFormValues = z.infer<typeof updateArtistSchema>;

interface ArtistFormProps {
  artist?: {
    id: number;
    name: string;
    bio: string | null;
    image: string | null;
    isActive: boolean;
  };
}

export function ArtistForm({ artist }: ArtistFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!artist;

  const form = useForm<CreateFormValues | UpdateFormValues>({
    resolver: zodResolver(isEditing ? updateArtistSchema : createArtistSchema),
    defaultValues: {
      name: artist?.name ?? "",
      bio: artist?.bio ?? "",
      image: artist?.image ?? "",
      ...(isEditing && { isActive: artist?.isActive ?? true }),
    },
  });

  const onSubmit = async (data: CreateFormValues | UpdateFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateArtistAction(artist.id, data as UpdateFormValues);
      } else {
        await createArtistAction(data as CreateFormValues);
      }
      router.push("/admin/artists");
      router.refresh();
    } catch {
      // Error handled by action
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Artist" : "Create Artist"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Artist name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Artist biography..."
                      rows={4}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      label="Artist Image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Inactive artists won&apos;t appear in public listings
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Update Artist" : "Create Artist"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
