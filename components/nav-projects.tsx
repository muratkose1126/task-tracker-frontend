"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Folder, FolderOpen, Plus, Settings } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectsPopover } from "@/components/projects-popover";
import ProjectForm from "@/components/projects/project-form";
import { useCreateProject } from "@/hooks/useProjects";
import type { Project, ProjectFormData } from "@/types";

export function NavProjects({ projects }: { projects: Project[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
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

  // Check if any project is active
  const isAnyProjectActive = projects.some(
    (project) =>
      pathname === `/projects/${project.id}` ||
      pathname.startsWith(`/projects/${project.id}/`)
  );

  return (
    <>
      {isCollapsed ? (
        <SidebarGroup className="group/sidebar-group">
          <SidebarMenu>
            <SidebarMenuItem>
              <ProjectsPopover
                projects={projects}
                isCollapsed={isCollapsed}
                isAnyProjectActive={isAnyProjectActive}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      ) : (
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction onClick={() => setIsCreateDialogOpen(true)}>
            <Plus />
            <span className="sr-only">Add Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => {
                const projectUrl = `/projects/${project.id}`;
                const isProjectActive =
                  pathname === projectUrl ||
                  pathname.startsWith(projectUrl + "/");
                return (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      className="p-0 hover:bg-transparent"
                    >
                      <Link
                        href={projectUrl}
                        className={`group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors w-full ${
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
                        <span className="truncate flex-1">{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`${projectUrl}/settings`);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Project Settings</span>
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                );
              })}
              {projects.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-muted-foreground">
                    <span>No projects yet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

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
