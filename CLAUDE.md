# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PawGo** is a React + TypeScript SPA — a pet walking marketplace connecting dog owners with professional dog walkers. Built with Vite + SWC, shadcn/ui components, and Tailwind CSS. Deployed on Vercel.

## Repository

- **GitHub:** https://github.com/BlackKawa87/pawwalk
- **Branch principal:** `main`
- **Auto-push:** configurado via `.git/hooks/post-commit` — todo commit é enviado automaticamente ao GitHub sem precisar de `git push` manual.
- **Production URL:** https://pawgo-six.vercel.app

## Commands

```bash
pnpm dev        # Dev server at http://localhost:8080
pnpm build      # Production build (note: fails locally on Node v24 due to picomatch)
pnpm lint       # ESLint
pnpm preview    # Preview production build locally
npx tsc --noEmit  # Use this instead of pnpm build for local type-checking
```

> **Local build note:** `pnpm build` fails on Node v24 due to a picomatch/Vite incompatibility. Always use `npx tsc --noEmit` to validate locally, then deploy via `vercel --prod --yes`.

## Architecture

### Routing (`src/App.tsx`)
All routes are defined here. Do not define routes anywhere else.

| Path | Protection | Component |
|---|---|---|
| `/` | Public | `Index` |
| `/login` | Public | `Login` |
| `/signup` | Public | `Signup` |
| `/signup/owner` | Public | `SignupOwner` |
| `/signup/walker` | Public | `SignupWalker` |
| `/terms` | Public | `Terms` |
| `/admin` | Role-gated (admin) | `Admin` |
| `/app/dashboard` | ProtectedRoute | `Dashboard` |
| `/app/find` | ProtectedRoute | `FindWalkers` |
| `/app/book/:walkerId` | ProtectedRoute | `BookingFlow` |
| `/app/walker/:walkerId` | ProtectedRoute | `WalkerProfile` |
| `/app/chat/:bookingId` | ProtectedRoute | `Chat` |

### Pages vs Components
- **Pages** (`src/pages/`): Route-level components.
  - `src/pages/app/` — protected app pages
  - `src/pages/admin/` — admin panel
- **Components** (`src/components/`): Reusable UI. `src/components/ui/` contains shadcn/ui — do not edit these.

### Authentication (`src/contexts/AuthContext.tsx`)
Mock localStorage-based auth. Storage key: `pawgo_user`.

- **UserRole:** `"owner"` | `"walker"` | `"admin"`
- **AuthUser:** `{ id, name, email, role, location? }`
- **Hook:** `useAuth()` → `{ user, login(), loginAs(), logout(), isLoading }`
- Currently mocked — structured for future Supabase integration.

Demo accounts (Login page quick-access buttons):
- Dog Owner: `sarah.owner@demo.com`
- Walker: `james.walker@demo.com`
- Admin: use "Enter as admin" button at `/admin`

### Styling
- Tailwind CSS exclusively. Custom design tokens in `src/globals.css` (HSL CSS variables).
- Brand colors: Forest Green (primary `hsl(155,40%,28%)`) and Warm Amber (accent `hsl(27,...)`).
- Dark mode via `class` selector with `next-themes`.
- Path alias `@` maps to `src/`.

### UI Components
Always use **shadcn/ui** from `src/components/ui/`. Icons from `lucide-react`. Notifications via `sonner`. Do not install alternative component libraries.

### State & Data
- Server state: TanStack React Query (configured, not heavily used)
- Forms: React Hook Form + Zod validation
- Global state: React Context API (`AuthContext`)
- All persistence: `localStorage` (mock MVP — structured for Supabase migration)

---

## Data Layer (localStorage keys)

| Key | Utility | Purpose |
|---|---|---|
| `pawgo_user` | `AuthContext` | Logged-in user |
| `pawgo_bookings` | `src/utils/booking.ts` | All bookings |
| `pawgo_messages` | `src/utils/chat.ts` | Chat messages |
| `pawgo_favs` | `src/utils/retention.ts` | Favourite walker IDs |
| `pawgo_credits` | `src/utils/retention.ts` | PawGo credit balance |
| `pawgo_rewarded_${userId}` | `src/utils/retention.ts` | First-booking reward claimed flag |
| `pawgo_walker_ob` | `src/utils/booking.ts` | Walker onboarding checklist state |
| `pawgo_admin_logs` | `src/utils/admin.ts` | Admin activity logs |
| `pawgo_blocked_users` | `src/utils/admin.ts` | Suspended user IDs |
| `pawgo_resolved_alerts` | `src/utils/admin.ts` | Resolved alert IDs |

