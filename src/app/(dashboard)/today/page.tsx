"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { TodoList } from "@/components/todos/todo-list";
import { SleepForm } from "@/components/sleep/sleep-form";
import { useDate } from "@/lib/hooks/use-date";
import { createClient } from "@/lib/supabase/client";

export default function TodayPage() {
  const { selectedDate } = useDate();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const dateObj = parseISO(selectedDate);

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Today</h1>
        <p className="text-muted-foreground">
          {format(dateObj, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {userId && (
        <>
          {/* Habits Section */}
          <section>
            <HabitChecklist userId={userId} date={dateObj} />
          </section>

          <Separator />

          {/* Todo Section */}
          <section>
            <TodoList date={selectedDate} userId={userId} />
          </section>

          <Separator />

          {/* Sleep Section */}
          <section>
            <SleepForm date={selectedDate} userId={userId} />
          </section>
        </>
      )}
    </div>
  );
}
