# Race Day — Claude Context

## Writing Rules
- No em dashes (--) anywhere in code, comments, or UI copy. Use a comma, period, or rewrite the sentence.

---

## What This App Is

Race Day is a triathlon race prediction platform. The core promise: tell an athlete their projected finish time before they cross the start line, then reveal it race week with a full race day plan.

Athletes log workouts (via .FIT upload, Garmin sync, or manual entry), set threshold data (FTP, CSS, run pace, HR), and add target races. The app calculates training load metrics (CTL/ATL/TSB), scores their data confidence (0-100), and projects per-leg and total finish times across three tiers of accuracy.

The social layer lets athletes compare projected and actual finish times with friends.

---

## Goals

- Help triathletes train smarter by seeing their fitness trajectory in real numbers
- Make race week less anxious by revealing a data-backed finish time and full plan
- Build a social comparison layer so athletes can see how their projections stack up against training partners
- Keep the UX clean, fast, and mobile-first — triathletes use this on the go
- Grow to 500 early access users, then introduce a paid tier

---

## Backend Architecture

**Stack:** Next.js 15/16 App Router, Supabase (Postgres + Auth + Realtime + Storage), TypeScript, Vercel

**Auth:** Supabase Auth with Google OAuth. `src/proxy.ts` handles route protection (NOT `middleware.ts` — renamed in Next.js 16, do not create middleware.ts or it breaks Vercel builds).

**Database key tables:**
- `profiles` — user settings, thresholds (FTP, CSS, run pace, resting/max HR), imperial flag, profile_public
- `workouts` — all training data (swim/bike/run/brick/threshold), TSS, HR, pace, power, cadence, elevation
- `target_races` — race name, distance, date, priority (A/B/C), status, course data
- `manual_logs` — threshold test results (FTP, CSS, run pace) stored separately from workouts
- `consent_records` — append-only privacy consent audit log (no UPDATE/DELETE RLS), legally admissible
- `race_timeline_events` — race week countdown timeline
- `social_follows` — follow requests, accepted/pending state

**API routes:**
- `POST /api/workouts` — save workout, recalculate TSS
- `GET /api/account/export` — full data export as JSON
- `DELETE /api/account` — full account deletion
- `POST /api/email/welcome` — send welcome email on signup
- `GET /api/cron/emails` — daily 7am cron, sends race week (7-day) and race day (1-day) reminders
- `GET/POST /api/consent` — check / record privacy consent

**Email:** Resend, domain triraceday.com, from noreply@triraceday.com. Templates in `src/lib/email/templates.ts`.

**FIT file parsing:** `.FIT` files parsed client-side, workout data extracted and saved via API.

**Training load math:**
- TSS: 5-level waterfall (device TSS > power/pace > HR > RPE > default fallback)
- CTL: 42-day exponential weighted moving average of daily TSS
- ATL: 7-day EWMA of daily TSS
- TSB: CTL minus ATL (positive = fresh, negative = fatigued)

**Projection system:**
- Tier 0: no prediction (fewer than 2 disciplines gated)
- Tier 1: rough estimate (2+ disciplines, basic data)
- Tier 2: standard (all 3 disciplines gated)
- Tier 3: refined (all 3 gated + all thresholds set)
- Confidence score: 4 dimensions x 25pts = 0-100 (Volume, Discipline Balance, Threshold Quality, Data Completeness)
- Per-discipline gate: minimum qualifying workouts within past 8 weeks

---

## Performance Optimization Roadmap (priority order)

1. **Prefetch initial hook data server-side** — pass `initialWorkouts`, `initialProjection` etc. as props to client components; hooks accept `initialData` prop and skip `.select()` if provided
2. **Parallel Supabase channel subscriptions** — `useRaceDashboardRealtime({ raceId, ... })` hook sets up all channels in one `useEffect` simultaneously (separate channels OK, must connect in parallel not sequentially)
3. **RPC batch query** — `get_race_dashboard(race_id, user_id)` returning `jsonb` — only if profiling shows multiple server-side queries are the bottleneck

---

## Color Palette

### Primary Action
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#4361ee` | All buttons, CTAs, submit actions |
| `--color-primary-hover` | `#3451d1` | Hover state for primary buttons |

### Sport Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-swim` | `#219ebc` | Swim icons, labels, charts — available as `text-swim`, `bg-swim` etc. |
| `--color-bike` | `#fb8500` | Bike icons, labels, charts — available as `text-bike`, `bg-bike` etc. |
| `--color-run` | `#4cc9a0` | Run icons, labels, charts — available as `text-run`, `bg-run` etc. |
| `--color-brick` | `#e63946` | Brick workouts |

### Brand Blues (all teal-shifted — share a green undertone)
| Hex | Usage |
|---|---|
| `#020c22` | Dark navy — dark mode background, favicon background |
| `#0a5c8a` | Mid-tone teal-blue — gradients, hero panels |
| `#1170a3` | Lighter mid-tone — gradients |
| `#219ebc` | Swim color / bright accent |
| `#57a2ea` | Readable links on dark backgrounds, subtle highlights |
| `#7ab8f0` | Hover state for `#57a2ea` links |
| `#8ecae6` | Lightest blue — chart fills, subtle backgrounds |

