# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PawGo** is a React + TypeScript SPA — a pet walking marketplace connecting dog owners with professional dog walkers. Built with Vite + SWC, shadcn/ui components, and Tailwind CSS. Deployed on Vercel.

## Repository

- **GitHub:** https://github.com/BlackKawa87/pawwalk
- **Branch principal:** `main`
- **Auto-push:** configured via `.git/hooks/post-commit` — every commit is automatically pushed to GitHub, no manual `git push` needed.
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

## Mandatory Post-Change Workflow

After **every** change to the platform, always complete these 3 steps in order:

1. **Update `CLAUDE.md`** — reflect any new utilities, pages, business rules, or data model changes.
2. **Commit & push** — `git add <files> && git commit -m "..."` (auto-push fires via post-commit hook).
3. **Deploy** — `vercel --prod --yes`

Never skip any of the three steps.

---

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
- **AuthUser:** `{ id, name, email, role, location?, signedUpAt? }` — `signedUpAt` is an ISO timestamp set on account creation; used for service fee grace period logic.
- **Hook:** `useAuth()` → `{ user, login(), loginAs(), logout(), isLoading }`
- `loginAs()` stamps `signedUpAt = now` if not already present on the user object.
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
| `pawgo_user` | `AuthContext` | Logged-in user (AuthUser JSON) |
| `pawgo_bookings` | `src/utils/booking.ts` | All bookings |
| `pawgo_messages` | `src/utils/chat.ts` | Chat messages |
| `pawgo_favs` | `src/utils/retention.ts` | Favourite walker IDs |
| `pawgo_credits` | `src/utils/retention.ts` | PawGo credit balance (number) |
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
- `fmt(amount, currency?)` → formatted currency string (£ or $)
- `saveBooking(booking)`, `getBookings()`, `getBookingById(id)`, `getBookingsByOwner(ownerId)`, `getBookingsByWalker(walkerId)`
- `getWalkerOnboarding()`, `setWalkerOnboarding(partial)`, `isWalkerLive(ob)`
- **`Booking` type fields:** `id, ownerId, ownerName, ownerDog, walkerId, walkerName, date, time, duration, pricePerWalk, total, platformFee, walkerEarnings, serviceFee, creditsUsed, currency, status, paymentStatus, createdAt, notes?`

> **Important:** `platformFee` and `walkerEarnings` are internal only. Never display the split to owners or walkers (Uber model — users see net amounts only, never the commission breakdown).

### `src/utils/serviceFee.ts`
- `SERVICE_FEE = 1.50` — owner-side service fee (Airbnb-style)
- `getFeeStatus(userId, signedUpAt?)` → `{ charged: boolean, reason: "active"|"new_user"|"inactive", safeDaysLeft? }`
- **Fee logic:**
  - `active`: last booking < 14 days ago → `charged: false`, `safeDaysLeft` = days until window expires
  - `new_user`: account < 60 days AND no bookings yet → `charged: false`, `safeDaysLeft` = days until grace ends
  - `inactive`: all other cases → `charged: true`
- Active members who book at least once every 14 days never pay the fee, regardless of account age.

### `src/utils/invoice.ts`
- `downloadInvoice(booking)` — generates a print-ready HTML invoice in a new tab and triggers browser print dialog (Save as PDF)
- Invoice includes: PawGo branding, invoice number (`PG-XXXXXXXX`), issue date, owner/walker details, walk date/time/duration, price breakdown (walk + service fee + credits applied), total paid (PAID badge), independent contractor notice
- No external PDF library — uses `window.open()` + styled HTML + `setTimeout(() => w.print(), 600)`
- Only call from owner-facing surfaces — never show to walkers

### `src/utils/chat.ts`
- `getMessages(bookingId)`, `addMessage(msg)`
- `containsContactInfo(text)` — regex detects phone/email to prevent off-platform contact
- `getMockWalkerReply()` — random auto-reply string for mock walker responses

