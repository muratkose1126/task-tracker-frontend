"use client";

import * as React from "react";
import { ChevronRight, Lock, Plus, FolderIcon, ListIcon, Settings, Star, Grid, MoreVertical, FolderPlus, Trash2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSpaces, useDeleteSpace } from "@/hooks/useSpaces";
import { useGroups, useDeleteGroup } from "@/hooks/useGroups";
import { useTaskLists, useDeleteTaskList } from "@/hooks/useLists";
import { useTasks } from "@/hooks/useTasks";
import { useFavorites } from "@/components/sidebar/favorites";
import { SpaceDialog } from "@/components/dialogs/space-dialog";
import { GroupDialog } from "@/components/dialogs/group-dialog";
import { ListDialog } from "@/components/dialogs/list-dialog";
import { cn } from "@/lib/utils";

interface SpaceTreeProps {
  workspaceId: string;
}

export function SpaceTree({ workspaceId }: SpaceTreeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: spaces, isLoading: spacesLoading } = useSpaces(workspaceId);
  const { addFavorite, removeFavorite, isFavorited } = useFavorites(workspaceId);
  const [expandedSpaces, setExpandedSpaces] = React.useState<Set<string>>(
    new Set()
  );
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set()
  );
  const [showSpaceDialog, setShowSpaceDialog] = React.useState(false);
  const [showGroupDialog, setShowGroupDialog] = React.useState(false);
  const [showListDialog, setShowListDialog] = React.useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = React.useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | undefined>();

  // Auto-expand based on current path
  React.useEffect(() => {
    if (!pathname) return;

    const pathParts = pathname.split("/");
    const spaceIdMatch = pathParts.indexOf("spaces");
    const groupIdMatch = pathParts.indexOf("groups");

    if (spaceIdMatch !== -1 && pathParts[spaceIdMatch + 1]) {
      const spaceId = String(pathParts[spaceIdMatch + 1]);
      setExpandedSpaces((prev) => {
        const next = new Set(prev);
        next.add(spaceId);
        return next;
      });
    }

    if (groupIdMatch !== -1 && pathParts[groupIdMatch + 1]) {
      const groupId = String(pathParts[groupIdMatch + 1]);
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        next.add(groupId);
        return next;
      });
    }
  }, [pathname]);

  const toggleSpace = React.useCallback((spaceId: string) => {
    setExpandedSpaces((prev) => {
      const next = new Set(prev);
      if (next.has(spaceId)) {
        next.delete(spaceId);
      } else {
        next.add(spaceId);
      }
      return next;
    });
  }, []);

  const toggleGroup = React.useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  if (spacesLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Loading...</SidebarGroupLabel>
      </SidebarGroup>
    );
  }

  if (!spaces || spaces.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Spaces</SidebarGroupLabel>
        <div className="px-2 py-4 text-sm text-muted-foreground">
          No spaces yet
        </div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between">
        <SidebarGroupLabel className="flex items-center gap-2">
          <Grid className="h-4 w-4" />
          Spaces
        </SidebarGroupLabel>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-accent rounded-sm p-1">
              <Plus className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowSpaceDialog(true)}>
              New Space
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SidebarMenu>
        {spaces.map((space) => (
          <SpaceItem
            key={space.id}
            space={space}
            workspaceId={workspaceId}
            pathname={pathname}
            isExpanded={expandedSpaces.has(String(space.id))}
            onToggle={() => toggleSpace(String(space.id))}
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
            onCreateGroup={(spaceId) => {
              setSelectedSpaceId(spaceId);
              setShowGroupDialog(true);
            }}
            onCreateList={(spaceId, groupId) => {
              setSelectedSpaceId(spaceId);
              setSelectedGroupId(groupId);
              setShowListDialog(true);
            }}
            addFavorite={addFavorite}
            removeFavorite={removeFavorite}
            isFavorited={isFavorited}
          />
        ))}
      </SidebarMenu>

      <SpaceDialog
        workspaceId={workspaceId}
        open={showSpaceDialog}
        onOpenChange={setShowSpaceDialog}
      />
      <GroupDialog
        spaceId={selectedSpaceId}
        open={showGroupDialog}
        onOpenChange={setShowGroupDialog}
      />
      <ListDialog
        spaceId={selectedSpaceId}
        defaultGroupId={selectedGroupId}
        open={showListDialog}
        onOpenChange={setShowListDialog}
      />
    </SidebarGroup>
  );
}

interface SpaceItemProps {
  space: any;
  workspaceId: string;
  pathname: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  expandedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onCreateGroup: (spaceId: string) => void;
  onCreateList: (spaceId: string, groupId?: string) => void;
  addFavorite: (item: any) => void;
  removeFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;
}

