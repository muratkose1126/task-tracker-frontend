/**
 * TaskDetailModal Component
 * Displays task details in modal (title, description, metadata, comments, attachments)
 */

"use client";

import { useState } from "react";
import { Calendar, Trash2, Edit2, Loader } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { priorityConfig, statusConfig } from "@/lib/task-config";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { TaskForm } from "./task-form";
import type { Task, TaskFormData } from "@/types";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  if (!task) return null;

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
  const status = statusConfig[task.status as keyof typeof statusConfig];

  const handleUpdate = async (data: TaskFormData) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data,
      });
      // Only update state if component is still mounted
      if (open) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask.mutateAsync(task.id);
      // Only update state if component is still mounted
      if (open) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <DialogHeader>
            <DialogDescription className="sr-only">
              View and manage task information including status, priority, and
              due date.
            </DialogDescription>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{task.title}</DialogTitle>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span
                    className={`text-xs font-bold ${status.color} px-2.5 py-1 rounded-full ${status.bg}`}
                  >
                    {status.label}
                  </span>
                  <span className={`text-xs font-bold ${priority.color}`}>
                    {priority.label} Priority
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={updateTask.isPending || deleteTask.isPending}
                  title="Edit task"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                  title="Delete task"
                >
                  {deleteTask.isPending ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {isEditing && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Edit Task</h3>
              <TaskForm
                projectId={task.project_id}
                userId={task.user_id}
                onSubmit={handleUpdate}
                loading={updateTask.isPending}
              />
            </div>
          )}

          {!isEditing && (
            <>
              {/* Description */}
              {task.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid gap-4 md:grid-cols-2">
                {task.due_date && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </h3>
                    <p className="text-sm">
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-semibold">Created</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(task.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold">Comments (0)</h3>
                <div className="bg-muted/30 rounded-lg p-4 text-center text-sm text-muted-foreground">
                  No comments yet. Comment feature coming soon.
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold">Attachments (0)</h3>
                <div className="bg-muted/30 rounded-lg p-4 text-center text-sm text-muted-foreground">
                  No attachments yet. File uploads coming soon.
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
