"use client";

import { useParams } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export function Header() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const spaceId = params.spaceId as string;
  const folderId = params.folderId as string;
  const listId = params.listId as string;

  // Determine which settings URL to show based on route
  let settingsUrl = null;
  if (listId) {
    settingsUrl = `/workspaces/${workspaceId}/spaces/${spaceId}/lists/${listId}/settings`;
  } else if (folderId) {
    settingsUrl = `/workspaces/${workspaceId}/spaces/${spaceId}/folders/${folderId}/settings`;
  } else if (spaceId) {
    settingsUrl = `/workspaces/${workspaceId}/spaces/${spaceId}/settings`;
  } else if (workspaceId) {
    settingsUrl = `/workspaces/${workspaceId}/settings`;
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <DynamicBreadcrumb />
      </div>
      {settingsUrl && (
        <div className="px-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8"
            title="Settings"
          >
            <a href={settingsUrl}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </a>
          </Button>
        </div>
      )}
    </header>
  );
}

export default Header;
