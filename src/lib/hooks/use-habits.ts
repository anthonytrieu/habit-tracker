"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Habit, HabitLog } from "@/lib/types/database";
import { isScheduledForDay } from "@/lib/utils/schedule";

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("position", { ascending: true });

    if (!error && data) {
      setHabits(data as Habit[]);
    }
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const getHabitById = useCallback(
    async (habitId: string): Promise<Habit | null> => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("id", habitId)
        .single();

      if (error) return null;
      return data as Habit;
    },
    [supabase]
  );

  const createHabit = useCallback(
    async (name: string, schedule: number[]): Promise<Habit | null> => {
      if (!userId) return null;

      const maxPos = habits.length > 0
        ? Math.max(...habits.map((h) => h.position))
        : -1;

      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: userId,
          name,
          schedule,
          position: maxPos + 1,
        })
        .select()
        .single();

      if (error) return null;
      const newHabit = data as Habit;
      setHabits((prev) => [...prev, newHabit]);
      return newHabit;
    },
    [userId, habits, supabase]
  );

  const updateHabit = useCallback(
    async (
      habitId: string,
      updates: { name?: string; schedule?: number[] }
    ): Promise<Habit | null> => {
      const { data, error } = await supabase
        .from("habits")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", habitId)
        .select()
        .single();

      if (error) return null;
      const updated = data as Habit;
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? updated : h))
      );
      return updated;
    },
    [supabase]
  );

  const archiveHabit = useCallback(
    async (habitId: string): Promise<void> => {
      const { error } = await supabase
        .from("habits")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", habitId);

      if (!error) {
        setHabits((prev) => prev.filter((h) => h.id !== habitId));
      }
    },
    [supabase]
  );

  const deleteHabit = useCallback(
    async (habitId: string): Promise<void> => {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (!error) {
        setHabits((prev) => prev.filter((h) => h.id !== habitId));
      }
    },
    [supabase]
  );

  const getScheduledHabitsForDate = useCallback(
    (date: Date): Habit[] => {
      return habits.filter((h) => isScheduledForDay(h.schedule, date));
    },
    [habits]
  );

  return {
    habits,
    loading,
    fetchHabits,
    getHabitById,
    createHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    getScheduledHabitsForDate,
  };
}

export function useHabitLogs(habitId: string | undefined) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLogs = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (!habitId) return;
      setLoading(true);

      let query = supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId);

      if (startDate) query = query.gte("date", startDate);
      if (endDate) query = query.lte("date", endDate);

      const { data, error } = await query.order("date", { ascending: true });

      if (!error && data) {
        setLogs(data as HabitLog[]);
      }
      setLoading(false);
    },
    [habitId, supabase]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const toggleHabitCompletion = useCallback(
    async (date: string): Promise<void> => {
      if (!habitId) return;

      const existing = logs.find(
        (l) => l.date === date
      );

      if (existing) {
        if (existing.completed) {
          // Delete the log entry to mark as not done
          const { error } = await supabase
            .from("habit_logs")
            .delete()
            .eq("id", existing.id);

          if (!error) {
            setLogs((prev) => prev.filter((l) => l.id !== existing.id));
          }
        } else {
          // Update existing to completed
          const { data, error } = await supabase
            .from("habit_logs")
            .update({ completed: true })
            .eq("id", existing.id)
            .select()
            .single();

          if (!error && data) {
            setLogs((prev) =>
              prev.map((l) => (l.id === existing.id ? (data as HabitLog) : l))
            );
          }
        }
      } else {
        // Insert new completed log
        const { data, error } = await supabase
          .from("habit_logs")
          .insert({
            habit_id: habitId,
            date,
            completed: true,
          })
          .select()
          .single();

        if (!error && data) {
          setLogs((prev) => [...prev, data as HabitLog].sort(
            (a, b) => a.date.localeCompare(b.date)
          ));
        }
      }
    },
    [habitId, logs, supabase]
  );

  const isDateCompleted = useCallback(
    (date: string): boolean => {
      return logs.some((l) => l.date === date && l.completed);
    },
    [logs]
  );

  return {
    logs,
    loading,
    fetchLogs,
    toggleHabitCompletion,
    isDateCompleted,
  };
}
