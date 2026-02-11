"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ALL_DAYS, getDayLabel } from "@/lib/utils/schedule";
import { cn } from "@/lib/utils";

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, schedule: number[]) => Promise<void>;
  initialName?: string;
  initialSchedule?: number[];
  title?: string;
}

export function HabitForm({
  open,
  onOpenChange,
  onSubmit,
  initialName = "",
  initialSchedule = ALL_DAYS,
  title = "New Habit",
}: HabitFormProps) {
  const [name, setName] = useState(initialName);
  const [schedule, setSchedule] = useState<number[]>(initialSchedule);
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day: number) => {
    setSchedule((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || schedule.length === 0) return;

    setSubmitting(true);
    await onSubmit(name.trim(), schedule);
    setSubmitting(false);
    setName("");
    setSchedule(ALL_DAYS);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Read, Meditate"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Schedule</Label>
            <div className="flex gap-1.5">
              {ALL_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    schedule.includes(day)
                      ? "bg-primary text-primary-foreground"
                      : "border border-input bg-background hover:bg-accent"
                  )}
                >
                  {getDayLabel(day).charAt(0)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select which days of the week to track this habit
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || schedule.length === 0 || submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
