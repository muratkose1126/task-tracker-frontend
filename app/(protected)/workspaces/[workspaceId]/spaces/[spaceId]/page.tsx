"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { FolderPlus, ListPlus, Folder as GroupIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/page-container";
import { EmptyState } from "@/components/empty-state";
import { useGroups } from "@/hooks/useGroups";
import { useTaskLists } from "@/hooks/useLists";
import GroupCard from "@/components/groups/group-card";
import ListCard from "@/components/lists/list-card";
import TaskView from "@/components/tasks/task-view";

export default function SpacePage() {
  const params = useParams() as { workspaceId: string; spaceId: string };
  const spaceId = params.spaceId;
  
  const { data: groups = [], isLoading: groupsLoading } = useGroups(spaceId);
  const { data: lists = [], isLoading: listsLoading } = useTaskLists(spaceId);

  const isLoading = groupsLoading || listsLoading;
  const isEmpty = groups.length === 0 && lists.length === 0;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center py-8 text-muted-foreground">
          Loading space...
        </div>
      </PageContainer>
    );
  }

  // Render unified TaskView for this space
  return (
    <PageContainer>
      <TaskView workspaceId={params.workspaceId} spaceId={spaceId} title="Tasks" />
    </PageContainer>
  );
}
