# Agent 2: Habits Feature

## Responsibility
Build the complete habits feature: CRUD operations, Today page habit checklist, streak calculation, heatmaps, Habits page grid, and habit detail page.

## Files to Create

### Utility Functions
1. **`src/lib/utils/streaks.ts`** — Streak calculation functions
2. **`src/lib/utils/schedule.ts`** — Day-of-week helpers (isScheduledForDay, getDayLabel, etc.)
3. **`src/lib/utils/date.ts`** — Date formatting utilities

### Data Hook
4. **`src/lib/hooks/use-habits.ts`** — Custom hook for habit CRUD + habit logs

### Components
5. **`src/components/habits/habit-form.tsx`** — Create/edit habit form (name + schedule day picker)
6. **`src/components/habits/habit-checklist.tsx`** — Today page: list of scheduled habits with checkboxes
7. **`src/components/habits/streak-badge.tsx`** — Small badge showing current streak count
8. **`src/components/habits/habit-heatmap.tsx`** — GitHub-style heatmap (configurable: 30d, 90d, 1yr)
9. **`src/components/habits/habit-card.tsx`** — Card for Habits page grid

### Pages
10. **`src/app/(dashboard)/today/page.tsx`** — Today page (habits section only; todos and sleep sections will be added later by other agents)
11. **`src/app/(dashboard)/habits/page.tsx`** — Habits grid page
12. **`src/app/(dashboard)/habits/[id]/page.tsx`** — Habit detail page

## Implementation Details

### Habit CRUD (`use-habits.ts`)
```typescript
// Functions to expose:
- getHabits(userId): Habit[] — active habits, ordered by position
- getHabitById(habitId): Habit
- createHabit(name, schedule): Habit
- updateHabit(habitId, { name?, schedule? }): Habit
- archiveHabit(habitId): void — sets archived_at
- deleteHabit(habitId): void — only for truly removing (use archive normally)
- getHabitLogs(habitId, startDate, endDate): HabitLog[]
- toggleHabitCompletion(habitId, date): void — upsert: insert if not exists, toggle if exists
- getScheduledHabitsForDate(userId, date): Habit[] — filters by schedule matching day of week
```

### Streak Calculation (`streaks.ts`)
```typescript
function calculateCurrentStreak(
  logs: HabitLog[],
  schedule: number[],
  upToDate: Date,
  habitCreatedAt: Date
): number
// Walk backwards from upToDate
// Only check days that are in schedule AND >= habitCreatedAt
// Count consecutive completed days
// Stop at first scheduled day that is NOT completed

function calculateBestStreak(
  logs: HabitLog[],
  schedule: number[],
  habitCreatedAt: Date
): number
// Walk through all days from habitCreatedAt to today
// Track max consecutive completed scheduled days
```

### Schedule Helpers (`schedule.ts`)
```typescript
function isScheduledForDay(schedule: number[], date: Date): boolean
function getScheduleSummary(schedule: number[]): string // "Mon, Wed, Fri"
function getDayLabel(dayIndex: number): string // 0 → "Sun"
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
```

### Today Page — Habits Section
- Header: "Habits" with count "3/5"
- List of habits scheduled for the selected date
- Each row: checkbox (✓/empty), habit name, streak badge, mini 30-day heatmap
- Clicking checkbox calls `toggleHabitCompletion`
- If no habits scheduled: "No habits scheduled for today"
- "Add Habit" button

### Habits Page — Grid
- 3-column grid on desktop (responsive: 2 on medium, 1 on small)
- Each card shows: name, schedule summary, current/best streak, 90-day heatmap
- "Mark Today Done" button (disabled if not scheduled today or already done)
- "Create New Habit" card/button
- Click card → navigate to `/habits/[id]`

### Habit Detail Page
- Header with habit name (editable)
- Full 1-year heatmap
- Stats: completion rate (all time), current streak, best streak
- Edit schedule
- Archive button (with confirmation dialog)
- Back button to `/habits`

### Heatmap Component (`habit-heatmap.tsx`)
- Uses `react-activity-calendar` library
- Props: `logs: HabitLog[]`, `range: '30d' | '90d' | '1y'`, `size: 'sm' | 'md' | 'lg'`
- Transforms HabitLog[] into activity calendar format
- Green for completed, empty for not completed
- Tooltip on hover showing date and status

## Core Rules
- Binary only: done or not done
- No skip state — UI shows ✓ or empty
- Schedule changes don't retroactively affect past completions
- Streaks only count from habit creation date
- Archived habits hidden from active views but data preserved

## Dependencies Available
- `react-activity-calendar` for heatmaps
- `date-fns` for date manipulation
- shadcn/ui: card, checkbox, button, dialog, badge, input, label, separator, sheet, skeleton
- Supabase client at `@/lib/supabase/client`
- Types at `@/lib/types/database`
