# CLAUDE.md — Emberscot

Guidance for agents working in this repo. Keep every claim here matched to a file that
actually exists.

## What this is

**Emberscot** — a coupon / deals marketplace, built on **Base44** with a React + Vite +
Tailwind + shadcn/ui frontend. Businesses submit coupons (AI-moderated), customers browse,
favorite, and redeem. That's the whole app. It is a Base44-hosted web app — nothing more.

> The multi-AI "orchestration mesh / Deck" project that used to be seeded here (the old
> `deck-import/`, `base44/agents/*`, and the aspirational CLAUDE.md) has moved to its own
> repo (`deck`). It does not belong in this coupon app — different stack, opposite hosting
> needs. Do not re-add it here.

## Stack & layout

- `src/pages/` — routed pages (Home, CategoryPage, CouponDetail, SearchResults, Favorites,
  auth pages, BusinessDashboard/Setup, SubmitCoupon, AdminDashboard).
- `src/components/` — shared UI (Navbar, Footer, CouponCard, SearchBar, AuthLayout,
  ProtectedRoute, ...); `src/components/ui/` is shadcn/ui.
- `src/api/base44Client.js` — the Base44 SDK client. `src/lib/AuthContext.jsx` — auth state.
- `src/lib/`, `src/hooks/`, `src/utils/` — helpers.
- `base44/` — Base44 project config + entity schemas (Coupon, BusinessProfile, Redemption,
  Favorite, User).

## Build & checks

Standard Vite/Base44 project. Run the relevant `package.json` scripts before finishing:

```bash
npm run dev         # frontend against the hosted Base44 backend
npm run lint        # eslint . --quiet
npm run typecheck   # tsc -p ./jsconfig.json
npm run build       # vite build
base44 dev          # full local Base44 backend + frontend (see README.md)
```

## Conventions

- Match existing page/component patterns (Tailwind classes inline, shadcn/ui primitives).
- Reuse the existing Base44 SDK client and Vite plugin; don't add new integration paths.
- Never commit secrets — `.env.local` only. See `README.md` for env vars and the publish flow.
- Pushing to this repo reflects into the Base44 Builder — keep changes focused and reviewed.
