# Agent 1: Auth & Database Setup

## Responsibility
Set up Supabase authentication, auth pages (login/signup), auth middleware, and the dashboard layout with navigation and global date picker.

## Files to Create/Edit

### Auth Pages
1. **`src/app/(auth)/login/page.tsx`** — Login page with email/password form + Google OAuth button
2. **`src/app/(auth)/signup/page.tsx`** — Signup page with email/password form + Google OAuth button
3. **`src/app/(auth)/layout.tsx`** — Centered auth layout wrapper

### Dashboard Layout
4. **`src/app/(dashboard)/layout.tsx`** — Dashboard shell: top nav + date picker + content area
5. **`src/components/layout/top-nav.tsx`** — Top navigation bar with links: Today | Habits | Insights | Settings
6. **`src/components/layout/date-picker.tsx`** — Global date picker component (defaults to today)

### Date Context
7. **`src/lib/hooks/use-date.ts`** — React context provider for selected date, synced with URL `?date=` param

### Settings Page
8. **`src/app/(dashboard)/settings/page.tsx`** — Settings page with logout button + timezone selector

### Root
9. **`src/app/page.tsx`** — Root redirect to `/today`
10. **`src/app/layout.tsx`** — Root layout (update with Sonner toaster)

## Implementation Details

### Auth Flow
- Use `@supabase/ssr` for server-side auth
- Middleware (already created at `src/middleware.ts`) redirects unauthenticated users to `/login`
- Login/signup forms use Supabase client-side `signInWithPassword` and `signUp`
- Google OAuth uses `signInWithOAuth` with redirect to `/auth/callback`
- Create `src/app/auth/callback/route.ts` for OAuth callback handling

### Dashboard Layout
- Top nav: horizontal bar, desktop-first
- Links: Today | Habits | Insights | Settings
- Active link highlighted
- Date picker on the right side of nav, uses shadcn Calendar + Popover
- "Today" button to quickly reset to current date

### Date Context
- `DateProvider` wraps dashboard layout
- `useDate()` hook returns `{ selectedDate, setSelectedDate }`
- Date stored as YYYY-MM-DD string
- Synced bidirectionally with `?date=` URL query param
- Default: today's date

### Settings Page
- Timezone selector: dropdown with common timezones (use Intl.supportedValuesOf('timeZone'))
- Save timezone to `user_settings` table (upsert)
- Logout button: calls `supabase.auth.signOut()`, redirects to `/login`

## Existing Files (already created)
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server Supabase client
- `src/lib/supabase/middleware.ts` — Auth session middleware
- `src/middleware.ts` — Next.js middleware
- `src/lib/types/database.ts` — TypeScript types
- `supabase/migrations/001_initial_schema.sql` — DB schema

## Dependencies Available
- `@supabase/supabase-js`, `@supabase/ssr`
- shadcn/ui: button, card, input, label, popover, calendar, select, separator, sonner, navigation-menu, dropdown-menu
- `date-fns` for date formatting
