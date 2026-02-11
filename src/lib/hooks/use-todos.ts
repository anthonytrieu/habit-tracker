"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Todo } from "@/lib/types/database";

export function useTodos(userId: string | undefined, date: string) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTodos = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .order("position", { ascending: true });

    if (!error && data) {
      setTodos(data);
    }
    setLoading(false);
  }, [userId, date, supabase]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (text: string) => {
    if (!userId) return;
    const position = todos.length;
    const { data, error } = await supabase
      .from("todos")
      .insert({ user_id: userId, date, text, completed: false, position })
      .select()
      .single();

    if (!error && data) {
      setTodos((prev) => [...prev, data]);
    }
  };

  const toggleTodo = async (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;
    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", todoId);

    if (!error) {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId ? { ...t, completed: !t.completed } : t
        )
      );
    }
  };

  const deleteTodo = async (todoId: string) => {
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", todoId);

    if (!error) {
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
    }
  };

  const updateTodoText = async (todoId: string, text: string) => {
    const { error } = await supabase
      .from("todos")
      .update({ text })
      .eq("id", todoId);

    if (!error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, text } : t))
      );
    }
  };

  return { todos, loading, createTodo, toggleTodo, deleteTodo, updateTodoText };
}
