"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, List as ListIcon, Calendar, Columns } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TasksGrid } from "@/components/tasks/tasks-grid";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { TaskDialog } from "@/components/dialogs/task-dialog";
import { useAllWorkspaceTasks, useListTasks, useTaskLists, useDeleteTask } from "@/hooks/useTasks";
import { CalendarView } from "@/components/tasks/calendar-view";
import { KanbanView } from "@/components/tasks/kanban-view";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useQueryClient } from "@tanstack/react-query";

type ViewType = "list" | "calendar" | "grid" | "kanban";

interface TaskViewProps {
  workspaceId: string;
  spaceId?: string | null;
  groupId?: string | null;
  listId?: string | null;
  title?: string;
}

export default function TaskView({ workspaceId, spaceId, groupId, listId, title }: TaskViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [view, setView] = React.useState<ViewType>("list");
  const [groupBy, setGroupBy] = React.useState<string>(() => searchParams.get("groupBy") || "status");
  const [groupOrder, setGroupOrder] = React.useState<"asc" | "desc">(() => (searchParams.get("groupOrder") as any) || "asc");
  const [alsoGroupByList, setAlsoGroupByList] = React.useState<boolean>(() => {
    const v = searchParams.get("alsoGroupByList");
    return v === "1" || v === "true";
  });
  const [showTaskDialog, setShowTaskDialog] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<any>(null);
  const [quickAddOpen, setQuickAddOpen] = React.useState(() => searchParams.get("quickAdd") === "true");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<any>(null);

  // Mutations
  const deleteTask = useDeleteTask();

  // Data
  const { data: allTasks = [], isLoading: allLoading } = useAllWorkspaceTasks();
  const { data: lists = [] } = useTaskLists(spaceId || "");

  // If listId provided, prefer server call for that list
  const listTasksQuery = listId ? useListTasks(Number(listId)) : null;
  // Compute tasks to show
  const tasks = React.useMemo(() => {
    if (listId && listTasksQuery) {
      return listTasksQuery.data || [];
    }

    // otherwise filter allTasks by spaceId or groupId
    let pool = Array.isArray(allTasks) ? allTasks : [];

    if (groupId && lists.length > 0) {
      const listIds = lists.filter((l: any) => String(l.group_id) === String(groupId)).map((l: any) => Number(l.id));
      return pool.filter((t: any) => listIds.includes(Number(t.list_id)));
    }

    if (spaceId && lists.length > 0) {
      const listIds = lists.map((l: any) => Number(l.id));
      return pool.filter((t: any) => listIds.includes(Number(t.list_id)));
    }

    return pool;
  }, [allTasks, lists, spaceId, groupId, listId, listTasksQuery]);

  const isLoading = listTasksQuery ? listTasksQuery.isLoading : allLoading;

  // Apply URL-based filters (status, priority)
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    let filtered = [...tasks];

    const statusFilter = searchParams.get("status");
    if (statusFilter) {
      const statuses = statusFilter.split(",");
      filtered = filtered.filter((task) => statuses.includes(task.status));
    }

    const priorityFilter = searchParams.get("priority");
    if (priorityFilter) {
      const priorities = priorityFilter.split(",");
      filtered = filtered.filter((task) => priorities.includes(task.priority));
    }

    return filtered;
  }, [tasks, searchParams]);

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const queryClient = useQueryClient();

  const handleTaskCreated = React.useCallback(() => {
    if (listId) {
      listTasksQuery?.refetch?.();
    }
    queryClient.invalidateQueries({ queryKey: ['tasks', 'all'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [listId, listTasksQuery, queryClient]);

  const handleTaskDelete = React.useCallback((taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setDeleteDialogOpen(true);
    }
  }, [tasks]);

  // Persist group controls to URL (merge with existing params)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(Array.from(searchParams.entries()));

      if (groupBy && groupBy !== "") params.set("groupBy", groupBy);
      else params.delete("groupBy");

      if (groupOrder) params.set("groupOrder", groupOrder);
      else params.delete("groupOrder");

      if (alsoGroupByList) params.set("alsoGroupByList", "1");
      else params.delete("alsoGroupByList");

      const qs = params.toString();
      const currentQs = searchParams.toString();
      // only navigate if the final querystring would change
      if (qs !== currentQs) {
        // use replace to avoid spamming history with tiny UI changes
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      }
    } catch (err) {
      // ignore URL building errors
    }
  }, [groupBy, groupOrder, alsoGroupByList, router, pathname, searchParams]);

  const handleCloseDialog = (open?: boolean) => {
    if (open === false || open === undefined) {
      setShowTaskDialog(false);
      setSelectedTask(null);
    } else {
      setShowTaskDialog(Boolean(open));
    }
  };

  const emptyMessage = (() => {
    if (listId) return "No tasks in this list";
    if (groupId) return "No tasks in this group";
    if (spaceId) return "No tasks in this space";
    return "No tasks in this workspace";
  })();

  return (
    <div className="space-y-6">

      {/* Tabs for View Selection, Group By & Filters */}
      <div className="flex items-center justify-between">
        <div>
          <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
            <TabsList>
              <TabsTrigger value="list">
                <ListIcon className="h-4 w-4 mr-1" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <Columns className="h-4 w-4 mr-1" />
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Group</Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-2">Group by</div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="groupBy" value="status" checked={groupBy === "status"} onChange={() => setGroupBy("status")} />
                      <span className="text-sm">Status</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="groupBy" value="assignee" checked={groupBy === "assignee"} onChange={() => setGroupBy("assignee")} />
                      <span className="text-sm">Assignee</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="groupBy" value="priority" checked={groupBy === "priority"} onChange={() => setGroupBy("priority")} />
                      <span className="text-sm">Priority</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="groupBy" value="none" checked={groupBy === "none"} onChange={() => setGroupBy("none")} />
                      <span className="text-sm">No grouping</span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Order</div>
                  <select value={groupOrder} onChange={(e) => setGroupOrder(e.target.value as any)} className="rounded-md border px-2 py-1 text-sm">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                {!listId && (
                  <div className="flex items-center gap-2">
                    <input id="alsoGroup" type="checkbox" checked={alsoGroupByList} onChange={(e) => setAlsoGroupByList(e.target.checked)} />
                    <label htmlFor="alsoGroup" className="text-sm">Also group by List</label>
                  </div>
                )}

              </div>
            </PopoverContent>
          </Popover>

          <TaskFilters />

          <Button size="sm" onClick={() => setShowTaskDialog(true)}> <Plus className="mr-2 h-4 w-4" />New Task</Button>
        </div>
      </div>

      {/* View Content */}
      <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
        <TabsContent value="list">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">{emptyMessage}</p>
              {listId ? (
                <div className="max-w-md mx-auto">
                  <QuickAddTask listId={String(listId)} onTaskCreated={handleTaskCreated} initialOpen={quickAddOpen} />
                </div>
              ) : (
                <Button variant="outline" onClick={() => setShowTaskDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first task
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
          {(() => {
            if (groupBy === "status") {
              const statusOrder = ["todo", "in_progress", "done"];
              const statusLabels: Record<string, string> = {
                todo: "TO DO",
                in_progress: "IN PROGRESS",
                done: "DONE",
              };

              // If also grouping by list (and we're not already viewing a single list), group by list first
              if (alsoGroupByList && !listId) {
                // Determine lists in current context (group or space). Fallback to lists referenced in tasks.
                let listsInContext = lists || [];
                if (groupId && listsInContext.length > 0) {
                  listsInContext = listsInContext.filter((l: any) => String(l.group_id) === String(groupId));
                }

                // Build map listId -> tasks
                const tasksByList: Record<string, any[]> = {};
                filteredTasks.forEach((t) => {
                  const lid = String(t.list_id || "unknown");
                  if (!tasksByList[lid]) tasksByList[lid] = [];
                  tasksByList[lid].push(t);
                });

                // Include any lists present in listsInContext and also any lists discovered from tasks
                const listIds = new Set<string>([...Object.keys(tasksByList), ...(listsInContext.map((l: any) => String(l.id)))]);

                return Array.from(listIds).map((lid) => {
                  const listObj = listsInContext.find((l: any) => String(l.id) === String(lid));
                  const listName = listObj?.name || `List ${lid}`;
                  const tasksOfList = tasksByList[lid] || [];

                  // group by status inside this list
                  const innerGroups: Record<string, any[]> = {};
                  tasksOfList.forEach((t) => {
                    const s = t.status || "todo";
                    if (!innerGroups[s]) innerGroups[s] = [];
                    innerGroups[s].push(t);
                  });

                  return (
                    <div key={`list-${lid}`} className="space-y-4">
                      <div className="text-sm font-medium px-2">{listName} <span className="text-muted-foreground">{tasksOfList.length}</span></div>
                      {statusOrder.map((s) => {
                        const items = innerGroups[s] || [];
                        return (
                          <div key={`l-${lid}-s-${s}`} className="rounded-lg border overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-muted/10">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className={`h-3 w-3 rounded-full ${
                                    s === "done" ? "bg-green-500" : s === "in_progress" ? "bg-blue-500" : "bg-gray-400"
                                  }`} />
                                  <span className="font-medium">{statusLabels[s]}</span>
                                  <span className="text-sm text-muted-foreground">{items.length}</span>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground"> </div>
                            </div>

                            <div className="px-4 py-2">
                              <div className="flex items-center text-sm text-muted-foreground border-b pb-2">
                                <div className="w-6" />
                                <div className="flex-1">Name</div>
                                <div className="w-40 text-right">Assignee</div>
                                <div className="w-36 text-right">Due date</div>
                                <div className="w-28 text-right">Priority</div>
                              </div>

                              <div className="mt-2">
                                {listId ? (
                                  <QuickAddTask listId={listId} onTaskCreated={handleTaskCreated} initialOpen={quickAddOpen} defaultStatus={s} />
                                ) : (
                                  <div className="text-xs text-muted-foreground py-2">&nbsp;</div>
                                )}

                                {items.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-center gap-4 px-2 py-3 border-t hover:bg-muted/50 cursor-pointer"
                                    onClick={() => handleEditTask(task)}
                                  >
                                    <div className="w-6">
                                      <div className="h-4 w-4 rounded-full border" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{task.title}</div>
                                      {task.description && <div className="text-sm text-muted-foreground mt-1">{task.description}</div>}
                                    </div>
                                    <div className="w-40 text-right text-sm">—</div>
                                    <div className="w-36 text-right text-sm">{task.due_date || "—"}</div>
                                    <div className="w-28 text-right">
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        task.priority === "high"
                                          ? "bg-red-100 text-red-700"
                                          : task.priority === "low"
                                          ? "bg-orange-100 text-orange-700"
                                          : task.priority === "medium"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}>{task.priority || "—"}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              }

              const groups: Record<string, any[]> = {};
              filteredTasks.forEach((t) => {
                const s = t.status || "todo";
                if (!groups[s]) groups[s] = [];
                groups[s].push(t);
              });

              return statusOrder.map((s) => {
                const items = groups[s] || [];
                return (
                  <div key={s} className="rounded-lg border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${
                            s === "done" ? "bg-green-500" : s === "in_progress" ? "bg-blue-500" : "bg-gray-400"
                          }`} />
                          <span className="font-medium">{statusLabels[s]}</span>
                          <span className="text-sm text-muted-foreground">{items.length}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground"> </div>
                    </div>

                    <div className="px-4 py-2">
                      <div className="flex items-center text-sm text-muted-foreground border-b pb-2">
                        <div className="w-6" />
                        <div className="flex-1">Name</div>
                        <div className="w-40 text-right">Assignee</div>
                        <div className="w-36 text-right">Due date</div>
                        <div className="w-28 text-right">Priority</div>
                      </div>

                      <div className="mt-2">
                        {listId ? (
                          <QuickAddTask listId={listId} onTaskCreated={handleTaskCreated} initialOpen={quickAddOpen} defaultStatus={s} />
                        ) : (
                          <div
                            className="flex items-center gap-4 px-2 py-2 hover:bg-muted/50 cursor-pointer"
                            onClick={() => setShowTaskDialog(true)}
                          >
                            <div className="w-6">+</div>
                            <div className="flex-1 text-sm text-muted-foreground">Add Task</div>
                            <div className="w-40" />
                            <div className="w-36" />
                            <div className="w-28" />
                          </div>
                        )}

                        {items.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-4 px-2 py-3 border-t hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleEditTask(task)}
                          >
                            <div className="w-6">
                              <div className="h-4 w-4 rounded-full border" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{task.title}</div>
                              {task.description && <div className="text-sm text-muted-foreground mt-1">{task.description}</div>}
                            </div>
                            <div className="w-40 text-right text-sm">—</div>
                            <div className="w-36 text-right text-sm">{task.due_date || "—"}</div>
                            <div className="w-28 text-right">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "low"
                                  ? "bg-orange-100 text-orange-700"
                                  : task.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>{task.priority || "—"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              });
            }

            // Generic grouping (assignee / priority) or no grouping
            if (groupBy === "none") {
              // If user also wants grouping by list and we're not already in a list view,
              // group tasks by their list first, otherwise show a flat list.
              if (alsoGroupByList && !listId) {
                const tasksByList: Record<string, any[]> = {};
                filteredTasks.forEach((t) => {
                  const lid = String(t.list_id || "unknown");
                  if (!tasksByList[lid]) tasksByList[lid] = [];
                  tasksByList[lid].push(t);
                });

                const listIds = Object.keys(tasksByList);

                return (
                  <div className="space-y-4">
                    {listIds.map((lid) => {
                      const listObj = lists.find((l: any) => String(l.id) === String(lid));
                      const listName = listObj?.name || `List ${lid}`;
                      const items = tasksByList[lid] || [];

                      return (
                        <div key={`list-${lid}`} className="rounded-lg border overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 bg-muted/10">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{listName}</span>
                              <span className="text-sm text-muted-foreground">{items.length}</span>
                            </div>
                            <div className="text-sm text-muted-foreground"> </div>
                          </div>

                          <div className="px-4 py-2">
                            <div className="flex items-center text-sm text-muted-foreground border-b pb-2">
                              <div className="w-6" />
                              <div className="flex-1">Name</div>
                              <div className="w-40 text-right">Assignee</div>
                              <div className="w-36 text-right">Due date</div>
                              <div className="w-28 text-right">Priority</div>
                            </div>

                            <div className="mt-2">
                              <QuickAddTask listId={String(lid)} onTaskCreated={handleTaskCreated} initialOpen={quickAddOpen && String(listId) === String(lid)} />

                              {items.map((task) => (
                                <div
                                  key={task.id}
                                  className="flex items-center gap-4 px-2 py-3 border-t hover:bg-muted/50 cursor-pointer"
                                  onClick={() => handleEditTask(task)}
                                >
                                  <div className="w-6">
                                    <div className="h-4 w-4 rounded-full border" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{task.title}</div>
                                    {task.description && <div className="text-sm text-muted-foreground mt-1">{task.description}</div>}
                                  </div>
                                  <div className="w-40 text-right text-sm">—</div>
                                  <div className="w-36 text-right text-sm">{task.due_date || "—"}</div>
                                  <div className="w-28 text-right">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      task.priority === "high"
                                        ? "bg-red-100 text-red-700"
                                        : task.priority === "low"
                                        ? "bg-orange-100 text-orange-700"
                                        : task.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}>{task.priority || "—"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // flat list
              return (
                <div className="rounded-lg border overflow-hidden">
                  <div className="px-4 py-2">
                    <div className="flex items-center text-sm text-muted-foreground border-b pb-2">
                      <div className="w-6" />
                      <div className="flex-1">Name</div>
                      <div className="w-40 text-right">Assignee</div>
                      <div className="w-36 text-right">Due date</div>
                      <div className="w-28 text-right">Priority</div>
                    </div>

                    <div className="mt-2">
                      {listId ? (
                        <QuickAddTask listId={listId} onTaskCreated={handleTaskCreated} initialOpen={quickAddOpen} />
                      ) : (
                        <div
                          className="flex items-center gap-4 px-2 py-2 hover:bg-muted/50 cursor-pointer"
                          onClick={() => setShowTaskDialog(true)}
                        >
                          <div className="w-6">+</div>
                          <div className="flex-1 text-sm text-muted-foreground">Add Task</div>
                          <div className="w-40" />
                          <div className="w-36" />
                          <div className="w-28" />
                        </div>
                      )}

                      {filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-4 px-2 py-3 border-t hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleEditTask(task)}
                        >
                          <div className="w-6">
                            <div className="h-4 w-4 rounded-full border" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{task.title}</div>
                            {task.description && <div className="text-sm text-muted-foreground mt-1">{task.description}</div>}
                          </div>
                          <div className="w-40 text-right text-sm">—</div>
                          <div className="w-36 text-right text-sm">{task.due_date || "—"}</div>
                          <div className="w-28 text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "low"
                                ? "bg-orange-100 text-orange-700"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>{task.priority || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // grouping by assignee or priority
            // If alsoGroupByList is set and we're not on a single list, then group by list first, then by selected key
            if (alsoGroupByList && !listId) {
              // build tasks by list
              const tasksByList: Record<string, any[]> = {};
              filteredTasks.forEach((t) => {
                const lid = String(t.list_id || "unknown");
                if (!tasksByList[lid]) tasksByList[lid] = [];
                tasksByList[lid].push(t);
              });

              const listIds = Object.keys(tasksByList);

              return listIds.map((lid) => {
                const listObj = lists.find((l: any) => String(l.id) === String(lid));
                const listName = listObj?.name || `List ${lid}`;

                // build inner groups
                const innerGroups: Record<string, any[]> = {};
                tasksByList[lid].forEach((t) => {
                  let key = "(none)";
                  if (groupBy === "assignee") key = t.assignee?.name || t.assignee || "Unassigned";
                  if (groupBy === "priority") key = t.priority || "No priority";
                  if (!innerGroups[key]) innerGroups[key] = [];
                  innerGroups[key].push(t);
                });

                return (
                  <div key={`list-${lid}`} className="space-y-4">
                    <div className="text-sm font-medium px-2">{listName} <span className="text-muted-foreground">{tasksByList[lid].length}</span></div>
                    {Object.keys(innerGroups).map((k) => (
                      <div key={k} className="rounded-lg border overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-muted/10">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{k}</span>
                            <span className="text-sm text-muted-foreground">{innerGroups[k].length}</span>
                          </div>
                          <div className="text-sm text-muted-foreground"> </div>
                        </div>

                        <div className="px-4 py-2">
                          <div className="flex items-center text-sm text-muted-foreground border-b pb-2">
                            <div className="w-6" />
                            <div className="flex-1">Name</div>
                            <div className="w-40 text-right">Assignee</div>
                            <div className="w-36 text-right">Due date</div>
                            <div className="w-28 text-right">Priority</div>
                          </div>

                          <div className="mt-2">
                            {listId ? (
                              <QuickAddTask listId={listId} onTaskCreated={handleTaskCreated} initialOpen={quickAddOpen} />
                            ) : (
                              <div className="text-xs text-muted-foreground py-2">&nbsp;</div>
                            )}

                            {innerGroups[k].map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center gap-4 px-2 py-3 border-t hover:bg-muted/50 cursor-pointer"
                                onClick={() => handleEditTask(task)}
                              >
                                <div className="w-6">
                                  <div className="h-4 w-4 rounded-full border" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{task.title}</div>
                                  {task.description && <div className="text-sm text-muted-foreground mt-1">{task.description}</div>}
                                </div>
                                <div className="w-40 text-right text-sm">—</div>
                                <div className="w-36 text-right text-sm">{task.due_date || "—"}</div>
                                <div className="w-28 text-right">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    task.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : task.priority === "low"
                                      ? "bg-orange-100 text-orange-700"
                                      : task.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}>{task.priority || "—"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              });
            }

            const groups: Record<string, any[]> = {};
            filteredTasks.forEach((t) => {
              let key = "(none)";
              if (groupBy === "assignee") key = "Unassigned";
              if (groupBy === "priority") key = t.priority || "No priority";
              if (!groups[key]) groups[key] = [];
              groups[key].push(t);
            });

            return Object.keys(groups).map((k) => (
              <div key={k} className="rounded-lg border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/10">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{k}</span>
                    <span className="text-sm text-muted-foreground">{groups[k].length}</span>
                  </div>
                  <div className="text-sm text-muted-foreground"> </div>
                </div>

                <div className="px-4 py-2">
                  <div className="flex items-center text-sm text-muted-foreground border-b pb-2">
                    <div className="w-6" />
                    <div className="flex-1">Name</div>
                    <div className="w-40 text-right">Assignee</div>
                    <div className="w-36 text-right">Due date</div>
                    <div className="w-28 text-right">Priority</div>
                  </div>

                  <div className="mt-2">
                    {listId ? (
                      <QuickAddTask listId={listId} onTaskCreated={handleTaskCreated} initialOpen={quickAddOpen} />
                    ) : (
                      <div
                        className="flex items-center gap-4 px-2 py-2 hover:bg-muted/50 cursor-pointer"
                        onClick={() => setShowTaskDialog(true)}
                      >
                        <div className="w-6">+</div>
                        <div className="flex-1 text-sm text-muted-foreground">Add Task</div>
                        <div className="w-40" />
                        <div className="w-36" />
                        <div className="w-28" />
                      </div>
                    )}

                    {groups[k].map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 px-2 py-3 border-t hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleEditTask(task)}
                      >
                        <div className="w-6">
                          <div className="h-4 w-4 rounded-full border" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{task.title}</div>
                          {task.description && <div className="text-sm text-muted-foreground mt-1">{task.description}</div>}
                        </div>
                        <div className="w-40 text-right text-sm">—</div>
                        <div className="w-36 text-right text-sm">{task.due_date || "—"}</div>
                        <div className="w-28 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "low"
                              ? "bg-orange-100 text-orange-700"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>{task.priority || "—"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ));
          })()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">{emptyMessage}</p>
              <Button variant="outline" onClick={() => setShowTaskDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first task
              </Button>
            </div>
          ) : (
            <CalendarView tasks={filteredTasks} onTaskClick={handleEditTask} />
          )}
        </TabsContent>

        <TabsContent value="kanban">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">{emptyMessage}</p>
              <Button variant="outline" onClick={() => setShowTaskDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first task
              </Button>
            </div>
          ) : (
            <KanbanView
              tasks={filteredTasks}
              groupBy={groupBy}
              groupOrder={groupOrder}
              listId={listId}
              quickAddOpen={quickAddOpen}
              onTaskClick={handleEditTask}
              onTaskCreated={handleTaskCreated}
            />
          )}
        </TabsContent>

        <TabsContent value="grid">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">{emptyMessage}</p>
              <Button variant="outline" onClick={() => setShowTaskDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first task
              </Button>
            </div>
          ) : (
            <TasksGrid tasks={filteredTasks} onTaskClick={handleEditTask} />
          )}
        </TabsContent>
      </Tabs>

      <TaskDialog
        task={selectedTask}
        open={showTaskDialog}
        onOpenChange={handleCloseDialog}
        listId={listId || undefined}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await deleteTask.mutateAsync(taskToDelete?.id);
                  toast.success("Task deleted successfully!");
                  setDeleteDialogOpen(false);
                  setTaskToDelete(null);
                  handleTaskCreated(); // Refetch tasks
                } catch (error) {
                  toast.error("Failed to delete task.");
                  console.error(error);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
