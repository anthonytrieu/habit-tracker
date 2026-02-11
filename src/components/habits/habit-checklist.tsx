"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StreakBadge } from "./streak-badge";
import { HabitForm } from "./habit-form";
import { useHabits, useHabitLogs } from "@/lib/hooks/use-habits";
import { calculateCurrentStreak } from "@/lib/utils/streaks";
import { toDateString } from "@/lib/utils/date";
import type { Habit, HabitLog } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";

interface HabitChecklistProps {
  userId: string;
  date: Date;
}

export function HabitChecklist({ userId, date }: HabitChecklistProps) {
  const { habits, loading, getScheduledHabitsForDate, createHabit } =
    useHabits(userId);
  const [formOpen, setFormOpen] = useState(false);

  const scheduledHabits = useMemo(
    () => getScheduledHabitsForDate(date),
    [getScheduledHabitsForDate, date]
  );

  const dateStr = toDateString(date);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const completedCount = 0; // Will be calculated by individual rows

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Habits</h2>
        <Button variant="ghost" size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {scheduledHabits.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No habits scheduled for today
        </p>
      ) : (
        <div className="space-y-1">
          {scheduledHabits.map((habit) => (
            <HabitChecklistRow key={habit.id} habit={habit} date={dateStr} />
          ))}
        </div>
      )}

      <HabitForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (name, schedule) => {
          await createHabit(name, schedule);
        }}
      />
    </div>
  );
}

function HabitChecklistRow({
  habit,
  date,
}: {
  habit: Habit;
  date: string;
}) {
  const { logs, loading, toggleHabitCompletion, isDateCompleted } =
    useHabitLogs(habit.id);
  const completed = isDateCompleted(date);

  const streak = useMemo(
    () =>
      calculateCurrentStreak(
        logs,
        habit.schedule,
        new Date(date),
        new Date(habit.created_at)
      ),
    [logs, habit.schedule, date, habit.created_at]
  );

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-accent/50">
      <Checkbox
        checked={completed}
        onCheckedChange={() => toggleHabitCompletion(date)}
        disabled={loading}
      />
      <span
        className={`flex-1 text-sm font-medium ${
          completed ? "line-through text-muted-foreground" : ""
        }`}
      >
        {habit.name}
      </span>
      <StreakBadge streak={streak} />
    </div>
  );
}