function SpaceItem({
  space,
  workspaceId,
  pathname,
  isExpanded,
  onToggle,
  expandedGroups,
  onToggleGroup,
  onCreateGroup,
  onCreateList,
  addFavorite,
  removeFavorite,
  isFavorited,
}: SpaceItemProps) {
  const router = useRouter();
  const deleteSpace = useDeleteSpace();
  const deleteList = useDeleteTaskList();
  const groupsQuery = useGroups(space.id, { 
    refetchOnMount: true,
    staleTime: 0,
  });
  const { data: groups } = groupsQuery;
  const listsQuery = useTaskLists(space.id, {
    refetchOnMount: true,
    staleTime: 0,
  });
  const { data: lists } = listsQuery;
  const { data: tasks } = useTasks();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteListDialogOpen, setDeleteListDialogOpen] = React.useState(false);
  const [listToDelete, setListToDelete] = React.useState<any>(null);

  // Auto-expand groups if active list is inside
  React.useEffect(() => {
    if (!pathname || !lists || !Array.isArray(lists)) return;

    const pathParts = pathname.split("/");
    const listIdMatch = pathParts.indexOf("lists");
    
    if (listIdMatch !== -1 && pathParts[listIdMatch + 1]) {
      const listId = String(pathParts[listIdMatch + 1]);
      const activeList = lists.find(list => String(list.id) === listId);
      
      if (activeList?.group_id) {
        const groupId = String(activeList.group_id);
        // Only expand if not already expanded
        if (!expandedGroups.has(groupId)) {
          onToggleGroup(groupId);
        }
      }
    }
  }, [pathname, lists, expandedGroups, onToggleGroup]);

  // Filter lists that are not in groups
  const topLevelLists = Array.isArray(lists) ? lists.filter((list) => !list.group_id) : [];

  return (
    <>
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <SidebarMenuItem>
        <div className={cn(
          "flex items-center rounded transition-colors w-full group/space",
          pathname?.includes(`/spaces/${space.id}`) 
            ? "bg-sidebar-accent/50" 
            : "hover:bg-sidebar-accent/50"
        )}>
          <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={cn(
                "absolute w-3 h-3 rounded-full transition-opacity",
                "opacity-100 group-hover/space:opacity-0"
              )}
              style={{ backgroundColor: space.color || "#3b82f6" }}
              title={`Space: ${space.name}`}
            />
            <CollapsibleTrigger asChild>
              <button className={cn(
                "absolute p-1 rounded-sm transition-opacity",
                "opacity-0 group-hover/space:opacity-100"
              )}>
                <ChevronRight
                  className={cn(
                    "size-4 transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>
          <SidebarMenuButton
            onClick={() => router.push(`/workspaces/${workspaceId}/spaces/${space.id}`)}
            className="flex-1 min-w-0"
            isActive={pathname?.includes(`/spaces/${space.id}`)}
          >
            <span className="truncate">{space.name}</span>
            {!space.is_public && <Lock className="ml-auto size-3 shrink-0" />}
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 group-hover/space:opacity-100 data-[active=true]:opacity-100 hover:bg-accent rounded-sm p-1 shrink-0 mr-1 cursor-pointer" data-active={pathname?.includes(`/spaces/${space.id}`)}>
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const spaceId = `space-${space.id}`;
                  if (isFavorited(spaceId)) {
                    removeFavorite(spaceId);
                  } else {
                    addFavorite({
                      id: spaceId,
                      name: space.name,
                      type: "list",
                      url: `/workspaces/${workspaceId}/spaces/${space.id}`,
                    });
                  }
                }}
              >
                <Star className={cn("mr-2 size-4", isFavorited(`space-${space.id}`) && "fill-current text-amber-500")} />
                {isFavorited(`space-${space.id}`) ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onCreateGroup(String(space.id))}>
                <Plus className="mr-2 size-4" />
                New Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateList(String(space.id))}>
                <Plus className="mr-2 size-4" />
                New List
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/workspaces/${workspaceId}/spaces/${space.id}/settings`)}
              >
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete Space
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 group-hover/space:opacity-100 data-[active=true]:opacity-100 hover:bg-accent rounded-sm p-1 shrink-0 mr-1 cursor-pointer" data-active={pathname?.includes(`/spaces/${space.id}`)}>
                <Plus className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCreateGroup(String(space.id))}>
                <FolderPlus className="mr-2 size-4" />
                New Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateList(String(space.id))}>
                <Plus className="mr-2 size-4" />
                New List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0">
            {/* Groups */}
            {groups?.map((groups) => (
              <GroupItem
                key={`groups-${groups.id}`}
                groups={groups}
                spaceId={space.id}
                workspaceId={workspaceId}
                pathname={pathname}
                isExpanded={expandedGroups.has(String(groups.id))}
                onToggle={() => onToggleGroup(String(groups.id))}
                onCreateList={(groupId) => onCreateList(String(space.id), groupId)}
                addFavorite={addFavorite}
                removeFavorite={removeFavorite}
                isFavorited={isFavorited}
              />
            ))}
            {/* Top-level lists (not in groups) */}
            {topLevelLists.map((list) => {
              const isListActive = pathname?.includes(`/lists/${list.id}`);
              const listTaskCount = Array.isArray(tasks) 
                ? tasks.filter((task) => String(task.list_id) === String(list.id)).length 
                : 0;
              // Build groups-aware URL for this list
              const listUrl = list.group_id
                ? `/workspaces/${workspaceId}/spaces/${space.id}/groups/${list.group_id}/lists/${list.id}`
                : `/workspaces/${workspaceId}/spaces/${space.id}/lists/${list.id}`;
              
              return (
              <SidebarMenuSubItem key={`list-${list.id}`} className="group/list relative">
                <SidebarMenuSubButton
                  onClick={() => router.push(listUrl)}
                  isActive={isListActive}
                >
                  <ListIcon className="size-4" />
                  <span>{list.name}</span>
                </SidebarMenuSubButton>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <SidebarMenuBadge className="group-hover/list:hidden">
                    {listTaskCount}
                  </SidebarMenuBadge>
                  <div className="hidden group-hover/list:flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:bg-accent rounded-sm p-1 cursor-pointer">
                          <MoreVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const listId = `list-${list.id}`;
                            if (isFavorited(listId)) {
                              removeFavorite(listId);
                            } else {
                              addFavorite({
                                id: listId,
                                name: list.name,
                                type: "list",
                                url: listUrl,
                              });
                            }
                          }}
                        >
                          <Star className={cn("mr-2 size-4", isFavorited(`list-${list.id}`) && "fill-current text-amber-500")} />
                          {isFavorited(`list-${list.id}`) ? "Remove from Favorites" : "Add to Favorites"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(`${listUrl}/settings`)}
                        >
                          <Settings className="mr-2 size-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setListToDelete(list);
                            setDeleteListDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete List
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button className="hover:bg-accent rounded-sm p-1 cursor-pointer">
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Space</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete "{space.name}"? This action cannot be undone.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                await deleteSpace.mutateAsync({ id: String(space.id), workspaceId: String(workspaceId) });
                toast.success("Space deleted successfully!");
                setDeleteDialogOpen(false);
              } catch (error) {
                toast.error("Failed to delete space.");
                console.error(error);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={deleteListDialogOpen} onOpenChange={setDeleteListDialogOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete List</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete "{listToDelete?.name}"? This action cannot be undone.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                await deleteList.mutateAsync({ id: String(listToDelete?.id), spaceId: String(space.id) });
                toast.success("List deleted successfully!");
                setDeleteListDialogOpen(false);
                setListToDelete(null);
              } catch (error) {
                toast.error("Failed to delete list.");
                console.error(error);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

interface GroupItemProps {
  groups: any;
  spaceId: string;
  workspaceId: string;
  pathname: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onCreateGroup?: (parentGroupId: string) => void;
  onCreateList: (groupId: string) => void;
  addFavorite: (item: any) => void;
  removeFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;
}

function GroupItem({
  groups,
  spaceId,
  workspaceId,
  pathname,
  isExpanded,
  onToggle,
  onCreateGroup,
  onCreateList,
  addFavorite,
  removeFavorite,
  isFavorited,
}: GroupItemProps) {
  const router = useRouter();
  const deleteGroup = useDeleteGroup();
  const deleteList = useDeleteTaskList();
  const { data: lists } = useTaskLists(spaceId, {
    refetchOnMount: true,
    staleTime: 0,
  });
  const { data: tasks } = useTasks();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteListDialogOpen, setDeleteListDialogOpen] = React.useState(false);
  const [listToDelete, setListToDelete] = React.useState<any>(null);

  // Filter lists in this groups
  const groupsLists = Array.isArray(lists) ? lists.filter((list) => list.group_id === groups.id) : [];
  
  // Check if groups is active or any of its children are active
  const isGroupActive = pathname?.includes(`/groups/${groups.id}`) || 
    groupsLists.some((list) => pathname?.includes(`/lists/${list.id}`));

  return (
    <>
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <SidebarMenuSubItem>
        <div className={cn(
          "flex items-center rounded transition-colors w-full group/groups",
          isGroupActive
            ? "bg-sidebar-accent/50" 
            : "hover:bg-sidebar-accent/50"
        )}>
          <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
            <FolderIcon
              className={cn(
                "absolute size-4 transition-opacity shrink-0",
                "opacity-100 group-hover/groups:opacity-0"
              )}
              style={{ color: groups.color || undefined }}
            />
            <CollapsibleTrigger asChild>
              <button className={cn(
                "absolute p-1 rounded-sm transition-opacity",
                "opacity-0 group-hover/groups:opacity-100"
              )}>
                <ChevronRight
                  className={cn(
                    "size-4 transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>
          <SidebarMenuSubButton
            onClick={() => router.push(`/workspaces/${workspaceId}/spaces/${spaceId}/groups/${groups.id}`)}
            className="flex-1 min-w-0"
            isActive={isGroupActive}
          >
            <span className="truncate">{groups.name}</span>
          </SidebarMenuSubButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 group-hover/groups:opacity-100 data-[active=true]:opacity-100 hover:bg-accent rounded-sm p-1 shrink-0 mr-1 cursor-pointer" data-active={isGroupActive}>
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const groupId = `groups-${groups.id}`;
                  if (isFavorited(groupId)) {
                    removeFavorite(groupId);
                  } else {
                    addFavorite({
                      id: groupId,
                      name: groups.name,
                      type: "list",
                      url: `/workspaces/${workspaceId}/spaces/${spaceId}/groups/${groups.id}`,
                    });
                  }
                }}
              >
                <Star className={cn("mr-2 size-4", isFavorited(`groups-${groups.id}`) && "fill-current text-amber-500")} />
                {isFavorited(`groups-${groups.id}`) ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onCreateList(String(groups.id))}
              >
                <Plus className="mr-2 size-4" />
                New List
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/workspaces/${workspaceId}/spaces/${spaceId}/groups/${groups.id}/settings`)}
              >
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 group-hover/groups:opacity-100 data-[active=true]:opacity-100 hover:bg-accent rounded-sm p-1 shrink-0 mr-1 cursor-pointer" data-active={isGroupActive}>
                <Plus className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCreateList(String(groups.id))}>
                <Plus className="mr-2 size-4" />
                New List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0">
            {groupsLists.map((list) => {
              const isListActive = pathname?.includes(`/lists/${list.id}`);
              const listTaskCount = Array.isArray(tasks)
                ? tasks.filter((task) => String(task.list_id) === String(list.id)).length
                : 0;
              // Build groups-aware URL for this list
              const listUrl = `/workspaces/${workspaceId}/spaces/${spaceId}/groups/${groups.id}/lists/${list.id}`;
              
              return (
              <SidebarMenuSubItem key={`groups-list-${list.id}`} className="group/groupslist relative">
                <SidebarMenuSubButton
                  onClick={() => router.push(listUrl)}
                  isActive={isListActive}
                >
                  <ListIcon className="size-4" />
                  <span>{list.name}</span>
                </SidebarMenuSubButton>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <SidebarMenuBadge className="group-hover/groupslist:hidden">
                    {listTaskCount}
                  </SidebarMenuBadge>
                  <div className="hidden group-hover/groupslist:flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:bg-accent rounded-sm p-1 cursor-pointer">
                          <MoreVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const listId = `list-${list.id}`;
                            if (isFavorited(listId)) {
                              removeFavorite(listId);
                            } else {
                              addFavorite({
                                id: listId,
                                name: list.name,
                                type: "list",
                                url: listUrl,
                              });
                            }
                          }}
                        >
                          <Star className={cn("mr-2 size-4", isFavorited(`list-${list.id}`) && "fill-current text-amber-500")} />
                          {isFavorited(`list-${list.id}`) ? "Remove from Favorites" : "Add to Favorites"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(`${listUrl}/settings`)}
                        >
                          <Settings className="mr-2 size-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setListToDelete(list);
                            setDeleteListDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete List
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="hover:bg-accent rounded-sm p-1 cursor-pointer">
                          <Plus className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`${listUrl}?quickAdd=true`)}>
                          <Plus className="mr-2 size-4" />
                          New Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Group</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete "{groups.name}"? This action cannot be undone.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                await deleteGroup.mutateAsync({ id: String(groups.id), spaceId: String(spaceId) });
                toast.success("Folder deleted successfully!");
                setDeleteDialogOpen(false);
              } catch (error) {
                toast.error("Failed to delete groups.");
                console.error(error);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={deleteListDialogOpen} onOpenChange={setDeleteListDialogOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete List</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete "{listToDelete?.name}"? This action cannot be undone.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                await deleteList.mutateAsync({ id: String(listToDelete?.id), spaceId: String(spaceId) });
                toast.success("List deleted successfully!");
                setDeleteListDialogOpen(false);
                setListToDelete(null);
              } catch (error) {
                toast.error("Failed to delete list.");
                console.error(error);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
