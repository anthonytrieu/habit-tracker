"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitHeatmap } from "@/components/habits/habit-heatmap";
import { StreakBadge } from "@/components/habits/streak-badge";
import { HabitForm } from "@/components/habits/habit-form";
import { useHabits, useHabitLogs } from "@/lib/hooks/use-habits";
import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateCompletionRate,
} from "@/lib/utils/streaks";
import { getScheduleSummary } from "@/lib/utils/schedule";
import type { Habit } from "@/lib/types/database";

// TODO: Replace with actual auth
const TEMP_USER_ID = "temp-user-id";

export default function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getHabitById, updateHabit, archiveHabit } = useHabits(TEMP_USER_ID);
  const { logs, loading: logsLoading } = useHabitLogs(id);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    async function load() {
      const h = await getHabitById(id);
      setHabit(h);
      setLoading(false);
    }
    load();
  }, [id, getHabitById]);

  const currentStreak = useMemo(() => {
    if (!habit) return 0;
    return calculateCurrentStreak(
      logs,
      habit.schedule,
      new Date(),
      new Date(habit.created_at)
    );
  }, [logs, habit]);

  const bestStreak = useMemo(() => {
    if (!habit) return 0;
    return calculateBestStreak(
      logs,
      habit.schedule,
      new Date(habit.created_at)
    );
  }, [logs, habit]);

  const completionRate = useMemo(() => {
    if (!habit) return 0;
    return calculateCompletionRate(
      logs,
      habit.schedule,
      new Date(habit.created_at)
    );
  }, [logs, habit]);

  const handleArchive = useCallback(async () => {
    if (!habit) return;
    setArchiving(true);
    await archiveHabit(habit.id);
    setArchiving(false);
    router.push("/habits");
  }, [habit, archiveHabit, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <p className="text-muted-foreground">Habit not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/habits">
            <ArrowLeft className="size-4" />
            Back to Habits
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/habits">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{habit.name}</h1>
            <StreakBadge streak={currentStreak} />
          </div>
          <p className="text-muted-foreground">
            {getScheduleSummary(habit.schedule)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{currentStreak}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bestStreak}</p>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <HabitHeatmap logs={logs} range="1y" size="lg" />
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Danger zone */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Danger Zone
        </h3>
        <Button
          variant="destructive"
          onClick={() => setArchiveOpen(true)}
        >
          <Trash2 className="size-4" />
          Archive Habit
        </Button>
      </div>

      {/* Edit Dialog */}
      <HabitForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={async (name, schedule) => {
          const updated = await updateHabit(habit.id, { name, schedule });
          if (updated) setHabit(updated);
        }}
        initialName={habit.name}
        initialSchedule={habit.schedule}
        title="Edit Habit"
      />

      {/* Archive Confirmation */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive &ldquo;{habit.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              This will hide the habit from your active views. Your data will
              be preserved and can be restored later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setArchiveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchive}
              disabled={archiving}
            >
              {archiving ? "Archiving..." : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
