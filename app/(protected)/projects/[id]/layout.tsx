"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";

interface ProjectLayoutProps {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export default function ProjectLayout({
  params,
  children,
}: ProjectLayoutProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );
  const { data: projects = [] } = useProjects();

  Promise.resolve(params).then(setResolvedParams);

  if (!resolvedParams) {
    return <div className="p-6">Loading...</div>;
  }

  const projectId = parseInt(resolvedParams.id);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-red-500">Project not found</p>
      </div>
    );
  }

  return <>{children}</>;
}
