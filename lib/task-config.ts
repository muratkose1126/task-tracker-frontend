/**
 * Task Configuration
 * Merkezi yer: Priority, Status, Task tipi configs
 */

export const priorityConfig = {
  low: {
    label: "Low",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    value: "low",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    value: "medium",
  },
  high: {
    label: "High",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    value: "high",
  },
} as const;

export const statusConfig = {
  todo: {
    label: "To Do",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10",
    value: "todo",
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    value: "in_progress",
  },
  done: {
    label: "Done",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    value: "done",
  },
} as const;

export const kanbanColumns = [
  { id: "todo", label: "To Do", color: "amber" },
  { id: "in_progress", label: "In Progress", color: "blue" },
  { id: "done", label: "Done", color: "green" },
] as const;

export type PriorityType = keyof typeof priorityConfig;
export type StatusType = keyof typeof statusConfig;
export type KanbanColumnType = (typeof kanbanColumns)[number];
