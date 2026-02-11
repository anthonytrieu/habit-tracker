export type Habit = {
  id: string;
  user_id: string;
  name: string;
  schedule: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  position: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  created_at: string;
};

export type Todo = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  text: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type SleepLog = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD (date user woke up)
  bedtime: string; // HH:MM
  wake_time: string; // HH:MM
  hours: number;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  user_id: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};
