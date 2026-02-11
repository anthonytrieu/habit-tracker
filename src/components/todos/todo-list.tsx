"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TodoItem } from "@/components/todos/todo-item";
import { useTodos } from "@/lib/hooks/use-todos";

interface TodoListProps {
  date: string;
  userId: string | undefined;
}

export function TodoList({ date, userId }: TodoListProps) {
  const { todos, loading, createTodo, toggleTodo, deleteTodo } = useTodos(
    userId,
    date
  );
  const [newText, setNewText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    await createTodo(text);
    setNewText("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Add a todo..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
        </form>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ) : todos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Nothing planned for this day
          </p>
        ) : (
          <div className="space-y-1">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
