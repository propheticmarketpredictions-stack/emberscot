# Emberscot App Improvement Roadmap

A comprehensive assessment of every way the Emberscot coupon marketplace could be better — features, design, and architecture.

---

## Features

### AI-Powered Deal Personalization
Use InvokeLLM to analyze user behavior beyond simple category matching. Generate truly personalized recommendations based on browsing patterns, favorited deal types, and redemption history. The current "Recommended for You" section uses basic category counting — upgrade it to behavioral analysis with the cross-domain prompt sets in this library.

### Price Drop Alerts
Let users set target prices on products and get notified when a matching coupon + price combination hits their threshold. Requires a price-tracking backend that periodically checks merchant prices against user-set targets.

### Browser Extension
Chrome extension that auto-detects coupon codes on checkout pages and surfaces Emberscot deals in real time. Uses DOM scraping to identify checkout forms and matches against the Emberscot coupon database. Distribute via Chrome Web Store; works natively in Kiwi Browser on Android.

### Progressive Web App
Make the site installable with offline browsing of saved coupons and favorites. Service worker caches the favorites list, coupon details, and category pages for offline access. Background sync pushes new redemptions when connectivity returns.

### Social Deal Sharing
Users share deals via unique referral links. Businesses get attribution tracking, users get credit or leaderboard placement. Each shared link encodes the referrer's user ID and coupon ID; successful redemptions from referral links count toward a referral score.

### Deal Effectiveness Scoring
AI-scored rating (0-100) of how likely a coupon is to actually work. Factors: business redemption rate history, expiry proximity, code format analysis (real codes vs placeholders), landing URL validation (already in moderateCoupon), and category-specific historical performance.

### Bundle Deals
Allow businesses to create multi-coupon bundles (e.g., "Buy 2 Get 1 Free" across product lines). Requires a Bundle entity linking multiple Coupon IDs with a combined redemption flow. Businesses set a bundle-level fee that may be lower than individual per-redemption fees.

### Expiry Countdown & Push
Visual urgency indicators with push notifications for coupons in favorites expiring within 24 hours. Extends the existing notifyExpiringCoupons automation to send browser push notifications in addition to email. Requires a push notification service integration.

### Business Analytics Expansion
Add cohort analysis, redemption forecasting, competitor benchmarking, and A/B testing for coupon performance to the business dashboard. Use recharts (already installed) to visualize redemption velocity, fee accrual trends, and conversion funnels.

### Price Comparison Integration
Cross-reference coupon prices against major retailers (Amazon, Walmart, Target) to show true savings in real time. Requires a product price API integration. Display "You save $X vs Amazon" badges on coupon cards.

---

## Design

### Dark Mode
Full dark theme using the existing ember-charcoal palette already defined in the design tokens (`--ember-charcoal: #1A1A1A`). The dark mode CSS variables are already in `src/index.css` under `.dark` — wire up a toggle in the navbar and persist preference via `base44.auth.updateMe()`.

### Skeleton Loading
Replace spinners with skeleton screens for perceived performance improvement. Use shadcn's Skeleton component (already available) to render coupon card-shaped placeholders during data fetching. Skeletons eliminate the "flash of empty content" that makes pages feel slow.

### Micro-interactions
Add subtle animations on coupon copy (confetti burst on code copy), favorite toggle (heart pulse), and redemption confirmation (fire emoji animation). Use framer-motion (already installed) for smooth spring-based transitions. Keep animations under 300ms to avoid feeling sluggish.

### Accessibility Audit (WCAG 2.1 AA)
Full compliance audit: keyboard navigation for all interactive elements, screen reader support with proper ARIA labels, color contrast verification (minimum 4.5:1 for body text, 3:1 for large text), focus management for modals and route changes, skip-to-content link for keyboard users.

### Personalized Homepage
Dynamic layout that reorders sections based on user behavior. Favorited categories get priority placement. Browsing history (which coupons were viewed) feeds a "Recently Viewed" carousel. First-time visitors see the default layout; returning users see a progressively personalized arrangement.

### Improved Empty States
Every empty state gets a clear CTA and contextual guidance. No more bare "no results found" screens. Each empty state should explain what the user can do next: "No favorites yet? Browse deals →" or "No coupons in this category? Set an alert →"

### Toast Notifications
Replace all inline alert messages with the existing Toaster component for consistent, non-blocking user feedback. Toasts auto-dismiss after 4 seconds, support action buttons, and stack gracefully. Use the existing `useToast` hook from shadcn.

### Mobile Bottom Tab Bar
One-thumb navigation on mobile: Browse, Search, Favorites, Dashboard as a persistent bottom bar. Replaces the hamburger menu for primary navigation. The hamburger menu remains for secondary links (About, Contact, etc.). Use `use-mobile` hook (already available) to detect mobile viewport.

---

## Architecture

### Service Worker / Offline
PWA service worker for offline access to saved coupons and favorites. Background sync queues new redemptions when offline and pushes them when connectivity returns. Cache-first strategy for static assets, network-first for dynamic data.

### Image Optimization
Lazy loading (`loading="lazy"` on all `<img>` tags), WebP conversion for coupon images, and responsive image sizing with `srcset`. Reduces page weight by 60-80% on image-heavy pages. Use the UploadFile integration's built-in optimization where available.

### API Response Caching
Use TanStack Query's built-in caching (already configured via QueryClientProvider) for coupon lists. Set stale time to 5 minutes for category pages and 1 minute for search results. Eliminates redundant API calls and enables instant page loads on revisit.

### Search Indexing
Create a search index on coupon title, business_name, promo_code, and category for sub-100ms filtering. Currently, the SearchResults page does a full table scan via `base44.entities.Coupon.filter()` — this works at small scale but will degrade. Consider a dedicated search backend or pre-computed index.

### Database Indexing
Add indexes on Coupon.status, Coupon.category, Coupon.seo_slug, and Favorite.coupon_id for query performance at scale. These are the most-filtered fields across the app. Indexes reduce query time from O(n) to O(log n).

### Real-time Updates
Use the entity subscription API to push new coupon alerts and redemption confirmations without page refresh. When a business submits a new coupon that matches a user's favorited category, push a notification. When a user's redemption is confirmed, update the UI in real time.

### Rate Limiting
Add rate limiting on public-facing API endpoints to prevent abuse and control infrastructure costs. Especially important for the search endpoint (which does expensive filtering) and the coupon submission endpoint (which triggers AI moderation). Consider per-IP limits on public endpoints and per-user limits on authenticated endpoints.

---

## Cross-Platform Integration

This roadmap is designed to integrate with the broader platform vision:

- **Prediction App** can consume Emberscot redemption data as a signal for retail/consumer spending trends.
- **Kalshi Trade Bot** can use Emberscot's business analytics to identify which businesses are growing (high redemption volume) for retail stock predictions.
- **Digital Clone** can learn from the user's favoriting and browsing behavior to improve personalization across all platform apps.
- **Deck Orchestration** manages Emberscot as one of the 1,000 project pods, with the Twin Profile ensuring all AI interactions match the user's preferences.