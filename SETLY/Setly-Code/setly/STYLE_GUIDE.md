# Setly Visual Style Guide

From landing to belonging: Setly’s design language builds trust, guidance, and warmth for movers (students, expats, digital nomads). This document defines core tokens and usage conventions across color, typography, iconography, UI components, and voice.

---
## 1. Color Palette
| Token | Name | Hex | Purpose |
|-------|------|-----|---------|
| midnight | Midnight Blue | #003265 | Primary brand; trust, stability. Buttons, headers, key text. |
| gold | North Star Gold | #D4B139 | Accent; guidance, optimism. Highlights, active states, badges. |
| white | White | #FFFFFF | Primary surface background. |
| gray-50..900 | Neutral Grays | #F5F5F5 → #333333 | Structure, text, borders, disabled states. Prefer near-black (#333333) for body text. |
| success | Success Green | #28a745 | Positive confirmations (messages, badges). |
| error | Error Red | #dc3545 | Errors, destructive alerts only. |

Guidelines:
- Midnight Blue for primary interactive elements (CTA buttons, nav active, headline accents).
- Gold is sparing: active icon, focus ring, underline indicator, badge highlight—not large paragraphs or full screens.
- Maintain WCAG AA contrast; avoid gold text on white for body copy.
- Derive hover/focus states by subtle light/dark adjustments (≈5–10%) of primary colors.
- Keep palette focused—avoid adding arbitrary hues. Semantic states use success/error only.

---
## 2. Typography
Primary font: **Open Sans** (fallback: Inter, system sans).

Scale & Hierarchy (base 16px = 1rem):
- H1: 2rem / Bold (32px)
- H2: 1.5rem / Semi-Bold (24px)
- H3: 1.25rem / Semi-Bold (20px)
- H4: 1rem / Medium/Semi-Bold (16px)
- Body: 1rem / Regular (16px) line-height ~1.5
- Small: 0.875rem (14px) or 0.75rem (12px) minimum

Conventions:
- Title Case for major headings & nav; Sentence case for body and subheadings.
- Avoid more than one primary typeface across app; a second font only for rare decorative use.
- Emphasis: weight or italic, not color changes.
- Avoid long all-caps strings; reserve for short labels or acronyms.
- Maintain semantic HTML structure (H1→H2→H3) for accessibility.

Utilities (implemented): `.heading-h1`, `.heading-h2`, `.heading-h3`, `.heading-h4`, `.text-body`, `.text-small`.

---
## 3. Iconography
Style: Outline (stroke ≈2px at 24px size) for consistency & clarity.
- Default sizes: 16px (inline/small), 24px (standard actions), 32px+ (hero/empty states).
- States: Outline vs Filled only to indicate active selection (filled variant optional). Avoid duotone & mixed styles.
- Libraries: Prefer Material Icons (Outlined) or Feather. Pick one set; do not mix.
- Color: Midnight Blue on light surfaces; white on dark backgrounds; Gold sparingly for highlight states (e.g., verified badge icon).
- Accessibility: Provide `aria-label` or text label for standalone icon buttons; ensure tap targets ≥40px.

Do not: distort, arbitrarily rotate, flood interface with decorative icons, or mix multiple unrelated icon packs.

---
## 4. UI Components
Buttons:
- Primary: Midnight Blue bg / white text; subtle darken or gold focus ring on hover/focus.
- Secondary: White or light-gray bg, Midnight Blue border/text; hover adds soft shadow.
- Gold Accent Button (rare): Gold bg / Midnight Blue text for special emphasis.
- Disabled: Light gray bg (#DDDDDD) + gray text; no shadow.

Inputs:
- Background: white/light-gray; default border gray-300.
- Focus: Gold or Midnight Blue border & ring.
- Placeholder: gray-500; helper text small & muted.
- Errors: red border + error red text; success (optional) green check/border.

Cards:
- White surface, subtle 1px gray border or soft shadow, 6–12px radius.
- Heading Midnight Blue; limit gold to a single accent badge or underline.

Badges:
- Verified/premium: Gold bg + white text/icon.
- Informational: Midnight Blue bg + white text OR blue text on light-gray pill.

Links:
- Midnight Blue default; underline appears on hover or always if needed for clarity. Hover may shift to gold or lighter blue.

Headers/Nav:
- Option A: Midnight Blue bg + white text/icons; active item gold underline.
- Option B: White bg + Midnight Blue text; active item gold underline or filled icon.

---
## 5. Voice & Tone
Characteristics: Trustworthy, Empathetic, Inclusive, Inspirational, Calm.
- Address user as “you”; use “we” for Setly as guide/partner.
- Focus on outcomes & reassurance: “We’ll guide you from landing to belonging.”
- Keep CTAs short: “Join Setly”, “Get Started”, “Find Your New Home”.
- Avoid jargon, slang, or overly salesy phrasing. Be clear, positive, honest.
- Error/empty states: human, helpful (“We couldn’t load your messages. Please try again.”)

Tagline examples: “Your Next Move, Simplified.” / “Move Freely. Live Setly.”

---
## 6. Dos & Don’ts (Summary)
Colors:
- Do: Consistent Midnight Blue primary, Gold accent; maintain contrast.
- Don’t: Use gold for large text blocks or add random new hues.

Typography:
- Do: Use defined hierarchy and spacing; consistent weights.
- Don’t: Mix multiple fonts or use long all-caps headings.

Icons:
- Do: Keep one outline style library; label as needed.
- Don’t: Mix filled + outline arbitrarily or use obscure metaphors.

Voice:
- Do: Be empathetic, clear, supportive.
- Don’t: Overpromise, use slang, or sound aggressive.

---
## 7. Design Tokens (CSS Variables)
(Implemented in `styles.css`):
- `--color-midnight: #003265;`
- `--color-gold: #D4B139;`
- Neutral grays, semantic success/error, typography scale, radii, shadows.

Use tokens via Tailwind classes (extended palette) or direct CSS variables for gradient/background specialties.

---
## 8. Accessibility
- Contrast: Test all color pairings (especially gold on light backgrounds). Minimum AA for text (4.5:1 normal, 3:1 large).
- Headings: Maintain logical sequence for screen readers.
- Icons: Provide alternative text/labels.
- Touch Targets: Minimum ~40px square for interactive elements.

---
## 9. Implementation Notes
- Tailwind extended with `brand.midnight`, `brand.gold`, `success`, `error`.
- Utilities for headings & body copy added.
- Future: Consider dark mode variant (midnight surfaces, gold accents) with appropriate contrasts.

---
## 10. Future Enhancements
- Add motion guidelines (timing curve standards).
- Define spacing scale & layout grid formally.
- Dark mode token mapping.

---
Last updated: Nov 23, 2025
