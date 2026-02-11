import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import type { Habit, HabitLog } from "@/lib/types/database";

/**
 * Check if a habit is scheduled for a given day of the week.
 */
function isScheduledForDay(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return habit.schedule.includes(dayOfWeek);
}

/**
 * Calculate daily completion stats for a given date.
 * Only habits scheduled for that day count in the denominator.
 */
export function calculateDailyCompletion(
  habits: Habit[],
  logs: HabitLog[],
  date: Date
): { completed: number; total: number; percentage: number } {
  const dateStr = format(date, "yyyy-MM-dd");

  const scheduledHabits = habits.filter(
    (h) =>
      !h.archived_at &&
      isScheduledForDay(h, date) &&
      new Date(h.created_at) <= date
  );
  const total = scheduledHabits.length;

  if (total === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const scheduledIds = new Set(scheduledHabits.map((h) => h.id));
  const completed = logs.filter(
    (log) =>
      log.date === dateStr && log.completed && scheduledIds.has(log.habit_id)
  ).length;

  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
}

/**
 * Average completion percentage over last N days.
 */
export function calculateAverageCompletion(
  habits: Habit[],
  logs: HabitLog[],
  days: number
): number {
  const today = new Date();
  let totalPercentage = 0;
  let daysWithHabits = 0;

  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    const { total, percentage } = calculateDailyCompletion(habits, logs, date);
    if (total > 0) {
      totalPercentage += percentage;
      daysWithHabits++;
    }
  }

  if (daysWithHabits === 0) return 0;
  return Math.round(totalPercentage / daysWithHabits);
}

/**
 * Find the day with the highest completion percentage in a given month.
 */
export function getBestDay(
  habits: Habit[],
  logs: HabitLog[],
  month: Date
): { date: Date; percentage: number } | null {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const today = new Date();
  const effectiveEnd = end > today ? today : end;

  const days = eachDayOfInterval({ start, end: effectiveEnd });

  let best: { date: Date; percentage: number } | null = null;

  for (const day of days) {
    const { total, percentage } = calculateDailyCompletion(habits, logs, day);
    if (total > 0 && (best === null || percentage > best.percentage)) {
      best = { date: day, percentage };
    }
  }

  return best;
}
