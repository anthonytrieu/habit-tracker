"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { useHabits } from "@/lib/hooks/use-habits";
import { createClient } from "@/lib/supabase/client";

export default function HabitsPage() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { habits, loading, createHabit } = useHabits(userId ?? "");
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Track your daily habits and build streaks
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          New Habit
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <p className="text-muted-foreground mb-4">No habits yet</p>
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Create your first habit
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}

      <HabitForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={async (name, schedule) => {
          await createHabit(name, schedule);
        }}
      />
    </div>
  );
}
