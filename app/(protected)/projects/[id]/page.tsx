"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/projects";
import { useProjectTasks, useCreateTask } from "@/hooks/useTasks";
import { PageContainer } from "@/components/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { TaskForm } from "@/components/tasks/task-form";
import { StatisticsCards } from "@/components/tasks/statistics-cards";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TasksGrid } from "@/components/tasks/tasks-grid";
import { TasksList } from "@/components/tasks/tasks-list";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import {
  ListTodo,
  Plus,
  Settings,
  LayoutGrid,
  Kanban,
  List,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TaskFormData } from "@/types";
import { useAuthStore } from "@/store/authStore";

type ViewMode = "kanban" | "grid" | "list";

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);
  const { user } = useAuthStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getProject(projectId),
    enabled: !!projectId,
  });

  const { data: tasks = [], isLoading: isLoadingTasks } =
    useProjectTasks(projectId);
  const createTask = useCreateTask();

  const isLoading = isLoadingProject || isLoadingTasks;

  // Statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
  };

  const handleCreateTask = async (data: TaskFormData) => {
    if (!user) return;
    setCreating(true);
    try {
      await createTask.mutateAsync({ projectId, data });
      setIsCreateDialogOpen(false);
    } finally {
      setCreating(false);
    }
  };

  const selectedTaskData = tasks.find((t) => t.id === selectedTask);

  return (
    <PageContainer>
      {isLoadingProject ? (
        <>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {project?.name}
              </h1>
              {project?.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}/settings`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task to this project with details like title,
                      description, priority, and due date.
                    </DialogDescription>
                  </DialogHeader>
                  {user && (
                    <TaskForm
                      projectId={projectId}
                      userId={user.id}
                      onSubmit={handleCreateTask}
                      loading={creating}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Statistics Cards */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <StatisticsCards
              total={stats.total}
              todo={stats.todo}
              inProgress={stats.inProgress}
              completed={stats.completed}
            />
          )}

          {/* View Mode Toggle */}
          {tasks.length > 0 && (
            <div className="mb-6 flex justify-end">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) =>
                  value && setViewMode(value as ViewMode)
                }
                className="bg-muted/50 p-1 rounded-lg"
              >
                <ToggleGroupItem
                  value="kanban"
                  aria-label="Kanban view"
                  className="data-[state=on]:bg-background"
                >
                  <Kanban className="h-4 w-4 mr-2" />
                  Kanban
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid view"
                  className="data-[state=on]:bg-background"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="list"
                  aria-label="List view"
                  className="data-[state=on]:bg-background"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Tasks View */}
          {isLoading ? (
            <div className="h-96 bg-muted/20 rounded-lg animate-pulse" />
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No tasks yet"
              description="Start by creating a new task to organize your work."
              action={{
                label: "Create Task",
                onClick: () => setIsCreateDialogOpen(true),
              }}
            />
          ) : (
            <>
              {viewMode === "kanban" && (
                <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} />
              )}
              {viewMode === "grid" && (
                <TasksGrid tasks={tasks} onTaskClick={setSelectedTask} />
              )}
              {viewMode === "list" && (
                <TasksList tasks={tasks} onTaskClick={setSelectedTask} />
              )}
            </>
          )}
        </>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTaskData || null}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </PageContainer>
  );
}