### `src/utils/retention.ts`
- Favorites: `getFavorites()`, `toggleFavorite(walkerId)`, `isFavorite(walkerId)`
- Credits: `getCredits()`, `addCredits(amount)`, `spendCredits(amount)`
- First-booking reward: `claimFirstBookingReward(userId)` — awards £5 credit once per user, returns `true` if claimed

### `src/utils/admin.ts`
- `getAdminBookings()` — real `pawgo_bookings` + 12 seed bookings combined, sorted descending by `createdAt`
- `getMockOwners()`, `getMockAdminWalkers()` — 8 mock owners + 6 mock walkers (type `AdminUser`)
- `getLogs()`, `addAdminLog({ category, action, actorName, detail })` — activity log (18 seeded entries)
- `getAlerts()`, `resolveAlert(id)` — 5 pre-seeded alerts (type `AdminAlert`)
- `toggleBlockUser(userId)` → returns `true` if now blocked; `getBlockedUsers()` → `string[]`

### `src/data/walkers.ts`
6 mock walkers: `w1` Emily Carter £15, `w2` James Reid £14, `w3` Sophie Walsh £16, `w4` Marcus Chen £13, `w5` Priya Sharma £18, `w6` Tom Clarke £12. Exported as `MOCK_WALKERS` array and `getWalkerById(id)`.

---

## Key Pages

### `src/pages/app/Dashboard.tsx`
Single file exporting `Dashboard` — renders `OwnerDashboard` or `WalkerDashboard` based on `user.role`.

**OwnerDashboard:**
- Service fee status banner (green = free, amber = £1.50 applies) driven by `getFeeStatus()`
- Credits banner if `getCredits() > 0`
- FTUE empty state when no bookings
- Dog profile card (mock: Buddy the Golden Retriever)
- Upcoming walks (confirmed bookings) with "Download invoice" button per card
- Past walks with "Download invoice" icon + Chat + Book again buttons
- Favourite walkers grid (from `getFavorites()`)
- "Walkers near you" preview grid (top 3 hardcoded)

**WalkerDashboard:**
- Onboarding checklist (photo, availability, service area) with progress bar — hidden when all complete
- Earnings stats grid (this month, total, walks count, rating)
- Earning potential card — copy says "paid directly to you" (never shows commission %)
- Booking requests (pending + confirmed)
- Repeat clients section (owners with > 1 booking)

**AppNav** (shared): sticky header, notification bell, dropdown with Settings / Admin panel / Sign out.

### `src/pages/app/FindWalkers.tsx`
- Displays all 6 mock walkers as cards in a grid
- Favourites heart button per card (`toggleFavorite()` on click, `e.stopPropagation()`)
- Contact control safety banner above grid
- Cards navigate to `/app/walker/:id`; "Book now" button navigates to `/app/book/:id` (stopPropagation)
- Filtering/search UI (not yet wired to data — visual only)

### `src/pages/app/BookingFlow.tsx`
4-step booking: Schedule → Confirm → Payment → Done.
- Rebook pre-fill via URL params `?rebook=true&time=X&duration=Y`
- **Confirm step:** service fee line ("Free ✓" green with countdown, or "£1.50"), credits toggle (if balance > 0), `amountDue = payment.total + serviceFeeAmount - creditDiscount`
- **Payment step:** mock card form, 1800ms processing delay
- `handlePayment`: `saveBooking()` (stores `serviceFee`, `creditsUsed`), `spendCredits()`, `claimFirstBookingReward()`
- **Done step:** receipt (shows actual `amountDue`), first-booking 🎉 banner, "Message walker" CTA, "Download invoice" button
- Replace `setTimeout` with real Stripe PaymentIntent when integrating payments

### `src/pages/app/Chat.tsx`
- Route: `/app/chat/:bookingId`
- Locked (with lock icon + explanation) when `booking.status === "pending"`
- Contact-info detection → amber Alert warning banner (does not block send)
- Typing indicator (bouncing dots) before mock reply
- Mock walker auto-reply via `getMockWalkerReply()` after 1800ms

