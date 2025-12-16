"use client";

import React from "react";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import type { Task } from "@/types";

interface KanbanViewProps {
  tasks: Task[];
  groupBy?: string;
  groupOrder?: 'asc' | 'desc';
  listId?: string | null;
  quickAddOpen?: boolean;
  onTaskClick?: (taskId: number) => void;
  onTaskCreated?: () => void;
}

export function KanbanView({
  tasks,
  groupBy,
  groupOrder,
  listId,
  quickAddOpen = false,
  onTaskClick,
  onTaskCreated,
}: KanbanViewProps) {
  return (
    <div className="space-y-6">
      <KanbanBoard
        tasks={tasks}
        onTaskClick={onTaskClick}
        listId={listId}
        quickAddOpen={quickAddOpen}
        onTaskCreated={onTaskCreated}
      />
    </div>
  );
}
