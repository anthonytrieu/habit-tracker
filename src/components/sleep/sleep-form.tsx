"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSleep } from "@/lib/hooks/use-sleep";
import { calculateSleepHours } from "@/lib/utils/sleep";
import { Trash2 } from "lucide-react";

interface SleepFormProps {
  date: string;
  userId: string | undefined;
}

export function SleepForm({ date, userId }: SleepFormProps) {
  const { sleepLog, loading, saveSleepLog, deleteSleepLog } = useSleep(
    userId,
    date
  );
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");

  useEffect(() => {
    if (sleepLog) {
      setBedtime(sleepLog.bedtime);
      setWakeTime(sleepLog.wake_time);
    } else {
      setBedtime("23:00");
      setWakeTime("07:00");
    }
  }, [sleepLog]);

  const hours = calculateSleepHours(bedtime, wakeTime);

  const handleSave = async () => {
    await saveSleepLog(bedtime, wakeTime);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sleep</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bedtime">Bedtime</Label>
            <Input
              id="bedtime"
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wake-time">Wake time</Label>
            <Input
              id="wake-time"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {hours.toFixed(1)} hours
        </p>

        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            {sleepLog ? "Update" : "Save"}
          </Button>
          {sleepLog && (
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSleepLog}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
