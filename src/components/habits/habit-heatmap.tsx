"use client";

import { useMemo } from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";
import type { HabitLog } from "@/lib/types/database";
import { subDays, subMonths, format, startOfDay, eachDayOfInterval } from "date-fns";

interface HabitHeatmapProps {
  logs: HabitLog[];
  range: "30d" | "90d" | "1y";
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: 8,
  md: 11,
  lg: 14,
};

export function HabitHeatmap({ logs, range, size = "md" }: HabitHeatmapProps) {
  const activities: Activity[] = useMemo(() => {
    const today = startOfDay(new Date());
    let startDate: Date;

    switch (range) {
      case "30d":
        startDate = subDays(today, 30);
        break;
      case "90d":
        startDate = subDays(today, 90);
        break;
      case "1y":
        startDate = subMonths(today, 12);
        break;
    }

    const completedDates = new Set(
      logs.filter((l) => l.completed).map((l) => l.date)
    );

    const days = eachDayOfInterval({ start: startDate, end: today });
    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      return {
        date: dateStr,
        count: completedDates.has(dateStr) ? 1 : 0,
        level: completedDates.has(dateStr) ? 4 : 0,
      } satisfies Activity;
    });
  }, [logs, range]);

  return (
    <div className="overflow-hidden">
      <ActivityCalendar
        data={activities}
        blockSize={sizeMap[size]}
        blockMargin={size === "sm" ? 2 : 3}
        blockRadius={2}
        showColorLegend={false}
        showMonthLabels={range !== "30d"}
        showTotalCount={false}
        showWeekdayLabels={range !== "30d" && size !== "sm"}
        theme={{
          light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
          dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
        }}
      />
    </div>
  );
}
