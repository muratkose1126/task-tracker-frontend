"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/projects";
import { useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { PageContainer, PageHeader } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import ProjectForm from "@/components/projects/project-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, UserPlus } from "lucide-react";
import type { ProjectFormData } from "@/types";

interface ProjectSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const resolvedParams = use(params);
  const projectId = parseInt(resolvedParams.id);
  const router = useRouter();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getProject(projectId),
    enabled: !!projectId,
  });

  const handleUpdate = async (data: ProjectFormData) => {
    await updateProject.mutateAsync({ id: projectId, data });
    router.push(`/projects/${projectId}`);
  };

  const handleDelete = async () => {
    await deleteProject.mutateAsync(projectId);
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Project Settings"
        description={`Manage settings for ${project.name}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        }
      />

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update your project name and description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm
              onSubmit={handleUpdate}
              loading={updateProject.isPending}
              initialData={project}
              mode="update"
            />
          </CardContent>
        </Card>

        {/* Members Section */}
        <Card>
          <CardHeader>
            <CardTitle>Project Members</CardTitle>
            <CardDescription>
              Manage who has access to this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Member management coming soon</p>
              <p className="text-sm mt-2">
                You&apos;ll be able to invite team members and manage
                permissions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Delete this project</h4>
                <p className="text-sm text-muted-foreground">
                  Once deleted, all tasks and data will be permanently removed
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the project &quot;{project.name}&quot; and all associated
                      tasks, comments, and attachments.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete project
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
