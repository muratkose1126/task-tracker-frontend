/**
 * KanbanBoard Component
 * Displays 3-column Kanban board (To Do, In Progress, Done)
 * Each task card is rendered using TaskCard component
 */

import { Card } from "@/components/ui/card";
import { TaskCard } from "@/components/tasks/task-card";
import { ListTodo, Clock, CheckCircle2 } from "lucide-react";
import type { Task } from "@/types";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (taskId: number) => void;
}

const columns = [
  {
    id: "todo",
    label: "To Do",
    icon: ListTodo,
    color: "amber",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: Clock,
    color: "blue",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "done",
    label: "Done",
    icon: CheckCircle2,
    color: "green",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-400",
  },
];

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {columns.map((column) => {
        const Icon = column.icon;
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <div key={column.id} className="space-y-3">
            {/* Column Header */}
            <div className="flex items-center gap-3 px-1">
              <div className={`rounded-lg ${column.bgColor} p-2`}>
                <Icon className={`h-4 w-4 ${column.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{column.label}</h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground bg-muted/80 rounded-full px-2.5 py-1">
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-2.5 min-h-[400px]">
              {columnTasks.length === 0 ? (
                <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <p className="text-sm text-muted-foreground">No tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task.id)}
                    className="cursor-pointer"
                  >
                    <TaskCard task={task} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
