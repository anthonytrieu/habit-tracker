"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SleepLog } from "@/lib/types/database";

interface SleepChartProps {
  logs: SleepLog[];
  title?: string;
}

export function SleepChart({ logs, title = "Sleep (Last 30 Days)" }: SleepChartProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No sleep data yet. Start logging your sleep to see trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = logs.map((log) => ({
    date: log.date,
    hours: log.hours,
    label: format(parseISO(log.date), "MMM d"),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis domain={[0, 12]} tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-muted-foreground">
                      {item.hours.toFixed(1)} hours
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine
              y={8}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "8h recommended",
                position: "insideTopRight",
                fontSize: 11,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
