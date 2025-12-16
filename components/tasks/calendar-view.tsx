"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { tr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import type { Task } from "@/types/task";

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick?: (date: Date) => void;
}

export function CalendarView({ tasks, onTaskClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group tasks by date
  const tasksByDate = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.due_date) {
        const dateKey = task.due_date;
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const getTasksForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return tasksByDate[dateKey] || [];
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const today = new Date();

  // Get all days to display (including days from prev/next month for grid)
  const firstDay = monthStart.getDay();
  const displayDays: (Date | null)[] = [];
  
  // Add prev month days
  for (let i = firstDay - 1; i >= 0; i--) {
    displayDays.push(new Date(monthStart.getTime() - (i + 1) * 24 * 60 * 60 * 1000));
  }
  
  // Add current month days
  daysInMonth.forEach((day) => displayDays.push(day));
  
  // Add next month days to fill the grid
  const remainingDays = 42 - displayDays.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    displayDays.push(new Date(monthEnd.getTime() + i * 24 * 60 * 60 * 1000));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy", { locale: tr })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-semibold">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {displayDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="border" />;
            
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, today);
            const dayTasks = getTasksForDate(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateClick?.(day)}
                className={`min-h-[120px] border p-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                  isCurrentMonth ? "bg-background" : "bg-muted/30"
                } ${isToday ? "bg-blue-50 dark:bg-blue-950" : ""}`}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    isToday
                      ? "text-blue-600 dark:text-blue-400"
                      : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(day, "d")}
                </div>

                {/* Tasks for this day */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                        task.status === "done"
                          ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                          : task.priority === "high"
                          ? "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
                          : task.priority === "medium"
                          ? "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100"
                          : "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
