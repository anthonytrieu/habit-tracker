"use client";

import { useEffect, useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useSleepLogs } from "@/lib/hooks/use-sleep";
import { useMonthlyTodos } from "@/lib/hooks/use-monthly-todos";
import { MonthPicker } from "@/components/overview/month-picker";
import { OverviewStatsCards } from "@/components/overview/overview-stats-cards";
import { MonthlyHabitGrid } from "@/components/overview/monthly-habit-grid";
import { MonthlyTodoList } from "@/components/overview/monthly-todo-list";
import { SleepChart } from "@/components/sleep/sleep-chart";
import type { Habit, HabitLog } from "@/lib/types/database";

export default function OverviewPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    () => new Date().getFullYear()
  );
  const [userId, setUserId] = useState<string>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const startDate = useMemo(
    () =>
      format(startOfMonth(new Date(selectedYear, selectedMonth)), "yyyy-MM-dd"),
    [selectedMonth, selectedYear]
  );
  const endDate = useMemo(
    () =>
      format(endOfMonth(new Date(selectedYear, selectedMonth)), "yyyy-MM-dd"),
    [selectedMonth, selectedYear]
  );

  const monthLabel = format(
    new Date(selectedYear, selectedMonth),
    "MMMM yyyy"
  );

  const { logs: sleepLogs } = useSleepLogs(userId, startDate, endDate);
  const { todos } = useMonthlyTodos(userId, startDate, endDate);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      setLoading(true);

      const [habitsRes, logsRes] = await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .is("archived_at", null)
          .order("position", { ascending: true }),
        supabase
          .from("habit_logs")
          .select("*")
          .gte("date", startDate)
          .lte("date", endDate),
      ]);

      if (habitsRes.data) setHabits(habitsRes.data);
      if (logsRes.data) setHabitLogs(logsRes.data);
      setLoading(false);
    }

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Overview</h1>
          <MonthPicker
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <MonthPicker
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </div>

      <OverviewStatsCards
        habits={habits}
        habitLogs={habitLogs}
        sleepLogs={sleepLogs}
        todos={todos}
        month={selectedMonth}
        year={selectedYear}
      />

      {habits.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Habits</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => (
              <MonthlyHabitGrid
                key={habit.id}
                habit={habit}
                logs={habitLogs.filter((l) => l.habit_id === habit.id)}
                month={selectedMonth}
                year={selectedYear}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="text-muted-foreground">No habits to display</p>
        </div>
      )}

      <SleepChart logs={sleepLogs} title={`Sleep (${monthLabel})`} />

      <MonthlyTodoList
        todos={todos}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  );
}
