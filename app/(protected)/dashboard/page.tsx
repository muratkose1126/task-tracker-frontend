"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { listWorkspaces } from "@/lib/workspaces";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToWorkspace() {
      try {
        const workspaces = await listWorkspaces();
        if (workspaces.length > 0) {
          const firstWorkspace = workspaces[0];
          const lastPath = firstWorkspace.last_visited_path;
          if (lastPath) {
            router.push(lastPath);
          } else {
            router.push(`/workspaces/${firstWorkspace.id}`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
      }
    }

    redirectToWorkspace();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
