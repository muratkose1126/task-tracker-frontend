"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  tasks: "Tasks",
  settings: "Settings",
  profile: "Profile",
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const { data: projects } = useProjects();

  // Parse path segments
  const segments = pathname
    .split("/")
    .filter((segment) => segment && segment !== "(protected)");

  if (segments.length === 0 || segments[0] === "dashboard") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Home className="h-4 w-4" />
        <span className="font-medium">Dashboard</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm flex-wrap">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isNumber = /^\d+$/.test(segment);

        // If it's a number and previous segment is "projects", try to find project name
        let label = segment;
        if (isNumber && index > 0 && segments[index - 1] === "projects") {
          const project = projects?.find((p) => p.id === parseInt(segment));
          label = project?.name || `#${segment}`;
        } else if (isNumber) {
          label = `#${segment}`;
        } else {
          label = routeNames[segment] || segment;
        }

        return (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
