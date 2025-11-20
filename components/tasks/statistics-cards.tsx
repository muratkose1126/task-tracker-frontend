/**
 * StatisticsCards Component
 * Displays 4 statistics cards (Total, To Do, In Progress, Done)
 */

import { Card, CardContent } from "@/components/ui/card";
import { ListTodo, CheckCircle2, Clock, BarChart3 } from "lucide-react";

interface StatisticsCardsProps {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
}

export function StatisticsCards({
  total,
  todo,
  inProgress,
  completed,
}: StatisticsCardsProps) {
  const stats = [
    {
      title: "Total Tasks",
      value: total,
      icon: BarChart3,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "To Do",
      value: todo,
      icon: ListTodo,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="border-0 bg-linear-to-br from-background to-muted/20 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl ${stat.bg} p-3`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <div className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
