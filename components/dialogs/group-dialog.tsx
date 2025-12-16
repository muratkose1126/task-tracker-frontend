"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateGroup } from "@/hooks/useGroups";
import { useQueryClient } from "@tanstack/react-query";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Name too long"),
  color: z.string().optional(),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface GroupDialogProps {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GroupDialog({ spaceId, open, onOpenChange, onSuccess }: GroupDialogProps) {
  const createGroup = useCreateGroup();
  const queryClient = useQueryClient();

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      color: "#8b5cf6",
    },
  });

  const onSubmit = async (data: GroupFormData) => {
    try {
      await createGroup.mutateAsync({ spaceId, data });
      toast.success("Group created successfully!");
      form.reset();
      // Small delay to ensure query is invalidated
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['groups', spaceId] });
        onSuccess?.();
        onOpenChange(false);
      }, 100);
    } catch (error) {
      toast.error("Failed to create group. Please try again.");
      console.error("Failed to create group:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Create a new group to organize your lists.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Q1 Campaign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" {...field} className="w-16 h-10" />
                      <Input value={field.value} onChange={field.onChange} placeholder="#8b5cf6" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createGroup.isPending}>
                {createGroup.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
