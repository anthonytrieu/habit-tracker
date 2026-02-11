import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 tabular-nums", className)}
    >
      <Flame className="size-3 text-orange-500" />
      {streak}
    </Badge>
  );
}
