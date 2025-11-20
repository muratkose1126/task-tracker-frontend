/**
 * TasksList Component
 * Displays tasks in a table-like list layout
 */

import { Badge } from "@/components/ui/badge";
import { Calendar, Flag } from "lucide-react";
import { format } from "date-fns";
import { priorityConfig, statusConfig } from "@/lib/task-config";
import type { Task } from "@/types";

interface TasksListProps {
  tasks: Task[];
  onTaskClick: (taskId: number) => void;
}

export function TasksList({ tasks, onTaskClick }: TasksListProps) {
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border/50">
              <th className="text-left p-4 text-sm font-semibold text-foreground/80">
                Task
              </th>
              <th className="text-left p-4 text-sm font-semibold text-foreground/80 w-[140px]">
                Status
              </th>
              <th className="text-left p-4 text-sm font-semibold text-foreground/80 w-[120px]">
                Priority
              </th>
              <th className="text-left p-4 text-sm font-semibold text-foreground/80 w-[140px]">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const priority =
                priorityConfig[task.priority as keyof typeof priorityConfig];
              const status =
                statusConfig[task.status as keyof typeof statusConfig];

              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task.id)}
                  className={`${
                    index !== tasks.length - 1
                      ? "border-b border-border/30"
                      : ""
                  } hover:bg-muted/50 cursor-pointer transition-colors group`}
                >
                  {/* Task Title & Description */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={`${status.bg} ${status.color} border-0 text-xs font-semibold`}
                    >
                      {status.label}
                    </Badge>
                  </td>

                  {/* Priority */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Flag className={`h-4 w-4 ${priority.color}`} />
                      <span className={`text-sm font-medium ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="p-4">
                    {task.due_date ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(task.due_date), "MMM d, yyyy")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-40 text-center border-t border-border/30">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
