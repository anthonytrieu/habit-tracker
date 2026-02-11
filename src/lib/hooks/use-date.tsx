"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";

type DateContextValue = {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
};

const DateContext = createContext<DateContextValue | null>(null);

function getToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}

function isValidDateString(date: string): boolean {
  const parsed = parseISO(date);
  return isValid(parsed) && /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function DateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const initialDate =
    dateParam && isValidDateString(dateParam) ? dateParam : getToday();

  const [selectedDate, setSelectedDateState] = useState(initialDate);

  // Sync from URL to state when URL changes
  useEffect(() => {
    if (dateParam && isValidDateString(dateParam) && dateParam !== selectedDate) {
      setSelectedDateState(dateParam);
    }
  }, [dateParam, selectedDate]);

  // Sync state to URL
  const setSelectedDate = useCallback(
    (date: string) => {
      setSelectedDateState(date);
      const params = new URLSearchParams(searchParams.toString());
      const today = getToday();
      if (date === today) {
        params.delete("date");
      } else {
        params.set("date", date);
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <DateContext value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext>
  );
}

export function useDate(): DateContextValue {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useDate must be used within a DateProvider");
  }
  return context;
}
