"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDailyCompletion } from "@/lib/utils/insights";
import type { Habit, HabitLog, SleepLog, Todo } from "@/lib/types/database";

interface OverviewStatsCardsProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  sleepLogs: SleepLog[];
  todos: Todo[];
  month: number;
  year: number;
}

export function OverviewStatsCards({
  habits,
  habitLogs,
  sleepLogs,
  todos,
  month,
  year,
}: OverviewStatsCardsProps) {
  const habitCompletion = useMemo(() => {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));
    const today = startOfDay(new Date());
    const effectiveEnd = monthEnd > today ? today : monthEnd;

    if (effectiveEnd < monthStart) return null;

    const days = eachDayOfInterval({ start: monthStart, end: effectiveEnd });
    let totalPct = 0;
    let daysWithHabits = 0;

    for (const day of days) {
      const { total, percentage } = calculateDailyCompletion(
        habits,
        habitLogs,
        day
      );
      if (total > 0) {
        totalPct += percentage;
        daysWithHabits++;
      }
    }

    if (daysWithHabits === 0) return null;
    return Math.round(totalPct / daysWithHabits);
  }, [habits, habitLogs, month, year]);

  const avgSleep = useMemo(() => {
    if (sleepLogs.length === 0) return null;
    const total = sleepLogs.reduce((sum, l) => sum + Number(l.hours), 0);
    return (total / sleepLogs.length).toFixed(1);
  }, [sleepLogs]);

  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, pct };
  }, [todos]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Habit Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {habitCompletion !== null ? `${habitCompletion}%` : "No data"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Sleep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {avgSleep !== null ? `${avgSleep} hrs` : "No data"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Todos Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {todoStats.total > 0
              ? `${todoStats.completed}/${todoStats.total} (${todoStats.pct}%)`
              : "No data"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
