"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "./streak-badge";
import { HabitHeatmap } from "./habit-heatmap";
import { useHabitLogs } from "@/lib/hooks/use-habits";
import {
  calculateCurrentStreak,
  calculateBestStreak,
} from "@/lib/utils/streaks";
import { getScheduleSummary, isScheduledForDay } from "@/lib/utils/schedule";
import { toDateString } from "@/lib/utils/date";
import type { Habit } from "@/lib/types/database";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { logs, loading, toggleHabitCompletion, isDateCompleted } =
    useHabitLogs(habit.id);

  const today = new Date();
  const todayStr = toDateString(today);
  const isScheduledToday = isScheduledForDay(habit.schedule, today);
  const completedToday = isDateCompleted(todayStr);

  const currentStreak = useMemo(
    () =>
      calculateCurrentStreak(
        logs,
        habit.schedule,
        today,
        new Date(habit.created_at)
      ),
    [logs, habit.schedule, habit.created_at]
  );

  const bestStreak = useMemo(
    () =>
      calculateBestStreak(logs, habit.schedule, new Date(habit.created_at)),
    [logs, habit.schedule, habit.created_at]
  );

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Link
        href={`/habits/${habit.id}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${habit.name} details`}
      />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{habit.name}</CardTitle>
            <CardDescription>
              {getScheduleSummary(habit.schedule)}
            </CardDescription>
          </div>
          <StreakBadge streak={currentStreak} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <HabitHeatmap logs={logs} range="90d" size="sm" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Best streak: {bestStreak}</span>
          <Button
            variant={completedToday ? "secondary" : "outline"}
            size="sm"
            className="relative z-10"
            disabled={!isScheduledToday || loading}
            onClick={(e) => {
              e.preventDefault();
              toggleHabitCompletion(todayStr);
            }}
          >
            {completedToday ? (
              <>
                <Check className="size-3.5" />
                Done
              </>
            ) : (
              "Mark Today"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
