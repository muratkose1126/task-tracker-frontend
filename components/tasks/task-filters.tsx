"use client";

import * as React from "react";
import { X, Filter } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface TaskFiltersProps {
  onFiltersChange?: (filters: TaskFilters) => void;
}

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  assignee?: string[];
}

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TaskFilters({ onFiltersChange }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedStatus, setSelectedStatus] = React.useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || []
  );
  const [selectedPriority, setSelectedPriority] = React.useState<string[]>(
    searchParams.get("priority")?.split(",").filter(Boolean) || []
  );
  const [selectedAssignee, setSelectedAssignee] = React.useState<string | null>(
    searchParams.get("assignee") || null
  );

  const pathname = usePathname();

  const updateURL = React.useCallback(
    (status: string[], priority: string[], assignee: string | null) => {
      // Merge with existing params so we don't drop group params or others
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      // remove old filter keys
      params.delete("status");
      params.delete("priority");
      params.delete("assignee");

      if (status.length > 0) params.set("status", status.join(","));
      if (priority.length > 0) params.set("priority", priority.join(","));
      if (assignee) params.set("assignee", assignee);

      const queryString = params.toString();
      // replace to avoid history spam when toggling filters
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);

      onFiltersChange?.({
        status: status.length > 0 ? status : undefined,
        priority: priority.length > 0 ? priority : undefined,
        assignee: assignee ? [assignee] : undefined,
      });
    },
    [router, onFiltersChange, searchParams, pathname]
  );

  const handleStatusChange = (value: string) => {
    const newStatus = selectedStatus.includes(value)
      ? selectedStatus.filter((s) => s !== value)
      : [...selectedStatus, value];
    setSelectedStatus(newStatus);
    updateURL(newStatus, selectedPriority, selectedAssignee);
  };

  const handlePriorityChange = (value: string) => {
    const newPriority = selectedPriority.includes(value)
      ? selectedPriority.filter((p) => p !== value)
      : [...selectedPriority, value];
    setSelectedPriority(newPriority);
    updateURL(selectedStatus, newPriority, selectedAssignee);
  };

  // Assignee filter available for future implementation

  const handleClearFilters = () => {
    setSelectedStatus([]);
    setSelectedPriority([]);
    setSelectedAssignee(null);
    // Preserve other params (eg. groupBy) and only remove filter keys
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("status");
    params.delete("priority");
    params.delete("assignee");
    router.replace(params.toString() ? `?${params.toString()}` : pathname);
  };

  const [open, setOpen] = React.useState(false);

  type FilterRow = { id: string; field: string; operator: string; value: string };

  const [rows, setRows] = React.useState<FilterRow[]>(() => {
    // init from url params
    const init: FilterRow[] = [];
    const status = searchParams.get("status");
    if (status) {
      status.split(",").forEach((s) => init.push({ id: String(Math.random()), field: "status", operator: "is", value: s }));
    }
    const priority = searchParams.get("priority");
    if (priority) {
      priority.split(",").forEach((p) => init.push({ id: String(Math.random()), field: "priority", operator: "is", value: p }));
    }
    const assignee = searchParams.get("assignee");
    if (assignee) init.push({ id: String(Math.random()), field: "assignee", operator: "is", value: assignee });
    return init;
  });

  const fields = [
    { value: "status", label: "Status" },
    { value: "priority", label: "Priority" },
    { value: "assignee", label: "Assignee" },
    { value: "due_date", label: "Due date" },
  ];

  const operatorsByField: Record<string, { value: string; label: string }[]> = {
    status: [{ value: "is", label: "Is" }],
    priority: [{ value: "is", label: "Is" }],
    assignee: [{ value: "is", label: "Is" }],
    due_date: [{ value: "before", label: "Before" }, { value: "after", label: "After" }],
  };

  const addRow = () => setRows((r) => [...r, { id: String(Math.random()), field: "status", operator: "is", value: "" }]);
  const removeRow = (id: string) => setRows((r) => r.filter((row) => row.id !== id));
  const updateRow = (id: string, patch: Partial<FilterRow>) => setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const applyFilters = () => {
    // Build simple url params for status, priority, assignee
    const statusVals: string[] = [];
    const priorityVals: string[] = [];
    let assigneeVal: string | null = null;

    rows.forEach((row) => {
      if (row.field === "status" && row.operator === "is" && row.value) statusVals.push(row.value);
      if (row.field === "priority" && row.operator === "is" && row.value) priorityVals.push(row.value);
      if (row.field === "assignee" && row.operator === "is" && row.value) assigneeVal = row.value;
    });

    updateURL(statusVals, priorityVals, assigneeVal);
    setOpen(false);
  };

  const clearAll = () => {
    setRows([]);
    handleClearFilters();
    setOpen(false);
  };

  const activeCount = rows.length;

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant={activeCount > 0 ? "default" : "outline"} size="sm">
            <Filter className="mr-2 h-4 w-4" /> {activeCount > 0 ? `${activeCount} Filter` : "Filter"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[480px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Filters</div>
              <div className="text-sm text-muted-foreground">Saved filters</div>
            </div>

            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.id} className="flex items-center gap-2">
                  <Select value={row.field} onValueChange={(v) => updateRow(row.id, { field: v, operator: operatorsByField[v][0].value, value: "" })}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={row.operator} onValueChange={(v) => updateRow(row.id, { operator: v })}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(operatorsByField[row.field] || []).map((op) => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* value input */}
                  {row.field === "status" && (
                    <Select value={row.value} onValueChange={(v) => updateRow(row.id, { value: v })}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Value" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {row.field === "priority" && (
                    <Select value={row.value} onValueChange={(v) => updateRow(row.id, { value: v })}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Value" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {row.field === "assignee" && (
                    <Input value={row.value} onChange={(e) => updateRow(row.id, { value: e.target.value })} placeholder="Assignee" />
                  )}

                  {row.field === "due_date" && (
                    <Input type="date" value={row.value} onChange={(e) => updateRow(row.id, { value: e.target.value })} />
                  )}

                  <Button variant="ghost" size="sm" onClick={() => removeRow(row.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={addRow}>+ Add filter</Button>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearAll}>Clear all</Button>
                <Button size="sm" onClick={applyFilters}>Apply</Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
