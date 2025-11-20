"use client";

import * as React from "react";
import { LayoutDashboard, Settings, GalleryVerticalEnd } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout } = useLogout();
  const { data: projects = [] } = useProjects();

  // Sample team data
  const teams = [
    {
      name: "Task Tracker",
      logo: GalleryVerticalEnd,
      plan: "Pro",
    },
  ];

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
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
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onLogout={logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