### `src/pages/app/WalkerProfile.tsx`
- Route: `/app/walker/:walkerId`
- Favourites heart button in header (toggles via `toggleFavorite()`)
- Repeat-client badge (CheckCircle) if user has prior bookings with this walker
- Booking-first CTAs: "Book" always visible; "Message" locked (Lock icon + disabled) until a past booking exists
- If has past booking: "Book again" (rebook params) + "Message" → `/app/chat/:latestBooking.id`

### `src/pages/admin/Admin.tsx`
- Route: `/admin` — role-gated (`user.role === "admin"`), inline "Enter as admin" demo button if not admin
- **7 tabs:** Dashboard, Bookings, Users, Financials, Quality, Logs, Test Lab
- **Dashboard:** stat cards (bookings, revenue, platform earnings, users, cancellation rate, alerts), recent activity feed, open alerts card
- **Bookings:** searchable + status-filterable table of all bookings (seed + real)
- **Users:** owner/walker tabs, suspend/reinstate via `toggleBlockUser()` + `addAdminLog()`
- **Financials:** gross volume, platform commission, walker payouts, monthly breakdown table, recent transactions
- **Quality:** walker performance table (rating-sorted, flagged if < 4.8), alert cards with resolve action
- **Logs:** filterable activity log table
- **Test Lab:** 5 scenario presets, flow checklist, session state card, data controls (see below)

### `src/pages/admin/Admin.tsx` — Test Lab
Fixed test user IDs (safe to hardcode — never used in real data):
- `test-owner-fresh` — New owner, `signedUpAt = now`, no bookings
- `test-owner-active` — 90-day account, injected booking 5 days ago
- `test-owner-inactive` — 90-day account, injected booking 20 days ago
- `test-owner-credits` — 5-day account, £5 credit injected to `pawgo_credits`
- `test-walker-live` — Walker with `setWalkerOnboarding({ hasPhoto, hasAvailability, hasServiceArea: true })`

Helpers: `injectOwnerBooking(ownerId, ownerName, daysSince, status)` — writes directly to `pawgo_bookings`.
Data wipe: clears all `pawgo_*` keys including `pawgo_rewarded_*` dynamic keys.

---

## Business Rules

- **Pricing model (Uber model):** Commission split is internal only. Owners see total walk price. Walkers see net earnings. Neither side sees the percentage or the other side's figure. Never expose `platformFee`, `walkerEarnings`, or commission % on any user-facing surface.
- **Contact control:** Chat only unlocks after a confirmed booking. Contact-info detection warns (does not block) to keep communication in-platform.
- **First-booking reward:** £5 credit awarded once per user on first completed payment. Claimed via `claimFirstBookingReward(userId)`. Applied automatically on next booking if credits toggle is on.
- **Service fee (£1.50):** Owner-side fee shown in BookingFlow Confirm step and Dashboard banner. Waived for: active members (last booking < 14 days) and new users (< 60 days, no bookings yet). Charged for inactive users. Never shown on walker-facing surfaces.
- **Invoice:** Available to owners only — in BookingFlow Done step and Dashboard booking cards. Never render for walkers.
- **Walker goes live:** Must complete 3 onboarding steps (photo, availability, service area) before appearing in search results (`isWalkerLive(ob)` must return `true`).

---

## Key Rules

- Keep all route definitions in `src/App.tsx`
- Pages go in `src/pages/`, components in `src/components/`
- Always use shadcn/ui — never raw HTML or alternative libraries
- Use Tailwind CSS for all styling; avoid inline styles or CSS modules
- Do not modify prebuilt shadcn/ui components in `src/components/ui/`
- Do not expose `platformFee`, `walkerEarnings`, or commission percentages on any user-facing surface
- After every change: update CLAUDE.md → commit/push → `vercel --prod --yes`
