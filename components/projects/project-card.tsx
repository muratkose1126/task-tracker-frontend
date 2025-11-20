import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";
import { useUpdateProject } from "@/hooks/useProjects";
import {
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  FolderOpen,
} from "lucide-react";

export function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (id: number) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const updateProject = useUpdateProject();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      });
      setEditing(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-0 bg-linear-to-br from-background to-muted/30">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="relative pb-3">
        {editing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`name-${project.id}`}>Name</Label>
              <Input
                id={`name-${project.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="rounded-xl bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold leading-tight line-clamp-1">
                {project.name}
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      <CardContent className="relative pb-3">
        {editing ? (
          <div>
            <Label htmlFor={`desc-${project.id}`}>Description</Label>
            <Textarea
              id={`desc-${project.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={saving}
              className="resize-none"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
              {project.description || "No description provided"}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {editing ? (
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={handleViewDetails}
            className="w-full gap-2 group-hover:shadow-md transition-all"
          >
            View Project
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
