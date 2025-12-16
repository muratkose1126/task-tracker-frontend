"use client";

import * as React from "react";
import { CheckSquare } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { SpaceTree } from "@/components/sidebar/space-tree";
import { FavoritesSidebar } from "@/components/sidebar/favorites";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { usePathname } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout } = useLogout();
  const { data: workspaces = [] } = useWorkspaces();
  const pathname = usePathname();
  
  // Extract workspaceId from current URL
  const currentWorkspaceId = React.useMemo(() => {
    const match = pathname.match(/\/workspaces\/([^\/]+)/);
    return match ? match[1] : null;
  }, [pathname]);
  
  // Track selected workspace (use URL or default to first workspace)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string>();

  // Sync with URL
  React.useEffect(() => {
    if (currentWorkspaceId) {
      setSelectedWorkspaceId(currentWorkspaceId);
    } else if (!selectedWorkspaceId && workspaces.length > 0) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [currentWorkspaceId, workspaces, selectedWorkspaceId]);

  const navMain = [
    {
      title: "All Tasks",
      url: selectedWorkspaceId ? `/workspaces/${selectedWorkspaceId}/tasks` : "#",
      icon: CheckSquare,
    },
  ];

  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceChange={setSelectedWorkspaceId}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {selectedWorkspaceId && <FavoritesSidebar workspaceId={selectedWorkspaceId} />}
        {selectedWorkspaceId && <SpaceTree workspaceId={selectedWorkspaceId} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onLogout={logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
