"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateAverageCompletion,
  getBestDay,
} from "@/lib/utils/insights";
import type { Habit, HabitLog } from "@/lib/types/database";

interface StatsCardsProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function StatsCards({ habits, logs }: StatsCardsProps) {
  const avg7 = useMemo(
    () => calculateAverageCompletion(habits, logs, 7),
    [habits, logs]
  );

  const avg30 = useMemo(
    () => calculateAverageCompletion(habits, logs, 30),
    [habits, logs]
  );

  const bestDay = useMemo(
    () => getBestDay(habits, logs, new Date()),
    [habits, logs]
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            7-Day Average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{avg7}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            30-Day Average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{avg30}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Best Day This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestDay ? (
            <>
              <p className="text-2xl font-bold">{bestDay.percentage}%</p>
              <p className="text-sm text-muted-foreground">
                {format(bestDay.date, "MMM d")}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
