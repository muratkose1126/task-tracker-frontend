"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flag } from "lucide-react";
import { format } from "date-fns";
import { priorityConfig, statusConfig } from "@/lib/task-config";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onDelete?: (id: number) => void;
}

export function TaskCard({ task }: TaskCardProps) {
  const priority = priorityConfig[(task.priority || 'medium') as keyof typeof priorityConfig];
  const status = statusConfig[(task.status || 'todo') as keyof typeof statusConfig];

  return (
    <Card className="group relative overflow-hidden border-0 bg-card/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardContent className="relative p-4">
        {/* Header with Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge
            variant="secondary"
            className={`${status.bg} ${status.color} border-0 text-xs font-semibold`}
          >
            {status.label}
          </Badge>
          <div className="flex items-center gap-1.5">
            <Flag className={`h-3.5 w-3.5 ${priority.color}`} />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
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
}

export default TaskCard;
