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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTaskList } from "@/hooks/useLists";
import { useGroups } from "@/hooks/useGroups";
import { useQueryClient } from "@tanstack/react-query";

const listSchema = z.object({
  name: z.string().min(1, "List name is required").max(100, "Name too long"),
  group_id: z.string().nullable().optional(),
});

type ListFormData = z.infer<typeof listSchema>;

interface ListDialogProps {
  spaceId: string;
  defaultGroupId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ListDialog({ 
  spaceId, 
  defaultGroupId,
  open, 
  onOpenChange,
  onSuccess
}: ListDialogProps) {
  const createList = useCreateTaskList();
  const queryClient = useQueryClient();
  const { data: groups } = useGroups(spaceId);

  const form = useForm<ListFormData>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      name: "",
      group_id: defaultGroupId || null,
    },
  });

  // Update group_id when defaultGroupId changes
  React.useEffect(() => {
    if (defaultGroupId !== undefined) {
      form.setValue("group_id", defaultGroupId);
    }
  }, [defaultGroupId, form]);

  const onSubmit = async (data: ListFormData) => {
    try {
      await createList.mutateAsync({ 
        spaceId, 
        data: {
          name: data.name,
          group_id: data.group_id && data.group_id !== "none" ? data.group_id : null,
        }
      });
      toast.success("List created successfully!");
      form.reset();
      // Small delay to ensure query is invalidated
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['lists', spaceId] });
        onSuccess?.();
        onOpenChange(false);
      }, 100);
    } catch (error) {
      toast.error("Failed to create list. Please try again.");
      console.error("Failed to create list:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create List</DialogTitle>
          <DialogDescription>
            Create a new list to manage your tasks.
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
                    <Input placeholder="Sprint 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="No group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No group</SelectItem>
                      {groups?.map((group) => (
                        <SelectItem key={group.id} value={String(group.id)}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optionally place this list in a group
                  </FormDescription>
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
              <Button type="submit" disabled={createList.isPending}>
                {createList.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
