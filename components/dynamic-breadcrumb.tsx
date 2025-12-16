"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Layers, FolderOpen, ListTodo } from "lucide-react";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useSpaces } from "@/hooks/useSpaces";
import { useGroups } from "@/hooks/useGroups";
import { useTaskLists } from "@/hooks/useLists";

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  
  // Parse path segments
  const segments = pathname
    .split("/")
    .filter((segment) => segment && segment !== "(protected)");

  // Extract IDs from path
  const workspaceId = segments[1];
  const spaceIdIndex = segments.indexOf("spaces") + 1;
  const spaceId = spaceIdIndex > 0 ? segments[spaceIdIndex] : null;
  const groupIdIndex = segments.indexOf("groups") + 1;
  const groupId = groupIdIndex > 0 ? segments[groupIdIndex] : null;
  const listIdIndex = segments.indexOf("lists") + 1;
  const listId = listIdIndex > 0 ? segments[listIdIndex] : null;

  // Fetch data
  const { data: workspaces } = useWorkspaces();
  const { data: spaces } = useSpaces(workspaceId || "");
  const { data: groups } = useGroups(spaceId || "", { enabled: !!spaceId });
  const { data: lists } = useTaskLists(spaceId || "", { enabled: !!spaceId });

  // Find entities
  const workspace = workspaces?.find((w) => String(w.id) === workspaceId);
  const space = spaces?.find((s) => String(s.id) === spaceId);
  const group = groups && Array.isArray(groups) ? groups.find((f) => String(f.id) === groupId) : null;
  const list = lists && Array.isArray(lists) ? lists.find((l) => String(l.id) === listId) : null;

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Home className="h-4 w-4" />
        <span className="font-medium">Home</span>
      </div>
    );
  }

  // Build breadcrumb items: skip workspace, show space/folder/list
  const breadcrumbItems = [];

  // Only show space if it's the top-level (not in "all tasks" workspace view)
  if (space) {
    breadcrumbItems.push({
      icon: <Layers className="h-4 w-4" />,
      label: space.name,
      href: `/workspaces/${workspaceId}/spaces/${spaceId}`,
    });
  }

  // Show group if present (either from URL or from list's group_id)
  const displayGroupId = groupId || (list?.group_id ? String(list.group_id) : null);
  const displayGroup = group || (list?.group_id && Array.isArray(groups) ? groups.find((f) => String(f.id) === String(list.group_id)) : null);
  
  if (displayGroup && displayGroupId) {
    breadcrumbItems.push({
      icon: <FolderOpen className="h-4 w-4" />,
      label: displayGroup.name,
      href: `/workspaces/${workspaceId}/spaces/${spaceId}/groups/${displayGroupId}`,
    });
  }

  // Show list if present
  if (list) {
    const listHref = displayGroupId 
      ? `/workspaces/${workspaceId}/spaces/${spaceId}/groups/${displayGroupId}/lists/${listId}`
      : `/workspaces/${workspaceId}/spaces/${spaceId}/lists/${listId}`;
    
    breadcrumbItems.push({
      icon: <ListTodo className="h-4 w-4" />,
      label: list.name,
      href: listHref,
    });
  }

  // If no breadcrumb items (all tasks view), show workspace name
  if (breadcrumbItems.length === 0 && workspace) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{workspace.name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm flex-wrap">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            {isLast ? (
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-medium truncate max-w-[200px]">{item.label}</span>
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
