# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PawGo** is a React + TypeScript SPA — a pet walking marketplace connecting dog owners with professional dog walkers. Built with Vite + SWC, shadcn/ui components, and Tailwind CSS. Generated via the Dyad framework and deployed on Vercel.

## Repository

- **GitHub:** https://github.com/BlackKawa87/pawwalk
- **Branch principal:** `main`
- **Auto-push:** configurado via `.git/hooks/post-commit` — todo commit é enviado automaticamente ao GitHub sem precisar de `git push` manual.

## Commands

```bash
pnpm dev        # Dev server at http://localhost:8080
pnpm build      # Production build
pnpm lint       # ESLint
pnpm preview    # Preview production build locally
```

## Architecture

### Routing (`src/App.tsx`)
All routes are defined here. Public routes live at `/`, `/login`, `/signup`, `/signup/owner`, `/signup/walker`. Protected routes (requiring auth) are wrapped with `<ProtectedRoute>` and live under `/app/*`. Do not define routes anywhere else.

### Pages vs Components
- **Pages** (`src/pages/`): Route-level components. Main entry is `src/pages/Index.tsx`. Protected pages live in `src/pages/app/`.
- **Components** (`src/components/`): Reusable UI. `src/components/ui/` contains shadcn/ui components — do not edit these.

### Authentication (`src/contexts/AuthContext.tsx`)
Mock localStorage-based auth with two user roles: `"owner"` and `"walker"`. The `useAuth()` hook exposes `user`, `login()`, `logout()`, and `loading`. Currently mocked — structured for future Supabase/backend integration.

### Styling
- Tailwind CSS exclusively. Custom design tokens are in `src/globals.css` (HSL CSS variables).
- Brand colors: Forest Green (primary, `hsl(155, ...)`) and Warm Amber (accent, `hsl(27, ...)`).
- Dark mode via `class` selector with `next-themes`.
- Path alias `@` maps to `src/`.

### UI Components
Always use **shadcn/ui** from `src/components/ui/` for UI primitives. Icons from `lucide-react`. Notifications via `sonner`. Do not install alternative component libraries.

### State & Forms
- Server state: TanStack React Query
- Forms: React Hook Form + Zod validation
- Global state: React Context API (see `AuthContext`)

## Key Rules (from AI_RULES.md)

- Keep all route definitions in `src/App.tsx`
- Pages go in `src/pages/`, components in `src/components/`
- Always use shadcn/ui — never raw HTML or alternative libraries
- Use Tailwind CSS for all styling; avoid inline styles or CSS modules
- Do not modify prebuilt shadcn/ui components in `src/components/ui/`
