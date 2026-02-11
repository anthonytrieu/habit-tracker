"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateSleepHours } from "@/lib/utils/sleep";
import type { SleepLog } from "@/lib/types/database";

export function useSleep(userId: string | undefined, date: string) {
  const [sleepLog, setSleepLog] = useState<SleepLog | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSleepLog = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (!error) {
      setSleepLog(data);
    }
    setLoading(false);
  }, [userId, date, supabase]);

  useEffect(() => {
    fetchSleepLog();
  }, [fetchSleepLog]);

  const saveSleepLog = async (bedtime: string, wakeTime: string) => {
    if (!userId) return;
    const hours = calculateSleepHours(bedtime, wakeTime);

    const { data, error } = await supabase
      .from("sleep_logs")
      .upsert(
        {
          user_id: userId,
          date,
          bedtime,
          wake_time: wakeTime,
          hours,
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();

    if (!error && data) {
      setSleepLog(data);
    }
  };

  const deleteSleepLog = async () => {
    if (!sleepLog) return;
    const { error } = await supabase
      .from("sleep_logs")
      .delete()
      .eq("id", sleepLog.id);

    if (!error) {
      setSleepLog(null);
    }
  };

  return { sleepLog, loading, saveSleepLog, deleteSleepLog };
}

export function useSleepLogs(
  userId: string | undefined,
  startDate: string,
  endDate: string
) {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setLogs(data);
        }
        setLoading(false);
      });
  }, [userId, startDate, endDate, supabase]);

  return { logs, loading };
}
