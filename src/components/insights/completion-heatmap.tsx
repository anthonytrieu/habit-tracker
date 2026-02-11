"use client";

import { useMemo, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import type { Activity } from "react-activity-calendar";
import { format, subDays, subMonths, eachDayOfInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateDailyCompletion } from "@/lib/utils/insights";
import type { Habit, HabitLog } from "@/lib/types/database";

type Range = "30d" | "90d" | "year";

function getLevel(percentage: number): number {
  if (percentage === 0) return 0;
  if (percentage <= 25) return 1;
  if (percentage <= 50) return 2;
  if (percentage <= 75) return 3;
  return 4;
}

interface CompletionHeatmapProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function CompletionHeatmap({ habits, logs }: CompletionHeatmapProps) {
  const [range, setRange] = useState<Range>("90d");

  const data = useMemo(() => {
    const today = new Date();
    let startDate: Date;

    switch (range) {
      case "30d":
        startDate = subDays(today, 29);
        break;
      case "90d":
        startDate = subDays(today, 89);
        break;
      case "year":
        startDate = subMonths(today, 12);
        break;
    }

    const days = eachDayOfInterval({ start: startDate, end: today });

    const activities: Activity[] = days.map((day) => {
      const { completed, total, percentage } = calculateDailyCompletion(
        habits,
        logs,
        day
      );
      return {
        date: format(day, "yyyy-MM-dd"),
        count: completed,
        level: total === 0 ? 0 : getLevel(percentage),
      };
    });

    return activities;
  }, [habits, logs, range]);

  // Build a lookup for tooltip text
  const completionMap = useMemo(() => {
    const map = new Map<
      string,
      { completed: number; total: number; percentage: number }
    >();
    const today = new Date();
    const startDate = subMonths(today, 12);
    const days = eachDayOfInterval({ start: startDate, end: today });
    for (const day of days) {
      const result = calculateDailyCompletion(habits, logs, day);
      map.set(format(day, "yyyy-MM-dd"), result);
    }
    return map;
  }, [habits, logs]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Completion</CardTitle>
        <div className="flex gap-1">
          {(["30d", "90d", "year"] as const).map((r) => (
            <Button
              key={r}
              variant={range === r ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setRange(r)}
            >
              {r === "year" ? "Year" : r}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ActivityCalendar
          data={data}
          theme={{
            light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
            dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
          }}
          showTotalCount={false}
          showWeekdayLabels={["mon", "wed", "fri"]}
          tooltips={{
            activity: {
              text: (activity) => {
                const info = completionMap.get(activity.date);
                if (!info || info.total === 0)
                  return `No habits scheduled - ${format(new Date(activity.date + "T12:00:00"), "MMM d, yyyy")}`;
                return `${info.completed}/${info.total} completed (${info.percentage}%) - ${format(new Date(activity.date + "T12:00:00"), "MMM d, yyyy")}`;
              },
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
