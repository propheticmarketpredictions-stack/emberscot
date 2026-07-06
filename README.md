# Emberscot

A premium coupon marketplace where businesses list promo codes and shoppers discover, save, and redeem deals.

## What it does

- Browse active coupons by category (food, shopping, travel, tech, apps, health, entertainment, home, beauty), plus featured and trending deals on the home page.
- Search coupons and view SEO-friendly coupon detail pages with view counts, redemption counts, and related deals.
- Save favorites and get personalized recommendations based on your most-favorited category.
- Sign up and sign in with email/password (with OTP verification) or Continue with Google, plus a password reset flow.
- Business owners set up a business profile and submit coupons through a guided form, choosing a fee model (per-redemption fee of $1–$7.50, or a flat listing fee).
- Submitted coupons pass through automated moderation before going live: a landing-URL reachability check, rule-based low-effort detection (short titles, placeholder promo codes), and an AI spam/quality review. Legitimate coupons auto-approve; suspicious ones are flagged and the admin is emailed.
- Business dashboard for managing listings and redemptions; monthly PDF performance reports generated on demand.
- Admin dashboard for reviewing flagged coupons and curated deals.
- Redemption tracking with per-redemption fee accounting, and automated email alerts to users whose saved deals are about to expire.
- Role-based access for admin, business, and customer accounts.

## AI Stack

AI features are powered by **Base44's built-in `Core.InvokeLLM` integration** (Base44 selects the model; no specific model is pinned in the code).

## Tech stack

- React 18 + Vite 6, React Router 6
- Tailwind CSS with Radix UI primitives and shadcn-style components
- TanStack Query for data fetching, React Hook Form + Zod for forms
- Base44 SDK (`@base44/sdk`) for auth, entities, and serverless functions
- Backend functions run on Deno (Base44), with jsPDF for report generation

## Project structure

```
src/
  api/base44Client.js     Base44 SDK client
  lib/                    app params, auth context, query client
  pages/                  Home, CategoryPage, SearchResults, CouponDetail,
                          SubmitCoupon, Favorites, Login, Register,
                          ForgotPassword, ResetPassword, BusinessSetup,
                          BusinessDashboard, AdminDashboard
  components/             Navbar, Footer, CouponCard, SearchBar, ui/ (Radix)
base44/
  entities/               Coupon, BusinessProfile, Favorite, Redemption, User
  functions/              moderateCoupon, notifyExpiringCoupons,
                          generateMonthlyReport
  config.jsonc            Base44 project config
```

## Local development

Frontend-only development against the hosted Base44 backend:

```bash
npm install
```

Create `.env.local` in the project root:

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

`VITE_BASE44_APP_ID` identifies the Base44 app. `VITE_BASE44_APP_BASE_URL` tells the Base44 Vite plugin where to send local `/api` requests.

Start the dev server:

```bash
npm run dev
```

To run the full local stack (Base44 backend + frontend together), use the Base44 CLI instead: `base44 dev`.

## Publishing

Push your changes to git, then publish the app from the Base44 dashboard:

```bash
base44 dashboard open
```

Any change pushed to the repo is also reflected in the Base44 Builder.
