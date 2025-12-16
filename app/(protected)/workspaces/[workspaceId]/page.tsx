"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { LayoutGrid, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/page-container";
import { EmptyState } from "@/components/empty-state";
import { useWorkspace } from "@/hooks/useWorkspaces";
import { useSpaces } from "@/hooks/useSpaces";

export default function WorkspacePage() {
  const params = useParams() as { workspaceId: string };
  const router = useRouter();
  
  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(params.workspaceId);
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces(params.workspaceId);

  const isLoading = workspaceLoading || spacesLoading;
  const isEmpty = spaces.length === 0;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center py-8 text-muted-foreground">
          Loading workspace...
        </div>
      </PageContainer>
    );
  }

  if (isEmpty) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{workspace?.name || "Workspace"}</h1>
            {workspace?.description && (
              <p className="text-muted-foreground mt-2">{workspace.description}</p>
            )}
          </div>
          <EmptyState
            icon={LayoutGrid}
            title="No spaces yet"
            description="Create your first space to start organizing your tasks."
            action={{
              label: "Create Space",
              onClick: () => {
                console.log("Create space");
              },
            }}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={workspace?.name || "Workspace"}
          description={workspace?.description}
          action={
            <Button onClick={() => console.log("Create space")}>
              <Plus className="mr-2 h-4 w-4" />
              New Space
            </Button>
          }
        />

        <div>
          <h2 className="text-xl font-semibold mb-4">Spaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map((space) => (
              <div
                key={space.id}
                onClick={() =>
                  router.push(`/workspaces/${params.workspaceId}/spaces/${space.id}`)
                }
                className="p-6 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  {space.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: space.color }}
                    />
                  )}
                  <h3 className="font-semibold text-lg">{space.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {space.visibility === 'public' ? "Public" : "Private"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
