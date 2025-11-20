/**
 * TasksGrid Component
 * Displays tasks in grid layout and opens modal on click
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flag } from "lucide-react";
import { format } from "date-fns";
import { priorityConfig, statusConfig } from "@/lib/task-config";
import type { Task } from "@/types";

interface TasksGridProps {
  tasks: Task[];
  onTaskClick: (taskId: number) => void;
}

export function TasksGrid({ tasks, onTaskClick }: TasksGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => {
        const priority =
          priorityConfig[task.priority as keyof typeof priorityConfig];
        const status = statusConfig[task.status as keyof typeof statusConfig];

        return (
          <Card
            key={task.id}
            onClick={() => onTaskClick(task.id)}
            className="group relative overflow-hidden border-0 bg-linear-to-br from-background to-muted/20 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="relative p-5 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <Badge
                  variant="secondary"
                  className={`${status.bg} ${status.color} border-0 text-xs font-semibold`}
                >
                  {status.label}
                </Badge>
                <div className={`rounded-lg ${priority.bg} p-2`}>
                  <Flag className={`h-4 w-4 ${priority.color}`} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {task.title}
              </h3>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                  {task.description}
                </p>
              )}

              {/* Meta Info - Bottom */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </div>

                {task.due_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(task.due_date), "MMM d")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
