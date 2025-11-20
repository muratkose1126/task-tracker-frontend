"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Project, ProjectFormData } from "@/types";

const projectFormSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void | Promise<void>;
  loading?: boolean;
  initialData?: Project | null;
  mode?: "create" | "update";
}

export function ProjectForm({
  onSubmit,
  loading = false,
  initialData = null,
  mode = "create",
}: ProjectFormProps) {
  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof projectFormSchema>) => {
    await onSubmit({
      name: values.name,
      description: values.description || undefined,
    });

    // Only reset on create mode
    if (mode === "create") {
      form.reset();
    }
  };

  const isUpdate = mode === "update";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
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
                  placeholder="Enter project description (optional)"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description for your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading
              ? isUpdate
                ? "Updating..."
                : "Creating..."
              : isUpdate
              ? "Update Project"
              : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ProjectForm;
