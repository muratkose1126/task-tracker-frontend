"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import TaskView from "@/components/tasks/task-view";
import { useTaskList } from "@/hooks/useLists";

export default function GroupListPage() {
  const params = useParams() as { 
    workspaceId: string; 
    spaceId: string; 
    groupId: string;
    listId: string;
  };
  const { data: list } = useTaskList(params.listId);

  return (
    <PageContainer>
      <TaskView
        workspaceId={params.workspaceId}
        spaceId={params.spaceId}
        groupId={params.groupId}
        listId={params.listId}
        title={list?.name}
      />
    </PageContainer>
  );
}
