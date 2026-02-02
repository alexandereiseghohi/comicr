"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";

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
import { createTypeAction, updateTypeAction } from "@/lib/actions/type.actions";
import { createTypeSchema, updateTypeSchema } from "@/schemas/type-schema";

type CreateFormValues = z.infer<typeof createTypeSchema>;
type UpdateFormValues = z.infer<typeof updateTypeSchema>;

interface TypeFormProps {
  comicType?: {
    description: null | string;
    id: number;
    isActive: boolean;
    name: string;
  };
}

export function TypeForm({ comicType }: TypeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!comicType;

  const form = useForm<CreateFormValues | UpdateFormValues>({
    resolver: zodResolver(isEditing ? updateTypeSchema : createTypeSchema),
    defaultValues: {
      name: comicType?.name ?? "",
      description: comicType?.description ?? "",
      ...(isEditing && { isActive: comicType?.isActive ?? true }),
    },
  });

  const onSubmit = async (data: CreateFormValues | UpdateFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateTypeAction(comicType.id, data as UpdateFormValues);
      } else {
        await createTypeAction(data as CreateFormValues);
      }
      router.push("/admin/types");
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
        <CardTitle>{isEditing ? "Edit Type" : "Create Type"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Type name (e.g., Manga, Manhwa, Manhua)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type description..."
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
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
                      <p className="text-muted-foreground text-sm">
                        Inactive types won&apos;t appear in filters
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
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Saving..." : isEditing ? "Update Type" : "Create Type"}
              </Button>
              <Button onClick={() => router.back()} type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
