"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isAfter,
  startOfDay,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isScheduledForDay } from "@/lib/utils/schedule";
import type { Habit, HabitLog } from "@/lib/types/database";

interface MonthlyHabitGridProps {
  habit: Habit;
  logs: HabitLog[];
  month: number; // 0-11
  year: number;
}

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

export function MonthlyHabitGrid({
  habit,
  logs,
  month,
  year,
}: MonthlyHabitGridProps) {
  const { cells, completedCount, scheduledCount } = useMemo(() => {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));
    const today = startOfDay(new Date());
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const habitCreatedAt = startOfDay(new Date(habit.created_at));

    const completedDates = new Set(
      logs.filter((l) => l.completed).map((l) => l.date)
    );

    const firstDayOffset = monthStart.getDay(); // 0=Sun
    const emptyCells = Array.from({ length: firstDayOffset }, (_, i) => ({
      key: `empty-${i}`,
      type: "empty" as const,
    }));

    let completed = 0;
    let scheduled = 0;

    const dayCells = days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const isFuture = isAfter(day, today);
      const isBeforeCreation = day < habitCreatedAt;
      const isScheduled = isScheduledForDay(habit.schedule, day);
      const isDone = completedDates.has(dateStr);

      if (isScheduled && !isFuture && !isBeforeCreation) scheduled++;
      if (isDone && isScheduled && !isBeforeCreation) completed++;

      let status: "completed" | "missed" | "unscheduled" | "future" | "precreation";
      if (isBeforeCreation) {
        status = "precreation";
      } else if (isFuture) {
        status = "future";
      } else if (!isScheduled) {
        status = "unscheduled";
      } else if (isDone) {
        status = "completed";
      } else {
        status = "missed";
      }

      return {
        key: dateStr,
        type: "day" as const,
        dayNumber: day.getDate(),
        status,
      };
    });

    return {
      cells: [...emptyCells, ...dayCells],
      completedCount: completed,
      scheduledCount: scheduled,
    };
  }, [habit.schedule, logs, month, year]);

  const completionPct =
    scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{habit.name}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{scheduledCount} ({completionPct}%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {DAY_HEADERS.map((d, i) => (
            <div
              key={`header-${i}`}
              className="flex h-6 items-center justify-center text-xs text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {cells.map((cell) => {
            if (cell.type === "empty") {
              return <div key={cell.key} className="h-8" />;
            }
            return (
              <div
                key={cell.key}
                className={`flex h-8 items-center justify-center rounded-sm text-xs font-medium ${getCellStyles(cell.status)}`}
                title={`${cell.key}: ${cell.status}`}
              >
                {cell.dayNumber}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function getCellStyles(
  status: "completed" | "missed" | "unscheduled" | "future" | "precreation"
): string {
  switch (status) {
    case "completed":
      return "bg-green-500 text-white dark:bg-green-600";
    case "missed":
      return "bg-muted text-muted-foreground";
    case "unscheduled":
      return "text-muted-foreground/40";
    case "future":
    case "precreation":
      return "text-muted-foreground/20";
  }
}
