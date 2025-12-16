"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/hooks/useTasks";

interface QuickAddTaskProps {
  listId: string;
  onTaskCreated?: () => void;
  initialOpen?: boolean;
  defaultStatus?: string;
  defaultPriority?: string;
}

export function QuickAddTask({ listId, onTaskCreated, initialOpen = false, defaultStatus = "todo", defaultPriority = "medium" }: QuickAddTaskProps) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  const [title, setTitle] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  const createTask = useCreateTask();

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // close when clicking outside (only when input is empty)
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!isOpen) return;
      if (!wrapperRef.current) return;
      const target = e.target as Node | null;
      if (target && !wrapperRef.current.contains(target)) {
        // only auto-close if there's no content (user didn't start typing)
        if (!title || title.trim() === "") {
          setIsOpen(false);
          setTitle("");
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setIsPending(true);
      if (!listId) {
        console.warn("QuickAdd requires a listId");
        return;
      }

      const data = { title, status: defaultStatus, priority: defaultPriority } as any;
      await createTask.mutateAsync({ listId: Number(listId), data });

      // Reset form and restore focus on next tick (avoid losing focus when list re-renders)
      setTitle("");
      setTimeout(() => {
        inputRef.current?.focus();
        // also select text if any
        if (inputRef.current) inputRef.current.select();
      }, 0);
      onTaskCreated?.();
      console.log("Task created via QuickAdd", { listId, title });
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setTitle("");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTitle("");
  };

  return (
    <div ref={wrapperRef}>
      {!isOpen ? (
        <div
          className="w-full flex items-center gap-2 py-1 cursor-pointer text-sm text-muted-foreground"
          onClick={() => setIsOpen(true)}
        >
          <div className="h-8 w-8 flex items-center justify-center text-muted-foreground">
            <Plus className="h-4 w-4" />
          </div>
          <div className="text-sm text-muted-foreground">Add task</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 py-0.5 w-full">
          <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 flex items-center justify-center">
            {isPending ? <span className="text-xs">...</span> : <Plus className="h-4 w-4" />}
          </Button>

          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task title"
            disabled={isPending}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 flex-1 bg-transparent"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
