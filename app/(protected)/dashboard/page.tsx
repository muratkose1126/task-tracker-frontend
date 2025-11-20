"use client";

import { useAuthStore } from "@/store/authStore";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { PageContainer, PageHeader } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const { data: tasks = [], isLoading: isLoadingTasks } = useTasks();

  const isLoading = isLoadingProjects || isLoadingTasks;

  // Statistics
  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "done").length,
    inProgressTasks: tasks.filter((t) => t.status === "in_progress").length,
    todoTasks: tasks.filter((t) => t.status === "todo").length,
  };

  // Upcoming deadlines (within 7 days)
  const upcomingDeadlines = tasks
    .filter((t) => {
      if (!t.due_date || t.status === "done") return false;
      const dueDate = new Date(t.due_date);
      const today = new Date();
      const diffDays = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    )
    .slice(0, 5);

  // Recently added tasks
  const recentTasks = tasks
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${user?.name}!`}
        description="Overview of your projects and tasks"
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg border-0 bg-linear-to-br from-background to-muted/50">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projects
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <FolderOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">Total projects</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-all hover:shadow-lg border-0 bg-linear-to-br from-background to-muted/50">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              All Tasks
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <ListTodo className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">Total tasks</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-all hover:shadow-lg border-0 bg-linear-to-br from-background to-muted/50">
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.inProgressTasks}
                </div>
                <p className="text-xs text-muted-foreground">Active tasks</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-all hover:shadow-lg border-0 bg-linear-to-br from-background to-muted/50">
          <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <div className="rounded-lg bg-green-500/10 p-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">Completed tasks</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Deadlines */}
        <Card className="border-0 shadow-sm bg-linear-to-br from-background to-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No upcoming deadlines
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.project_id}`}
                    className="group block p-3 rounded-xl border border-border/50 bg-card/50 hover:border-red-200 hover:bg-red-50/50 dark:hover:border-red-900/50 dark:hover:bg-red-950/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(task.due_date!).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          task.priority === "high" ? "destructive" : "secondary"
                        }
                        className="text-xs shrink-0"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="border-0 shadow-sm bg-linear-to-br from-background to-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <ListTodo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.project_id}`}
                    className="group block p-3 rounded-xl border border-border/50 bg-card/50 hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-900/50 dark:hover:bg-blue-950/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(task.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {task.status === "todo"
                          ? "To Do"
                          : task.status === "in_progress"
                          ? "In Progress"
                          : "Done"}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