### HR / Power Zone Colors (low to high intensity)
| Zone | Hex | HR Label | TSB Label |
|---|---|---|---|
| Z1 | `#219ebc` | Recovery | Very Fresh |
| Z2 | `#2a9d8f` | Aerobic Base | Fresh |
| Z3 | `#fb8500` | Tempo | Neutral |
| Z4 | `#e2622c` | Threshold | Tired |
| Z5 | `#d62828` | VO2max | Fatigued |

Power zones Z1 (Active Recovery) uses `#94a3b8` (slate gray). Z7 (Neuromuscular) uses `#991b1b` (dark red). Z2-Z6 use the 5 zone colors above.

TSB form state colors intentionally match HR zone colors for consistency.

### Accent / UI Colors
| Hex | Usage |
|---|---|
| `#ffb703` | Privacy policy accepted state, consent shield/checkmark |
| `#2a9d8f` | Public toggle, green accents, TSB form state |
| `#e76f51` | A Race badge (priority A) |
| `#d62828` | Danger / delete / destructive actions |
| `#b52222` | Hover state for danger buttons |

### Race Priority Badge Colors
| Priority | Hex | Usage |
|---|---|---|
| A Race | `#e76f51` | Primary target race |
| B Race | orange (Tailwind) | Secondary race |
| C Race | gray (Tailwind) | Low priority race |

### TrainingLoadCard Tile Accent Colors
| Tile | Hex |
|---|---|
| TSS | `#fb8500` (bike/orange) |
| CTL | defined per chart config |
| ATL | defined per chart config |
| TSB | defined per chart config |

Tile accents use `hexToRgb()` helper to produce `rgba` background (10% opacity) and border (20% opacity).

### Background / Surface
| Hex | Usage |
|---|---|
| `#f7f5f3` | Light mode background |
| `#020c22` | Dark mode background |
| `#ffffff` | Light mode card surface |
| `#031a40` | Dark mode card surface |

---

## Color Rules — Never Break These

- No em dashes anywhere
- Never use default Tailwind blue/green/red/purple for sport or UI colors
- Blues must be teal-shifted — never use pure cobalt/royal blue (`#3b82f6`, `#2563eb`, `#4361ee` is OK for primary only)
- Purple does not exist in this palette — replace with `#4361ee` (primary)
- `text-blue-600` in this project resolves to `#0f4da9` (remapped in globals.css) — too dark for dark backgrounds. Use `#57a2ea` for readable links instead
- The full Tailwind blue scale is remapped in `@theme inline` in `globals.css` — do not assume standard Tailwind blue values
- Danger red = `#d62828` — not Tailwind `red-500/600`
- Swim = `#219ebc`, Bike = `#fb8500`, Run = `#4cc9a0` — consistent everywhere, no exceptions
- Sport color CSS vars (`text-swim`, `text-bike`, `text-run`) work as Tailwind utilities directly

---

## Tech / Architecture Notes

- Uses `src/proxy.ts` NOT `middleware.ts` (Next.js 16 rename — creating middleware.ts breaks Vercel builds)
- Tailwind v4 with `@theme inline` — all custom colors defined in `src/app/globals.css`
- `next-themes` — default theme is dark, `enableSystem: false`
- `card-squircle` is the universal card primitive — use it everywhere
- `src/app/page.tsx` uses styled-jsx and must stay `'use client'`
- Known required client components: `src/app/page.tsx`, `src/app/auth/signup/page.tsx`, `src/app/auth/login/page.tsx`
- OG image: `src/app/opengraph-image.tsx` (1200x630, left-logo / right-headline, navy-to-teal gradient)
- `theme-color` meta: `#020c22`

---

## UI / UX Rules

- Mobile-first (320px base, min-width breakpoints only)
- 48px minimum touch targets
- 16px minimum font size on mobile — no text below 11px anywhere
- Never use `100vh` — use `100dvh`
- Bottom sheets over modals on mobile
- Sidebar hidden on mobile (`lg:hidden` / `hidden lg:flex`)
- No text below `text-[11px]`

---

## Removed Features — Do NOT Recreate

- Equipment Profile / Bike Setup / CdA calculator
- Gear tracking (equipment lists, race packing lists)
- EquipmentCard, EquipmentPlan, gear_items table, gear table
- Nutrition Plan link from race detail page
- Mantras and Process Goals from MindsetCard
- ProgressIndicator.tsx (decomposed into 4 separate components)
- ProjectionSummaryCard.tsx (absorbed into ProjectionHero)
- WeekVolumeSummary swim/bike/run/total cards on dashboard

---

## User Preferences

- Prefers CTL/ATL/TSB as primary labels (not Fitness/Fatigue/Readiness)
- Likes technical terms with plain-language sub-labels underneath
- Weekly calendar as full-width hero at top of dashboard
- Volume and fitness data grouped directly below the action row
- Concise, direct UI copy — no filler words
