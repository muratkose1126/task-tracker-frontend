"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Folder, FolderOpen, Plus, Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProjectForm from "@/components/projects/project-form";
import { useCreateProject } from "@/hooks/useProjects";
import type { Project, ProjectFormData } from "@/types";

interface ProjectsPopoverProps {
  projects: Project[];
  isCollapsed?: boolean;
  isAnyProjectActive?: boolean;
}

export function ProjectsPopover({
  projects,
  isCollapsed,
  isAnyProjectActive = false,
}: ProjectsPopoverProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const createProject = useCreateProject();

  const handleCreate = async (data: ProjectFormData) => {
    setCreating(true);
    try {
      const newProject = await createProject.mutateAsync(data);
      setIsCreateDialogOpen(false);
      router.push(`/projects/${newProject.id}`);
    } finally {
      setCreating(false);
    }
  };

  if (!isCollapsed) return null;

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <SidebarMenuButton
            tooltip="Projects"
            className={`w-full ${
              isAnyProjectActive
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <FolderOpen
              className={`h-5 w-5 ${isAnyProjectActive ? "text-primary" : ""}`}
            />
            <span className="sr-only">Projects</span>
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-72 p-0">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Projects</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="Add Project"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {projects.length > 0 ? (
                <div className="space-y-1">
                  {projects.map((project) => {
                    const projectUrl = `/projects/${project.id}`;
                    const isProjectActive =
                      pathname === projectUrl ||
                      pathname.startsWith(projectUrl + "/");

                    return (
                      <div key={project.id} className="group relative">
                        <Link
                          href={projectUrl}
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                            isProjectActive
                              ? "bg-primary/10 text-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                        >
                          {isProjectActive ? (
                            <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <Folder className="h-4 w-4 shrink-0 group-hover:text-foreground" />
                          )}
                          <span className="truncate flex-1">
                            {project.name}
                          </span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`${projectUrl}/settings`);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-sm"
                          title="Project Settings"
                        >
                          <Settings className="h-4 w-4 " />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No projects yet
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your tasks and collaborate with
              your team.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm onSubmit={handleCreate} loading={creating} />
        </DialogContent>
      </Dialog>
    </>
  );
}
