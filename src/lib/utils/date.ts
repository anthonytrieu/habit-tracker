import { format, parseISO } from "date-fns";

export function formatDate(date: Date | string, pattern = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function fromDateString(dateStr: string): Date {
  return parseISO(dateStr);
}

export function getTodayString(): string {
  return toDateString(new Date());
}
