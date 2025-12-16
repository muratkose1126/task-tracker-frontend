"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import TaskView from "@/components/tasks/task-view";

export default function AllTasksPage() {
  const params = useParams() as { workspaceId: string };

  return (
    <PageContainer>
      <TaskView workspaceId={params.workspaceId} title="All Tasks" />
    </PageContainer>
  );
}
