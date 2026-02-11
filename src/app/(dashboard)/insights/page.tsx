"use client";

import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useSleepLogs } from "@/lib/hooks/use-sleep";
import { CompletionHeatmap } from "@/components/insights/completion-heatmap";
import { StatsCards } from "@/components/insights/stats-cards";
import { SleepChart } from "@/components/sleep/sleep-chart";
import type { Habit, HabitLog } from "@/lib/types/database";

export default function InsightsPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = format(subDays(new Date(), 29), "yyyy-MM-dd");

  const { logs: sleepLogs } = useSleepLogs(userId, thirtyDaysAgo, today);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const yearAgo = format(subDays(new Date(), 365), "yyyy-MM-dd");

      const [habitsRes, logsRes] = await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .is("archived_at", null),
        supabase
          .from("habit_logs")
          .select("*")
          .gte("date", yearAgo)
          .lte("date", today),
      ]);

      if (habitsRes.data) setHabits(habitsRes.data);
      if (logsRes.data) setLogs(logsRes.data);
      setLoading(false);
    }
    init();
  }, [supabase, today]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Insights</h1>
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
      <h1 className="text-2xl font-bold">Insights</h1>
      <CompletionHeatmap habits={habits} logs={logs} />
      <StatsCards habits={habits} logs={logs} />
      <SleepChart logs={sleepLogs} />
    </div>
  );
}
