"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ListPlus, List as ListIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/page-container";
import { EmptyState } from "@/components/empty-state";
import TaskView from "@/components/tasks/task-view";
import { useGroup } from "@/hooks/useGroups";
import { useTaskLists } from "@/hooks/useLists";

export default function GroupPage() {
  const params = useParams() as { workspaceId: string; spaceId: string; groupId: string };
  const router = useRouter();
  const { data: group, isLoading: groupLoading } = useGroup(params.groupId);
  const { data: allLists, isLoading: listsLoading } = useTaskLists(params.spaceId);

  const lists = React.useMemo(() => {
    if (!allLists) return [];
    return allLists.filter((list) => String(list.group_id) === params.groupId);
  }, [allLists, params.groupId]);

  const isLoading = groupLoading || listsLoading;
  const isEmpty = lists.length === 0;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center py-8 text-muted-foreground">
          Loading group...
        </div>
      </PageContainer>
    );
  }

  // Render unified TaskView for this group
  return (
    <PageContainer>
      <TaskView workspaceId={params.workspaceId} spaceId={params.spaceId} groupId={params.groupId} title={group?.name} />
    </PageContainer>
  );
}
