"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import TaskView from "@/components/tasks/task-view";
import { useTaskList } from "@/hooks/useLists";

export default function ListPage() {
  const params = useParams() as { workspaceId: string; spaceId: string; listId: string };
  const router = useRouter();
  const { data: list } = useTaskList(params.listId);

  // If list has a group_id and we're not already in a group route, redirect
  React.useEffect(() => {
    if (list && list.group_id) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes(`/groups/${list.group_id}`)) {
        // Redirect to group-aware path
        router.replace(
          `/workspaces/${params.workspaceId}/spaces/${params.spaceId}/groups/${list.group_id}/lists/${params.listId}`
        );
      }
    }
  }, [list, params, router]);

  return (
    <PageContainer>
      <TaskView
        workspaceId={params.workspaceId}
        spaceId={params.spaceId}
        groupId={list?.group_id ? String(list.group_id) : undefined}
        listId={params.listId}
        title={list?.name}
      />
    </PageContainer>
  );
}
