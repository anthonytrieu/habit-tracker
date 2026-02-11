"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "@/lib/types/database";

interface MonthlyTodoListProps {
  todos: Todo[];
  month: number;
  year: number;
}

export function MonthlyTodoList({ todos }: MonthlyTodoListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const todo of todos) {
      const existing = map.get(todo.date) ?? [];
      existing.push(todo);
      map.set(todo.date, existing);
    }
    // Sort by date ascending
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [todos]);

  function toggleDate(date: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }

  if (todos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Todos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4 text-center">
            No todos this month
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {grouped.map(([date, dayTodos]) => {
          const isExpanded = expanded.has(date);
          const completedCount = dayTodos.filter((t) => t.completed).length;

          return (
            <div key={date}>
              <button
                onClick={() => toggleDate(date)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-accent transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1 text-sm font-medium">
                  {format(parseISO(date), "EEE, MMM d")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{dayTodos.length} completed
                </span>
              </button>

              {isExpanded && (
                <div className="ml-6 space-y-1 pb-2">
                  {dayTodos.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-2 py-1">
                      <Checkbox checked={todo.completed} disabled />
                      <span
                        className={`text-sm ${
                          todo.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {todo.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
