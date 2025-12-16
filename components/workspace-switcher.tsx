"use client";

import * as React from "react";
import { ChevronsUpDown, Check, Plus, Settings, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useRouter, usePathname } from "next/navigation";
import { updateLastVisited } from "@/lib/workspaces";
import { WorkspaceDialog } from "@/components/dialogs/workspace-dialog";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  selectedWorkspaceId?: string;
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({
  selectedWorkspaceId,
  onWorkspaceChange,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: workspaces, isLoading } = useWorkspaces();
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  const selectedWorkspace = workspaces?.find(
    (w) => String(w.id) === String(selectedWorkspaceId)
  );

  // Save current path to backend when it changes and is workspace-related
  React.useEffect(() => {
    if (selectedWorkspaceId && pathname.includes('/workspaces/')) {
      updateLastVisited(selectedWorkspaceId, pathname).catch(console.error);
    }
  }, [pathname, selectedWorkspaceId]);

  const handleWorkspaceSelect = (workspaceId: string) => {
    onWorkspaceChange?.(workspaceId);
    
    // Get last visited path from workspace data
    const workspace = workspaces?.find(w => String(w.id) === String(workspaceId));
    const lastPath = workspace?.last_visited_path;
    
    // Navigate to last visited path or workspace home
    if (lastPath && lastPath.includes(`/workspaces/${workspaceId}`)) {
      router.push(lastPath);
    } else {
      router.push(`/workspaces/${workspaceId}`);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {selectedWorkspace?.name.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selectedWorkspace?.name || "Select Workspace"}
                </span>
                <span className="truncate text-xs">
                  {selectedWorkspace?.slug || ""}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            {isLoading ? (
              <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
            ) : workspaces && workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleWorkspaceSelect(String(workspace.id))}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{workspace.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {workspace.slug}
                    </div>
                  </div>
                  {String(workspace.id) === String(selectedWorkspaceId) && (
                    <Check className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No workspaces</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/workspaces/${selectedWorkspaceId}/settings`)}
              className="gap-2 p-2"
            >
              <Settings className="size-4" />
              <div className="font-medium">Settings</div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/workspaces/${selectedWorkspaceId}/members`)}
              className="gap-2 p-2"
            >
              <Users className="size-4" />
              <div className="font-medium">Members</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowCreateDialog(true)}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add workspace
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <WorkspaceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </SidebarMenu>
  );
}
