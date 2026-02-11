"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Todo } from "@/lib/types/database";

export function useMonthlyTodos(
  userId: string | undefined,
  startDate: string,
  endDate: string
) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("position", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setTodos(data);
        }
        setLoading(false);
      });
  }, [userId, startDate, endDate, supabase]);

  return { todos, loading };
}
