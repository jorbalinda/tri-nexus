# Race Day — Claude Context

## Color Palette

### Primary Action
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#4361ee` | All buttons, CTAs, submit actions |
| `--color-primary-hover` | `#3451d1` | Hover state for primary buttons |

### Sport Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-swim` | `#219ebc` | Swim icons, labels, charts |
| `--color-bike` | `#fb8500` | Bike icons, labels, charts |
| `--color-run` | `#4cc9a0` | Run icons, labels, charts |
| `--color-brick` | `#e63946` | Brick workouts |

### Brand Blues (teal-shifted — all share a green undertone)
| Hex | Usage |
|---|---|
| `#023047` | Dark navy — primary background (dark mode), favicon background |
| `#0a5c8a` | Mid-tone teal-blue — gradients, hero panels |
| `#1170a3` | Lighter mid-tone — gradients |
| `#219ebc` | Swim blue / bright accent |
| `#57a2ea` | Light blue — readable links on dark backgrounds, subtle highlights |
| `#7ab8f0` | Hover state for `#57a2ea` links |
| `#8ecae6` | Lightest blue — chart fills, subtle backgrounds |

### HR / Power Zone Colors (in zone order, low → high intensity)
| Zone | Hex | Label |
|---|---|---|
| Z1 | `#219ebc` | Very Fresh / Recovery |
| Z2 | `#2a9d8f` | Fresh / Aerobic Base |
| Z3 | `#fb8500` | Neutral / Tempo |
| Z4 | `#e2622c` | Tired / Threshold |
| Z5 | `#d62828` | Fatigued / VO2max |

### Accent / UI Colors
| Hex | Usage |
|---|---|
| `#ffb703` | Privacy policy accepted, consent shield/checkmark |
| `#2a9d8f` | Public toggle, TSB form, green accents |
| `#e76f51` | A Race badge |
| `#d62828` | Danger / delete / destructive actions |
| `#b52222` | Hover state for danger buttons |
| `#94a3b8` | Power zone Z1 (Active Recovery) — slate gray |
| `#991b1b` | Power zone Z7 (Neuromuscular) — dark red |

### Background / Surface
| Hex | Usage |
|---|---|
| `#f7f5f3` | Light mode background |
| `#023047` | Dark mode background |
| `#ffffff` | Light mode card surface |
| `#03405f` | Dark mode card surface |

---

## Key Rules
- **Never use default Tailwind blue/green/red/purple** for sport or UI colors — always use the palette above
- **Blues must be teal-shifted** — avoid pure cobalt/royal blue (`#3b82f6`, `#2563eb` etc.)
- **Purple does not exist** in this palette — replace with `#4361ee` (primary)
- **Swim = `#219ebc`, Bike = `#fb8500`, Run = `#4cc9a0`** — consistent everywhere
- **Danger red = `#d62828`** — not Tailwind `red-500/600`
- **Links on dark backgrounds** = `#57a2ea`, not `text-blue-600` (which maps to `#0f4da9` — too dark)

## Next.js / Stack Notes
- Uses `src/proxy.ts` instead of `middleware.ts` (Next.js 16)
- Tailwind v4 with `@theme inline` — custom colors defined in `globals.css`
- `next-themes` — default theme is **dark**, system preference disabled
- `card-squircle` is the universal card primitive
- OG image: `src/app/opengraph-image.tsx` (1200×630, left-logo / right-headline layout)
