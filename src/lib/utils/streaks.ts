import { subDays, startOfDay, isBefore, isAfter, differenceInCalendarDays } from "date-fns";
import type { HabitLog } from "@/lib/types/database";
import { isScheduledForDay } from "./schedule";

export function calculateCurrentStreak(
  logs: HabitLog[],
  schedule: number[],
  upToDate: Date,
  habitCreatedAt: Date
): number {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  const createdStart = startOfDay(new Date(habitCreatedAt));
  let streak = 0;
  let current = startOfDay(upToDate);

  while (!isBefore(current, createdStart)) {
    if (!isScheduledForDay(schedule, current)) {
      current = subDays(current, 1);
      continue;
    }

    const dateStr = formatLocalDate(current);
    if (completedDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
    current = subDays(current, 1);
  }

  return streak;
}

export function calculateBestStreak(
  logs: HabitLog[],
  schedule: number[],
  habitCreatedAt: Date
): number {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  const createdStart = startOfDay(new Date(habitCreatedAt));
  const today = startOfDay(new Date());
  const totalDays = differenceInCalendarDays(today, createdStart);

  let best = 0;
  let current = 0;

  for (let i = 0; i <= totalDays; i++) {
    const day = new Date(createdStart);
    day.setDate(day.getDate() + i);

    if (!isScheduledForDay(schedule, day)) continue;

    const dateStr = formatLocalDate(day);
    if (completedDates.has(dateStr)) {
      current++;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }

  return best;
}

export function calculateCompletionRate(
  logs: HabitLog[],
  schedule: number[],
  habitCreatedAt: Date
): number {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  const createdStart = startOfDay(new Date(habitCreatedAt));
  const today = startOfDay(new Date());
  const totalDays = differenceInCalendarDays(today, createdStart);

  let scheduled = 0;
  let completed = 0;

  for (let i = 0; i <= totalDays; i++) {
    const day = new Date(createdStart);
    day.setDate(day.getDate() + i);

    if (!isScheduledForDay(schedule, day)) continue;
    scheduled++;

    const dateStr = formatLocalDate(day);
    if (completedDates.has(dateStr)) {
      completed++;
    }
  }

  if (scheduled === 0) return 0;
  return Math.round((completed / scheduled) * 100);
}

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