---

## Key Utilities

### `src/utils/booking.ts`
- `PLATFORM_COMMISSION = 0.20`, `WALKER_SHARE = 0.80`
- Duration multipliers: 30min=1x, 45min=1.4x, 60min=1.8x
- `calculatePayment(pricePerWalk, duration)` → `{ total, platformFee, walkerEarnings }`
- `fmt(amount, currency?)` → formatted currency string
- `saveBooking()`, `getBookings()`, `getBookingsByOwner()`, `getBookingsByWalker()`
- `getWalkerOnboarding()`, `setWalkerOnboarding()`, `isWalkerLive()`

> **Important:** `platformFee` and `walkerEarnings` are internal only. Never display the split to owners or walkers (Uber model — users see net amounts only, never the commission breakdown).

### `src/utils/chat.ts`
- `getMessages(bookingId)`, `addMessage()`
- `containsContactInfo(text)` — detects phone/email patterns to prevent off-platform contact
- `getMockWalkerReply()` — random auto-reply for mock walker

### `src/utils/retention.ts`
- Favorites: `getFavorites()`, `toggleFavorite()`, `isFavorite()`
- Credits: `getCredits()`, `addCredits()`, `spendCredits()`
- First-booking reward: `claimFirstBookingReward(userId)` — awards £5 credit once per user

### `src/utils/admin.ts`
- `getAdminBookings()` — real bookings + 12 seed bookings combined
- `getMockOwners()`, `getMockAdminWalkers()` — 8 owners + 6 walkers
- `getLogs()`, `addAdminLog()` — activity log with 18 seeded entries
- `getAlerts()`, `resolveAlert()` — 5 pre-seeded alerts
- `toggleBlockUser()`, `getBlockedUsers()` — suspend/reinstate users

### `src/data/walkers.ts`
6 mock walkers: `w1` Emily Carter £15, `w2` James Reid £14, `w3` Sophie Walsh £16, `w4` Marcus Chen £13, `w5` Priya Sharma £18, `w6` Tom Clarke £12.

---

## Key Pages

### `src/pages/app/BookingFlow.tsx`
4-step booking: Schedule → Confirm → Payment → Done.
- Rebook pre-fill via URL params `?rebook=true&time=X&duration=Y`
- Credits toggle in Confirm step (applies discount if balance > 0)
- `handlePayment`: mock 1800ms delay, `saveBooking()`, `claimFirstBookingReward()`
- Done step: "Message walker" CTA → `/app/chat/:bookingId`
- Replace `setTimeout` with real Stripe PaymentIntent when integrating payments

### `src/pages/app/Chat.tsx`
- Route: `/app/chat/:bookingId`
- Locked when `booking.status === "pending"`
- Contact-info detection → shows warning banner (does not block send)
- Mock walker auto-reply after 1800ms when owner sends

### `src/pages/app/WalkerProfile.tsx`
- Route: `/app/walker/:walkerId`
- Booking-first CTAs: primary "Book" always visible, "Message" only unlocked after a past booking
- Favourites toggle (heart button)
- Repeat-client badge if user has previous bookings with this walker

### `src/pages/admin/Admin.tsx`
- Route: `/admin` — role-gated (`user.role === "admin"`), inline demo login if not admin
- 6 sections via tab navigation: Dashboard, Bookings, Users, Financials, Quality, Logs
- Suspend/reinstate users: live state via `toggleBlockUser()` + writes to activity log
- Resolve alerts: live state via `resolveAlert()` + writes to activity log

---

## Business Rules

- **Pricing model (Uber model):** Commission split is internal only. Owners see total price. Walkers see net earnings. Neither sees the percentage or the other side's amount.
- **Contact control:** Chat only unlocks after a confirmed booking. Contact info detection warns users to keep communication in-platform.
- **First-booking reward:** £5 credit awarded once per user on first completed payment. Applied automatically on next booking if toggle is on.
- **Walker goes live:** Must complete 3 onboarding steps (photo, availability, service area) before appearing in search.

---

## Key Rules

- Keep all route definitions in `src/App.tsx`
- Pages go in `src/pages/`, components in `src/components/`
- Always use shadcn/ui — never raw HTML or alternative libraries
- Use Tailwind CSS for all styling; avoid inline styles or CSS modules
- Do not modify prebuilt shadcn/ui components in `src/components/ui/`
- Do not expose `platformFee`, `walkerEarnings`, or commission percentages on any user-facing surface
