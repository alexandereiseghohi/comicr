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
import { createAuthorAction, updateAuthorAction } from "@/lib/actions/author.actions";
import { createAuthorSchema, updateAuthorSchema } from "@/schemas/author-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUploadField } from "./image-upload-field";

type CreateFormValues = z.infer<typeof createAuthorSchema>;
type UpdateFormValues = z.infer<typeof updateAuthorSchema>;

interface AuthorFormProps {
  author?: {
    id: number;
    name: string;
    bio: string | null;
    image: string | null;
    isActive: boolean;
  };
}

export function AuthorForm({ author }: AuthorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!author;

  const form = useForm<CreateFormValues | UpdateFormValues>({
    resolver: zodResolver(isEditing ? updateAuthorSchema : createAuthorSchema),
    defaultValues: {
      name: author?.name ?? "",
      bio: author?.bio ?? "",
      image: author?.image ?? "",
      ...(isEditing && { isActive: author?.isActive ?? true }),
    },
  });

  const onSubmit = async (data: CreateFormValues | UpdateFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateAuthorAction(author.id, data as UpdateFormValues);
      } else {
        await createAuthorAction(data as CreateFormValues);
      }
      router.push("/admin/authors");
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
        <CardTitle>{isEditing ? "Edit Author" : "Create Author"}</CardTitle>
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
                    <Input placeholder="Author name" {...field} />
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
                      placeholder="Author biography..."
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
                      label="Author Image"
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
                        Inactive authors won&apos;t appear in public listings
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
                {isSubmitting ? "Saving..." : isEditing ? "Update Author" : "Create Author"}
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
