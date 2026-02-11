# Agent 3: Todos, Sleep & Insights

## Responsibility
Build the todos feature, sleep logging with chart, and the insights page with completion heatmap and stats.

## Files to Create

### Todos
1. **`src/lib/hooks/use-todos.ts`** — Custom hook for todo CRUD
2. **`src/components/todos/todo-item.tsx`** — Single todo row (checkbox, text, delete button)
3. **`src/components/todos/todo-list.tsx`** — Full todo list section for Today page (input + list)

### Sleep
4. **`src/lib/hooks/use-sleep.ts`** — Custom hook for sleep log CRUD
5. **`src/lib/utils/sleep.ts`** — Sleep hours calculation utility
6. **`src/components/sleep/sleep-form.tsx`** — Bedtime/wake time inputs with auto-calc
7. **`src/components/sleep/sleep-chart.tsx`** — 30-day line chart of sleep hours

### Insights
8. **`src/lib/utils/insights.ts`** — Completion percentage calculations
9. **`src/components/insights/completion-heatmap.tsx`** — Overall daily % completion heatmap
10. **`src/components/insights/stats-cards.tsx`** — Summary stat cards
11. **`src/app/(dashboard)/insights/page.tsx`** — Full Insights page

## Implementation Details

### Todos

#### Hook (`use-todos.ts`)
```typescript
// Functions to expose:
- getTodos(userId, date): Todo[] — todos for a specific date, ordered by position
- createTodo(text, date): Todo
- toggleTodo(todoId): void — toggle completed
- deleteTodo(todoId): void
- updateTodoText(todoId, text): void
```

#### Todo Item (`todo-item.tsx`)
- Props: `todo: Todo`, `onToggle`, `onDelete`
- Checkbox + text (strike-through when completed) + delete (X) button
- Delete button visible on hover

#### Todo List (`todo-list.tsx`)
- Props: `date: string` (YYYY-MM-DD)
- Header: "Todos"
- Input field at top: placeholder "Add a todo...", submit on Enter
- List of TodoItems below
- Empty state: "Nothing planned for this day" (but input always visible)
- No rollover — todos are tied to their date

### Sleep

#### Sleep Utility (`sleep.ts`)
```typescript
function calculateSleepHours(bedtime: string, wakeTime: string): number
// Parse HH:MM strings
// If bedtime > wakeTime (e.g., 23:00 → 07:00), assume crossed midnight
// Example: bedtime 23:00, wake 07:00 → 8 hours
// Example: bedtime 01:00, wake 09:00 → 8 hours
// Return decimal hours rounded to 2 places
```

#### Hook (`use-sleep.ts`)
```typescript
// Functions to expose:
- getSleepLog(userId, date): SleepLog | null
- saveSleepLog(date, bedtime, wakeTime): SleepLog — upsert
- deleteSleepLog(id): void
- getSleepLogs(userId, startDate, endDate): SleepLog[] — for chart
```

#### Sleep Form (`sleep-form.tsx`)
- Props: `date: string`
- Two time inputs: "Bedtime" and "Wake time" (HTML time inputs or custom)
- Auto-calculated hours display: "8.0 hours"
- Save button
- If log exists for date, pre-fill form and show "Update" instead of "Save"
- Delete button if log exists

#### Sleep Chart (`sleep-chart.tsx`)
- Props: `logs: SleepLog[]`
- Recharts LineChart
- X-axis: dates (last 30 days)
- Y-axis: hours (scale 0-12)
- Line: sleep hours per day
- Tooltip showing date and hours
- Reference line at 8 hours (recommended)
- Empty state if no data

### Insights

#### Completion Calculation (`insights.ts`)
```typescript
function calculateDailyCompletion(
  habits: Habit[],
  logs: HabitLog[],
  date: Date
): { completed: number; total: number; percentage: number }
// total = habits scheduled for that day (exclude unscheduled)
// completed = scheduled habits that have a completed log for that day
// percentage = completed / total * 100 (0 if total is 0)

function calculateAverageCompletion(
  habits: Habit[],
  logs: HabitLog[],
  days: number
): number
// Average completion % over last N days

function getBestDay(
  habits: Habit[],
  logs: HabitLog[],
  month: Date
): { date: Date; percentage: number } | null
// Day with highest completion % in the given month
```

#### Completion Heatmap (`completion-heatmap.tsx`)
- Uses `react-activity-calendar`
- Color intensity represents daily completion %:
  - 0%: level 0 (empty)
  - 1-25%: level 1
  - 26-50%: level 2
  - 51-75%: level 3
  - 76-100%: level 4
- Tooltip: "3/5 completed (60%) — Feb 8, 2025"
- Range toggle buttons: 30d | 90d | Year
- Default range: 90d

#### Stats Cards (`stats-cards.tsx`)
- Card 1: "7-Day Average" — average completion % last 7 days
- Card 2: "30-Day Average" — average completion % last 30 days
- Card 3: "Best Day This Month" — date + percentage

#### Insights Page
Layout (top to bottom):
1. Page title: "Insights"
2. Completion heatmap with range toggle
3. Stats cards row (3 cards)
4. Sleep chart (last 30 days)

## Integration with Today Page
The Today page (`src/app/(dashboard)/today/page.tsx`) will be created by Agent 2 (habits).
This agent should create the todo and sleep components as standalone sections that can be imported into the Today page.

**After building components**, update the Today page to include:
```tsx
// In today/page.tsx, add after habits section:
<TodoList date={selectedDate} />
<SleepSection date={selectedDate} />
```

## Dependencies Available
- `recharts` for line chart
- `react-activity-calendar` for heatmaps
- `date-fns` for date manipulation
- shadcn/ui: card, button, input, checkbox, tabs, badge, skeleton, separator, tooltip
- Supabase client at `@/lib/supabase/client`
- Types at `@/lib/types/database`
