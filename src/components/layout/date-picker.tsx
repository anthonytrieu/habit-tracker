"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useDate } from "@/lib/hooks/use-date";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function DatePicker() {
  const { selectedDate, setSelectedDate } = useDate();
  const [open, setOpen] = useState(false);
  const dateObj = parseISO(selectedDate);
  const today = format(new Date(), "yyyy-MM-dd");
  const isToday = selectedDate === today;

  return (
    <div className="flex items-center gap-2">
      {!isToday && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDate(today)}
        >
          Today
        </Button>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(dateObj, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={dateObj}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(format(date, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
            defaultMonth={dateObj}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
