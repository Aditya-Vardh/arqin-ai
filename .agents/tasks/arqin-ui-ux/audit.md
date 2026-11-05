# Arqin AI — UI/UX Comprehensive Audit

**Generated:** 2025  
**Scope:** Full codebase read — no files modified  
**Purpose:** Pre-implementation baseline for the comprehensive UI/UX refinement task

---

## Table of Contents

1. [CSS Custom Properties & Design Tokens](#1-css-custom-properties--design-tokens)
2. [Dark/Light Theme Implementation](#2-darklight-theme-implementation)
3. [Hardcoded Colours vs Semantic Tokens](#3-hardcoded-colours-vs-semantic-tokens)
4. [Empty Visual Areas & Broken Layouts](#4-empty-visual-areas--broken-layouts)
5. [Missing Hover/Focus States](#5-missing-hoverfocus-states)
6. [TileMosaic Current State](#6-tilemosaic-current-state)
7. [Animation Utilities in globals.css](#7-animation-utilities-in-globalscss)
8. [Sign-in / Sign-up Page Structure](#8-sign-in--sign-up-page-structure)
9. [AIAssistantDock Structure](#9-aiassistantdock-structure)
10. [PropertyInspector Structure](#10-propertyinspector-structure)
11. [LineSidebar Navigation](#11-linesidebar-navigation)
12. [Template Cards — Visual Content](#12-template-cards--visual-content)
13. [History Page — Card Structure](#13-history-page--card-structure)
14. [Dashboard Empty States](#14-dashboard-empty-states)
15. [Additional Workspace Page Notes](#15-additional-workspace-page-notes)
16. [Critical Findings Summary](#16-critical-findings-summary)

---

## 1. CSS Custom Properties & Design Tokens

### Token Architecture

The design system is defined entirely in `app/globals.css` using CSS custom properties scoped to `:root, [data-theme="dark"]`. There are three token layers:

#### Layer 1 — Raw Palette Aliases
| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#101216` | Base background |
| `--color-text` | `#F0F1F3` | Primary text |
| `--color-primary` | `#F0F1F3` | Primary colour (alias of text) |
| `--color-secondary` | `#A4AAB5` | Secondary colour |
| `--color-accent` | `#D6AD69` | Amber accent |

#### Layer 2 — Semantic Surface Tokens
| Token | Value |
|---|---|
| `--background` | `#101216` |
| `--background-2` | `#0C0E12` |
| `--foreground` | `#F0F1F3` |
| `--surface` | `#171A20` |
| `--surface-elevated` | `#1D222A` |
| `--surface-glass` | `rgba(23,26,32,0.72)` |
| `--surface-glass-light` | `rgba(214,173,105,0.06)` |
| `--surface-glass-strong` | `rgba(12,14,18,0.90)` |

#### Layer 3 — Border, Text, and Accent Tokens
| Token | Value |
|---|---|
| `--border` | `rgba(48,54,64,0.85)` |
| `--border-hover` | `rgba(214,173,105,0.35)` |
| `--border-glow` | `rgba(214,173,105,0.25)` |
| `--accent` | `#D6AD69` |
| `--accent-soft` | `rgba(214,173,105,0.14)` |
| `--accent-hover` | `#E0BC7A` |
| `--accent-glow` | `rgba(214,173,105,0.18)` |
| `--accent-subtle` | `rgba(214,173,105,0.10)` |
| `--text-primary` | `#F0F1F3` |
| `--text-muted` | `#A4AAB5` |
| `--text-faint` | `#4A5060` |
| `--text-subtle` | `#4A5060` |

#### Semantic Status Tokens
| Token | Value |
|---|---|
| `--success` | `#65A884` |
| `--warning` | `#D7AA62` |
| `--error` | `#D97878` |
| `--info` | `#7A9AC4` |

#### Architecture Node Type Tokens
`--arch-frontend`, `--arch-backend`, `--arch-database`, `--arch-cache`, `--arch-security`, `--arch-external`, `--arch-infra`, `--arch-ai`

#### Shadow Tokens
`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-glow`

#### Radius Tokens
`--radius-sm` (0.5rem), `--radius-md` (0.85rem), `--radius-lg` (1.25rem), `--radius-xl` (→ Tailwind `--radius`)

#### Typography Scale Tokens
`--text-sm` through `--text-5xl` (modular scale from 0.75rem to 4.21rem)

#### Legacy Alias Tokens (kept for backward compat)
`--soft-ivory`, `--cool-gray`, `--slate-blue`, `--deep-slate`, `--charcoal`

### Tailwind `@theme inline` bridge
A `@theme inline` block bridges Arqin tokens to Tailwind color utilities, enabling `bg-background`, `text-foreground`, `border-border`, etc. This is working correctly for components that use Tailwind classes.

### Utility Classes Defined in globals.css
- `.btn-shimmer-primary` — amber CTA with shimmer hover
- `.premium-card` — glass card with hover lift
- `.btn-premium`, `.btn-ghost` — button variants
- `.glass-primary`, `.glass-technical`, `.glass-panel`, `.glass-inspector`, `.glass-canvas`, `.glass-input`, `.glass-chip`, `.glass-toolbar`, `.glass-sidebar`
- `.glass-surface-*` — named surface variants (default, sidebar, inspector, canvas, input, toolbar, card)
- `.arch-grid-bg`, `.diagram-grid-bg` — dot/grid backgrounds
- `.workspace-ambient`, `.landing-ambient` — radial gradient backgrounds
- `.page-shell`, `.page-header` — layout shells
- `.card-nav`, `.card-nav-item`, `.card-nav-active` — tab pill navigation
- `.stats-strip`, `.stats-strip-item` — stat bands
- `.dark-gradient-card`, `.feature-card` — feature card pattern
- `.template-card-premium` — template card pattern
- `.landing-cta-band`, `.eyebrow-pill`, `.section-eyebrow`, `.section-heading`, `.section-sub`
- `.step-item`, `.step-number`, `.step-connector` — how-it-works steps
- `.code-mockup`, `.code-mockup-bar` — code block mockup
- `.marquee-wrap`, `.marquee-track` — marquee
- `.line-sidebar-active` — active sidebar indicator via `::before` pseudo-element
- `.tab-active` — active tab state

---

## 2. Dark/Light Theme Implementation

### Theme Provider (`ThemeProvider.tsx`)

- **Mechanism:** Sets `data-theme` attribute on `document.documentElement` (the `<html>` element).
- **Storage:** Theme preference is persisted in user-scoped `localStorage` via `createUserStore(userId)`.
- **System sync:** Listens to `window.matchMedia("(prefers-color-scheme: light)")` when `theme === "system"`.
- **Initial SSR:** `app/layout.tsx` hard-codes `data-theme="dark"` on the `<html>` tag at render time, with `suppressHydrationWarning`. This prevents FOUC correctly, but it means the initial server render always reflects dark theme regardless of user preference.
- **Context:** `useTheme()` exposes `{ theme, resolved, setTheme }`. `setTheme` updates both localStorage and the DOM immediately.

### Critical Bug: Light Theme Aliases to Dark Palette

**This is confirmed.** The `[data-theme="light"]` block in `globals.css` is a **complete copy** of the dark theme values:

```css
[data-theme="light"] {
  --color-text: #F0F1F3;     /* white — same as dark */
  --color-bg: #101216;       /* near-black — same as dark */
  --background: #101216;     /* near-black — same as dark */
  --foreground: #F0F1F3;     /* white — same as dark */
  --surface: #171A20;        /* dark graphite — same as dark */
  /* ... all other tokens identical to :root ... */
}
```

**Effect:** Selecting "Light Mode" in Settings applies `data-theme="light"` to `<html>`, but since the CSS variables are identical, nothing visually changes. The light theme does not exist.

**There is one exception:** `[data-theme="light"] .glass-input` overrides background to `rgba(255,255,255,0.6)` and shadow — this is the only real light-mode rule that exists.

**Required light token set (proposed values for implementation):**
- `--background`: `#F5F3EE` (warm off-white)
- `--background-2`: `#EEEBe4`
- `--foreground`: `#1A1C20` (dark graphite)
- `--surface`: `#FFFFFF`
- `--surface-elevated`: `#F0EDE6`
- `--border`: `rgba(30,35,40,0.12)`
- `--text-primary`: `#1A1C20`
- `--text-muted`: `#5A6070`
- `--text-subtle`: `#8A9095`
- Shadows should use `rgba(0,0,0,0.08)` not `rgba(0,0,0,0.55)`

---

## 3. Hardcoded Colour Classes vs Semantic Tokens

### Components using hardcoded hex colours (need migration to tokens)

#### `app/page.tsx`
- `bg-[#0E1116]` — hardcoded base bg (should use `bg-background`)
- `text-[#F2EFE8]` — hardcoded foreground (should use `text-foreground`)

#### `components/landing/LandingHero.tsx`
- `bg-[#0E1116]` — hero section bg
- `text-[#D6AD69]`, `text-[#F2EFE8]`, `text-[#8B949E]` — all hardcoded
- `rgba(14,17,22,...)` — inline style gradients

#### `components/landing/LandingHeader.tsx`
- `rgba(14,17,22,0.92)` — header bg
- `rgba(242,239,232,0.08)` — border colour
- `#D6AD69`, `#F2EFE8`, `#1D222A` — all hardcoded
- `bg-[#D6AD69]` on CTA button

#### `components/landing/TileMosaic.tsx`
- `#161B22` — front face bg (JS string)
- `#D6AD69` — back face bg (JS string)
- All tile colours in inline JS, cannot use CSS tokens

#### `components/landing/LandingBento.tsx`
- Card `bg` defined as raw hex strings in data (`#D6AD69`, `#1B2430`, `#F2EFE8`, `#22303D`, `#2A2218`, `#171A20`)
- All text colours as raw hex in data array

#### `components/landing/LandingHowItWorks.tsx`
- `rgba(242,239,232,0.12)` — border colour
- `text-[#D6AD69]`, `text-[#F2EFE8]`, `text-[#8B949E]` — hardcoded

#### `components/landing/LandingTrust.tsx`
- `#D6AD69`, `rgba(214,173,105,0.04)` — blockquote border/bg inline
- `#F2EFE8`, `#8B949E` — text colours

#### `components/landing/LandingCTA.tsx`
- `text-[#D6AD69]`, `text-[#F2EFE8]`, `text-[#8B949E]`
- `bg-[#D6AD69]` on CTA button

#### `components/landing/LandingUseCases.tsx`
- `bg-[#101216]`, `text-[#F0F1F3]`, `text-[#A4AAB5]`, `border-[#D6AD69]/...`

#### `components/landing/LandingExamples.tsx`
- All icon colours, border colours hardcoded to `#D6AD69` variants
- `bg-[#101216]`, `bg-gradient-to-b from-[#101216]/90`

#### `components/landing/LandingFooter.tsx`
- `#8B949E`, `rgba(242,239,232,0.08)`, `#0E1116` — all inline styles

#### `components/workspace/DashboardView.tsx`
- Extensive: `bg-[#171A20]`, `bg-[#1D222A]`, `text-[#F0F1F3]`, `text-[#A4AAB5]`, `border-[#A4AAB5]/12`, `text-[#D6AD69]`, `text-[#101216]`, `bg-[#D6AD69]/...`

#### `components/workspace/ArchitectureCanvas.tsx`
- `bg-[#101216]`, `bg-[#0C0E12]`, `text-[#F0F1F3]`, `text-[#A4AAB5]`, `bg-[#1D222A]`, `bg-[#171A20]` — pervasive hardcoding
- Mermaid `themeVariables` all hardcoded (expected — Mermaid API requires explicit colours)

#### `components/workspace/PropertyInspector.tsx`
- `bg-[#101216]`, `bg-[#171A20]`, `bg-[#1D222A]`, `bg-[#0C0E12]`
- `text-[#F0F1F3]`, `text-[#A4AAB5]`, `text-[#D6AD69]`
- Score ring SVG colours: `#1D222A` (track), `#D6AD69` (fill) — hardcoded

#### `components/workspace/AIAssistantDock.tsx`
- `bg-[#0C0E12]`, `bg-[#171A20]`, `bg-[#101216]`, `bg-[#F0F1F3]`, `bg-[#1D222A]`
- `text-[#F0F1F3]`, `text-[#A4AAB5]`, `text-[#D6AD69]`, `text-[#101216]`

#### `components/workspace/LineSidebar.tsx`
- `bg-[#0C0E12]/72`, `text-[#F0F1F3]`, `text-[#A4AAB5]`, `text-[#D6AD69]`
- Active item: `border-[#D6AD69]/28 bg-[#D6AD69]/16`

#### `app/workspace/*/page.tsx` files
- All workspace pages use hardcoded hex — `#101216`, `#171A20`, `#F0F1F3`, `#A4AAB5`, `#D6AD69`

### Components using semantic tokens correctly
- `app/workspace/layout.tsx` — uses `bg-background`, `text-foreground`, `border-[var(--border)]`
- `components/workspace/PageHeader.tsx` — uses `#F0F1F3`, `#A4AAB5`, `#D6AD69` (partially hardcoded but consistent)
- `LandingFeatures.tsx` — uses `bg-surface/50`, `text-accent`, `text-muted`, `text-foreground` (best example of semantic usage)

### Summary
The vast majority of components use hardcoded hex values. This means changing the light theme tokens in CSS will have **zero effect** on most components. A full semantic token migration is required for the light theme to work.

---

## 4. Empty Visual Areas & Broken Layouts

### Landing Page

#### `LandingBento.tsx` — Capability Cards
- **Issue:** Six cards are pure solid-colour blocks (`aspectRatio: "4/3"`) with only text and a hover arrow. No illustration, diagram preview, or icon content inside the coloured area.
- The amber card (Architecture Diagrams), ivory card (Sequence Diagrams) — completely empty above the title.
- **Severity:** HIGH — these are meant to represent diagram types but have zero visual content.

#### `LandingHero.tsx` — Stats strip
- Stats are very minimal: "8+", "AI", "1-click" — numeric labels only, no visual context.
- The TileMosaic is the only visual behind the hero text.

#### `LandingTrust.tsx` — About section
- The left side has only a blockquote. There is no visual/illustration element on this full-screen section.
- The three stats (8+, 100%, 1-click) are text-only with no visual treatment.

#### `ArchitectureDemo.tsx`
- This component is **not imported anywhere in the current page.tsx**. It exists but is orphaned (not rendered on the landing page).

#### `LandingFeatures.tsx`
- This component is also **not imported in `app/page.tsx`**. It exists but is orphaned.

#### `LandingUseCases.tsx`
- Also **not imported in `app/page.tsx`**. Orphaned.

#### `LandingExamples.tsx`  
- Also **not imported in `app/page.tsx`**. Orphaned.

#### `Navbar.tsx`
- Also **not imported in `app/page.tsx`**. `LandingHeader.tsx` is the real header.

### Workspace Pages

#### Dashboard (`DashboardView.tsx`)
- The "AI Research Workstation" card is purely textual — large empty panel with no visual.
- The "Latest Session" block when `latestProject` is null shows generic fallback text. No illustration or empty-state graphic.
- Template cards in the bottom section have no thumbnail or preview visual.

#### Projects Page (`app/workspace/projects/page.tsx`)
- Project cards have a dot-pattern background but no diagram thumbnail/preview.
- `synthesizeFallbackArchitecture` is called to populate `result` for projects without one, but the card itself shows no diagram thumbnail.
- **"Quick View"** button opens a modal with a full `ArchitectureCanvas` — this IS a meaningful visual, but the card itself gives no hint of what the diagram looks like.
- **Duplicate amber blur decorators** — there are two identical `absolute` blur circles defined (copy-paste bug: `left-[10%] top-[-180px]` appears twice).

#### History Page
- Timeline cards have no diagram preview, only text metadata.
- The timeline connector line on the left is a good visual element, but the cards themselves are purely textual.

#### Template Library (`app/workspace/templates/page.tsx`)
- Uses `ChromaGrid` component.
- Template card `visual` prop renders only `<LayoutTemplate icon> Use Template` text — **no SVG preview of the template architecture**.
- This is the most critical empty visual: a template library where no template shows what the template looks like.

#### UML Page (`app/workspace/uml/page.tsx`)
- UML type selection cards all use the same `<GitBranch>` icon. No per-type illustration (class box, sequence lifeline, ER table, etc.).
- Pre-generation state is pure text.

#### Studio Canvas (`app/workspace/generate/page.tsx`)
- When `result` is null (pre-generation), the main area shows `AIGenerationPanel` + optional `LoadingSequence`. No placeholder diagram or illustration. This is acceptable UX but a large empty dark area.
- Inspector panel: when closed, the canvas fills correctly. The panel slides in from the right.

#### Research Page (`app/workspace/research/page.tsx`)
- `EmptyState` component shows a `<BookOpen>` icon and example questions — this is a reasonable empty state.
- `LoadingState` has an animated indicator with step list — solid implementation.
- No visual diagram/illustration in the result area — all text cards.

---

## 5. Missing Hover/Focus States

### Interactive elements lacking adequate hover/focus

#### Landing Page

- **`LandingBento.tsx` cards:** Have `group-hover:opacity-100` on an arrow and a faint overlay, but no border change, no scale, no background brightening. The lift/translate is commented out (the `.opacity-0 group-hover:-translate-y-1` div has a translate on it but a translate transform would fight the card's static position since the parent card doesn't have `group-hover:-translate-y-1`). **No focus-visible ring** on the `<Link>` elements.
- **`reveal-col` and `reveal-card` CSS classes** — used extensively on `LandingHowItWorks` and `LandingBento`, but these classes are **not defined in `globals.css`**. The intersection-observer adds `is-in` class but the animation target class doesn't have CSS rules — the scroll-reveal animation likely doesn't work.

#### Workspace

- **Property Inspector tab icons:** Have `hover:bg-[#171A20] hover:text-[#F0F1F3]` — adequate.
- **Canvas toolbar buttons:** Have `hover:bg-[#1D222A] hover:text-[#F0F1F3]` — adequate.
- **Project card "Open Canvas" link:** Has `group-hover:text-[#D6AD69]` via parent but the link itself has only `font-bold text-[#D6AD69]` — no dedicated hover style on the link itself (relies on parent group).
- **Context menu items (Projects page):** Have `hover:bg-[#1D222A]` — adequate.
- **Settings theme buttons:** Have appropriate selected/hover states.
- **UML type cards:** Have `hover:border-[#D6AD69]/35 hover:-translate-y-1` but **no focus-visible ring**. Tab navigation would not visually indicate focus.
- **AIAssistantDock quick question chips:** Have `hover:border-[#D6AD69]/40 hover:bg-[#D6AD69]/10 hover:text-[#F0F1F3]` — adequate hover, but **no focus-visible ring**.
- **Copilot Apply/Cancel buttons:** Have hover states, adequate.

#### Global Missing Focus Rings
Most interactive elements use Tailwind `hover:` but very few have `focus-visible:outline` or `focus-visible:ring`. The landing page CTAs DO have proper `focus-visible:outline` rules. The workspace interior largely lacks them. Key gaps:
- UML type selection cards
- Template filter pills (partially: has `focus-visible:ring-2 focus-visible:ring-[#D6AD69]` — GOOD)
- AI Copilot suggestion chips
- Property Inspector tabs (only `title` tooltip, no visible focus ring)
- History card "Open Version" button
- Sidebar nav items (no `focus-visible`)

---

## 6. TileMosaic Current State

### Architecture
- **Type:** Pure DOM manipulation (no React state). Creates a CSS Grid of `<div>` elements directly via `document.createElement`.
- **Grid size:** Desktop: 80×80px tiles, Mobile: 56×56px tiles.
- **Pointer radius:** `POINTER_RADIUS = 85` pixels. Tiles within 85px radius of the pointer are activated.
- **Interaction model:**
  1. **Pointer move** — `pointermove` event on container → activates tiles within 85px radius via `activateTileTemporarily(tile, 900ms)`.
  2. **Touch move** — same logic via `touchmove` passive listener.
  3. **Ambient shuffle** — random tile flips every 1800ms when no pointer activity.
  4. **Idle probe loop** — Lissajous-like path `rAF` loop simulating pointer movement when last pointer event was >1500ms ago. Prevents the mosaic going completely static at rest.

### Tile Flip Animation
- Each tile has a CSS 3D `transform-style: preserve-3d` inner element.
- **Front face:** `#161B22` dark graphite with `rgba(255,255,255,0.04)` inset box-shadow.
- **Back face:** `#D6AD69` amber, `transform: rotateX(180deg)`.
- Flip: `inner.style.transform = "rotateX(180deg)"` → back face visible.
- Transition: `650ms cubic-bezier(0.2,0.7,0.2,1)`.
- The initial wave animation uses diagonal delay `(c + r) * 38ms`.
- **Reduced motion:** Respects `prefers-reduced-motion` — skips animation, tiles snap immediately.
- **`pointer-events: none`** on the container — tiles never block headline/CTA clicks. ✓

### Issues / Opportunities
- Tiles are pure amber or dark graphite — no "meaningful visual content" on any tile (the task requirement). The back face is a flat amber block.
- No per-tile SVG miniatures (microservice icons, class boxes etc.) — just flat amber.
- The pointer radius of 85px is moderate — could feel underwhelming on large screens.
- `pointer-events: none` on the whole container means tiles cannot receive individual hover CSS — all interaction must go through the container's `pointermove`. This is correct for the current approach.
- No CSS-based cursor-following glow — only tile flips track the cursor.

---

## 7. Existing Animation Utilities in globals.css

### Keyframe Animations Defined

| Name | Description |
|---|---|
| `fade-in` | opacity 0→1 + translateY(20px→0) |
| `fade-up` | opacity 0→1 + translateY(40px→0) |
| `fade-in-up` | opacity 0→1 + translateY(16px→0) |
| `scale-in` | opacity 0→1 + scale(0.97→1) |
| `shimmer` | background-position sweep (200%→-200%) |
| `moving-gradient` | 2-axis bg-position oscillation |
| `soft-ping` | scale 0.95→1.4→0.95, opacity 0.8→0.3→0.8 |
| `glow-pulse` | opacity 0.5→1→0.5 |
| `marquee` | translateX(0→-50%) |
| `float` | translateY(0→-8px→0) over 6s |
| `border-glow` | border-color amber oscillation |

### Utility Classes
| Class | Animation | Duration |
|---|---|---|
| `.animate-fade-in` | fade-in | 0.6s ease-out |
| `.animate-fade-up` | fade-up | 0.8s ease-out |
| `.animate-fade-in-up` | fade-in-up | 0.65s cubic-bezier(0.16,1,0.3,1) |
| `.animate-scale-in` | scale-in | 0.4s cubic-bezier(0.16,1,0.3,1) |
| `.animate-float` | float | 6s ease-in-out infinite |
| `.animate-moving-gradient` | moving-gradient | 4s ease infinite |
| `.pulse-dot-ping` | soft-ping | 2s cubic-bezier(0,0,0.2,1) infinite |

### Delay Utilities
`.animation-delay-100` through `.animation-delay-600` (100ms increments)

### `prefers-reduced-motion` Override
`.animate-fade-in`, `.animate-fade-in-up`, `.animate-scale-in` are set to `animation: none !important`. `.btn-premium:hover` transform is also removed.

### Notable Gap
- No `@keyframes slide-in-right` or `slide-in-left` for panel transitions.
- No `@keyframes pulse-border` (only `border-glow`).
- No explicit cursor-follow glow keyframe (would need JS/CSS variable approach).
- `.reveal-card` and `.reveal-col` classes used in `LandingBento` and `LandingHowItWorks` are **not defined** in globals.css — these scroll-reveal classes will silently fail.

---

## 8. Sign-in / Sign-up Page Structure

### Structure Type
**Custom pages with Clerk components** — NOT Clerk-hosted. Both `sign-in` and `sign-up` are custom Next.js pages wrapping Clerk's `<SignIn>` and `<SignUp>` components.

### Layout
Both pages use an identical two-panel layout:
- **Left panel (hidden on mobile, `lg:w-1/2`):** Custom Arqin branding panel
  - Logo (icon + "Arqin AI" wordmark)
  - Headline: "Start architecting / in seconds."
  - Description paragraph
  - 2×2 feature card grid with mono-icon glyphs (`⬡`, `⟨⟩`, `✦`, `↓`) and feature names
  - Sign-in also has 3 bullet-point items
  - Dot-grid pattern + amber blur decoration
  - Footer copyright line
- **Right panel (`flex-1`):** Clerk component centered
  - Mobile logo (shown on `lg:hidden`)
  - `<Suspense>` wrapper with loading fallback text
  - Clerk component with full `appearance` override

### Clerk Theming
The Clerk appearance is fully customized to match the dark theme:
- `colorPrimary: "#D6AD69"` — amber primary
- `colorBackground: "#171A20"` — surface colour
- Card background: `!bg-[#171A20]`
- Form inputs: `!bg-[#1D222A]` with amber focus border
- Primary button: `!bg-[#D6AD69] !text-[#0E1116]`

### Light Theme Gap
The Clerk appearance overrides are hardcoded dark values. When light theme is active, the Clerk form will remain dark-themed unless the appearance object is made conditional on the active theme. This needs `useTheme()` integration (requires making the pages client components or passing theme through a context-aware wrapper).

### Sign-up extras
- Has "Free to use · No credit card required" badge
- Feature cards have the same 4 items as sign-in
- No bullet-point section (unlike sign-in)

---

## 9. AIAssistantDock Structure

### States

#### Closed State
A floating pill button: `"Ask Arqin AI Copilot"` with Bot icon, amber glow border, scale hover. Fixed `bottom-6 right-6`.

#### Open State (520×380px modal)
Rounded panel (`rounded-[26px]`) with 4 distinct zones:

1. **Header bar** — Arqin AI branding, project title, close button.
2. **Quick actions bar** (conditional, only shown when `onOptimize`/`onSimulate`/`onArtifacts` are provided):
   - 3-column grid: Optimize (amber), Simulate (ghost), Artifacts (ghost) — all close the dock on click.
3. **Messages area** (scrollable):
   - **Empty state:** Bot icon, "Architecture intelligence" label, example question chips (5 chips).
   - **User message:** Right-aligned, white-background bubble, dark text.
   - **AI message:** Left-aligned, dark surface bubble with `text-[#A4AAB5]`, bold spans highlighted white.
   - **System/status message:** Full-width amber-tinted row with spinner.
   - **Proposal state:** AI message with Apply/Cancel buttons appended. Apply is amber, Cancel is ghost.
   - **Busy indicator:** Amber tinted row with spinner when `busy && last msg is user`.
   - **Loading indicator:** Same amber row when `loading` prop is true.
4. **Input bar** — text input + Send button. Input disabled when `pendingModification` is non-null.

### Loading States
- In-flight: spinner row in messages area.
- Architecture applying: second spinner row (via `loading` prop).

### Error States
- Network error: AI message in bubble: "Network error — please check your connection."
- Apply failure: AI message: "Failed to apply modification. Your architecture is unchanged."
- No error boundary — uncaught errors would propagate.

### Proposal UI
- Proposal is rendered as an AI bubble with appended Apply/Cancel buttons.
- Only one pending modification allowed at a time (`pendingModification` state).
- Input field shows "Pending confirmation above…" placeholder and is disabled until resolved.
- After cancel: system message added, modification cleared.
- After apply: runs `onApplyModification(instruction)` → architecture-level regeneration.

### Issues
- No focus trap when dock is open (accessibility: tab navigation escapes the modal).
- No keyboard shortcut to open/close.
- Fixed positioning means it overlaps Inspector panel content on narrow viewports.
- The 380px width may clip on narrow mobile screens.

---

## 10. PropertyInspector Structure

### Empty State
When `result` or `graph` is null: centered panel with Boxes icon, "Arqin Intelligence" label, and descriptive text. Clean and clear.

### Full State Layout
Two-column inside the aside:
- **Left icon-rail (48px):** Icon-only tab buttons for 8 tabs. Active state: amber left-bar indicator + `bg-[#1D222A]`. No labels in normal layout.
- **Right content area:** Scrollable, `space-y-4 p-4`.

### 8 Tabs
`overview` | `security` | `reliability` | `failure` | `observability` | `patterns` | `cost` | `recommendations`

### Overview Tab
- **`ScoreRing` component:** SVG circle ring, track colour `#1D222A`, fill `#D6AD69`. Score number centered.
- **Metrics grid:** 4 `<Metric>` bars (Scalability, Reliability, Security, Observability) — horizontal progress bars, amber fill.
- **Findings inventory count** card.
- **Optimize** and **Simulate** action buttons.

### Score Bars (`Metric` component)
- `h-1` (`4px`) progress bar.
- Background: `bg-[#101216]`.
- Fill: `bg-[#D6AD69]`.
- Label: 10px, `text-[#A4AAB5]`. Value: mono bold `text-[#D6AD69]`.
- `transition-all duration-500` on fill width.

### Risk Badges (`FindingCard` component)
- Severity shown as a rounded-full mono badge: `border-[#D6AD69]/30 bg-[#D6AD69]/10 text-[#D6AD69]`.
- All severities use the same amber colour regardless of CRITICAL/HIGH/MEDIUM — no colour-coded risk levels.
- Clicking a finding calls `onSelectRiskNodes` to highlight affected nodes on the canvas.

### Component List (Selected Component card)
- Shows when `selectedComponent` is non-null.
- Displays component name, description.
- Two action buttons: "Failure Path" (navigates to failure tab) and "+ Cache" (ADD_CACHE mutation).

### Failure Tab
- Dropdown `<select>` to choose failure target node.
- Displays cascading chain as text path (`→ → →`).
- Shows resilience recommendation text.

### Issues
- All severity badges are amber regardless of level — no red for CRITICAL, yellow for MEDIUM.
- Tab icons are very small (14px) with only `title` tooltip for labels — accessibility concern.
- Mobile: tab rail switches to horizontal scroll overlay (`mobileOpen` state), but the implementation uses `absolute` positioning that overlaps content.
- No loading state when data is being computed (though `evaluateUnifiedIntelligence` is synchronous so this is currently fine).
- `recommendations` tab appears in TABS array but its render block was cut off in the file (file was truncated at 30k chars). Its implementation needs to be verified.

---

## 11. LineSidebar Navigation

### Active State Implementation
Active item detection uses path + query param matching:

```typescript
function isActive(href: string, exact?: boolean) {
  const [base, queryStr] = href.split("?");
  const matchesPath = pathname === base;
  // ...query param check for items like "?new=1"
  // Special case: /workspace/generate is only active when no project/template/journey params
}
```

This is correct and nuanced. "New Architecture" (`/workspace/generate?new=1`) is active only when `new=1` param is present. "Studio Canvas" (`/workspace/generate`) is active only when no special params are present.

### Visual Active State
- Border: `border-[#D6AD69]/28`
- Background: `bg-[#D6AD69]/16`
- Text: `text-[#F0F1F3]`
- Icon: `text-[#D6AD69]`
- **Left accent bar:** `absolute left-0` `h-5 w-[3px]` rounded `bg-[#D6AD69]` — this is the `.line-sidebar-active` pattern implemented inline.

### Inactive Hover State
- Background: `hover:bg-[#D6AD69]/10`
- Text: `hover:text-[#F0F1F3]`

### Collapsed State
- Width transitions to `w-[72px]`.
- Labels and section headers hidden.
- Icons remain visible.
- Collapse button hidden on mobile.

### Issues
- **No `focus-visible` ring** on sidebar nav links.
- **`aria-current="page"`** not set on active items (accessibility).
- The bottom UserButton area is hidden when collapsed — good, but the collapse button only shows on `lg:` — mobile always sees full sidebar.
- Sidebar uses `fixed` positioning on mobile and `static` on desktop (via `lg:static`). This is correct. However the transition `transition-all duration-300` on the aside tag applies to both `width` and `transform` simultaneously, which could cause visual jank on collapse.

---

## 12. Template Cards — Current Visual Content

### In `app/workspace/templates/page.tsx`
Templates render through `ChromaGrid` component with:
```tsx
visual: (
  <div className="flex h-full items-center justify-center gap-2">
    <LayoutTemplate className="h-5 w-5 text-[#D6AD69]" />
    <span>Use Template</span>
  </div>
)
```
**Every single template card shows the same `<LayoutTemplate>` icon.** There are no individual SVG previews. The visual area of each ChromaGrid card is identical across all 13 templates regardless of type (E-Commerce, Banking, AI App, etc.).

### In `components/landing/LandingExamples.tsx`
Landing examples use per-template icons (`ShoppingCart`, `MessageSquare`, `Hospital`, `Tv`, etc.) which provides per-category differentiation. However these are still just icon placeholders — no actual diagram miniatures.

### In `DashboardView.tsx` — Starter Blueprints
Template cards at the bottom of the dashboard show: title, description, "Use Blueprint" link. No visual/icon whatsoever.

### What's Needed
- Per-template SVG miniature previews showing the actual architectural pattern.
- At minimum: per-category icons (different for class diagram vs architecture vs sequence vs ER).
- Stretch: actual mini Mermaid diagrams rendered at reduced scale, or hand-crafted SVG illustrations per category.

---

## 13. History Page — Card Structure

### Card Structure (per `HistoryEntry`)

Each history card shows:
- **Version tag badge** (e.g. `v3.0`) — monospace, amber or rose colour based on status
- **Project title** — truncated, bold
- **Diagram type badge** — `DIAGRAM_TYPE_LABELS[entry.diagramType]`
- **Prompt text** — quoted, monospace, `text-[#A4AAB5]`
- **Timestamp** — `createdAt` formatted as `toLocaleString()`
- **Action:** "Open Version" link (success) or "Generation Error" badge (failure)

### Timeline Visual
- Left vertical gradient line (`#D6AD69/30` → `#303640` → transparent)
- Per-card circular dot indicator: amber for success, rose for failure

### Filter Controls
- Text search (title, prompt, diagram type)
- Status filter tabs: All / success / error

### What's Missing
- No diagram thumbnail/preview per card
- No health score shown (even though `entry.result?.adaptiveInsights?.health` is available)
- No "diagram type" icon (all same structure)
- No indication of which version was the "current" or latest successful one

### Empty State
- History icon, "No architecture history found" message, descriptive sub-text. Clean. No action CTA beyond "generate an architecture".

---

## 14. Dashboard Empty States

### Projects Section (when `projects.length === 0`)
```tsx
<div className="rounded-2xl border border-dashed border-[#4A5060] p-8 text-center">
  <p className="text-xs text-[#A4AAB5]">No projects saved yet.</p>
  <Link href="/workspace/generate?new=1">
    <Plus /> Create Project
  </Link>
</div>
```
- **Minimal.** No icon, no illustration, just text + link.

### Latest Session (when no `latestProject`)
```tsx
<h3>No Architecture Open</h3>
<p>Open the studio canvas or choose a template to begin architecting.</p>
```
- Text-only, no visual.

### DashboardView overall
- The "AI Research Workstation" section is always rendered with fixed text regardless of research history — no empty/active state differentiation.
- The "Starter Architecture Blueprints" section always shows `TEMPLATES.slice(0, 3)` — always populated (templates are static data).

### Projects Page (when `projects.length === 0`)
```tsx
<FolderOpen className="h-7 w-7" />
<h3>No Projects Saved Yet</h3>
<p>Generate your first architecture...</p>
<Link>Launch Studio Canvas</Link>
```
- Better: has icon, heading, description, CTA button. Adequate empty state.

### History Page (when `filtered.length === 0`)
```tsx
<History className="h-5 w-5" />
<p>No architecture history found</p>
<p>Create or generate an architecture...</p>
```
- Has icon, two-line description. Adequate but no CTA.

### Summary of Empty State Quality
| Location | Has Icon | Has CTA | Has Illustration |
|---|---|---|---|
| Dashboard > Projects | ✗ | ✓ | ✗ |
| Dashboard > Latest Session | ✗ | ✗ | ✗ |
| Projects Page | ✓ | ✓ | ✗ |
| History Page | ✓ | ✗ | ✗ |
| Research Page | ✓ | ✓ (example Qs) | ✗ |
| Canvas (pre-generate) | ✗ | ✓ (panel) | ✗ |

---

## 15. Additional Workspace Page Notes

### Settings Page
- Theme switcher works (3 buttons: Dark, Light, System).
- "Light Mode" selection: persists correctly to localStorage, sets `data-theme="light"` on `<html>`, but since CSS light tokens are identical to dark, visually nothing changes.
- Section tabs (Appearance/Architecture/API & Privacy/About System) use `bg-[#D6AD69]` active state — clear active indication.
- All hardcoded dark colours throughout.

### UML Page
- 6-card type selector — all use `<GitBranch>` icon, no per-type visual.
- Synthesis control box is well-structured.
- Post-generation: full `ArchitectureCanvas` renders — correct.
- No history integration — generated UML is not saved to history.
- No template integration.

### Research Page
- Most complete empty/loading states of all pages.
- `LoadingState` has animated step list — good UX.
- `EmptyState` has example questions as interactive buttons — good.
- `isFallback` banner when AI is unavailable — transparent to user.
- Result sections use collapsible `<CollapsibleSection>` — good density management.
- `QualitativeBadge` shows qualitative labels but no colour-coded risk levels.

### Studio Canvas (generate page)
- Complex state machine: new / from-project / from-template / from-journey.
- Inspector panel slides in from right with CSS transform.
- Copy of Inspector header is rendered inline in the generate page (duplicate of PropertyInspector header area).
- `AIAssistantDock` is a fixed floating element — overlaps everything.
- Error state for generation: amber-tinted alert with `AlertCircle` icon.
- Error state for diagram render: fullscreen overlay with "Regenerate" button.

---

## 16. Critical Findings Summary

### P0 — Light Theme Completely Non-Functional

The `[data-theme="light"]` CSS block is identical to the dark theme. Selecting Light Mode in Settings has no visual effect. This is the single highest priority issue.

**Required:** Replace every token in `[data-theme="light"]` with genuine light values (warm off-white backgrounds, dark graphite typography, restrained shadows).

**Additional:** The vast majority of components use hardcoded `#101216`, `#171A20`, `#F0F1F3`, etc. in Tailwind classes and inline styles. These will not respond to theme changes even after tokens are fixed. A systematic migration to `bg-background`, `text-foreground`, `bg-surface`, etc. is required.

### P0 — Missing CSS Classes (`reveal-card`, `reveal-col`)

`LandingBento.tsx` and `LandingHowItWorks.tsx` add `reveal-card` and `reveal-col` classes to elements and use IntersectionObserver to add `is-in`. However **no CSS for these classes exists in `globals.css` or elsewhere**. The scroll-reveal animation is silently broken — elements just appear without animation.

### P1 — Template Cards Have Zero Visual Preview

The Template Library page shows the same `<LayoutTemplate>` icon for all 13 templates. No architectural preview, no per-category illustration. This is the most prominent empty visual area in the workspace.

### P1 — LandingBento Cards Are Blank

The 6 capability cards on the landing page are large solid-colour blocks with only text. The central area of each card (the majority of a 4:3 aspect ratio block) is completely empty. Architecture diagrams, UML previews, or illustrations should fill this space.

### P1 — Orphaned Components

`ArchitectureDemo`, `LandingFeatures`, `LandingUseCases`, `LandingExamples`, and `Navbar` are defined but not imported into `app/page.tsx`. They exist but are never rendered. This is either deliberate (cut content) or an oversight. The landing page is missing these sections.

### P2 — No Focus-Visible Rings on Most Workspace Interactive Elements

UML type cards, AI Copilot chips, Property Inspector tabs, sidebar nav links, history cards, and many other interactive elements lack `focus-visible:outline` or `focus-visible:ring` styles. Keyboard navigation would be invisible.

### P2 — PropertyInspector Severity Badges are Monochrome

All finding severity levels (CRITICAL, HIGH, MEDIUM, LOW) display the same amber badge. Risk severity is not visually differentiated.

### P2 — Dashboard Empty States are Minimal

The Projects section empty state in `DashboardView` has only 2 lines of text and a link. No icon, no illustration, no clear CTA button style.

### P2 — AIAssistantDock Has No Focus Trap

When the Copilot panel is open, tabbing continues to focus elements behind the panel. Requires `aria-modal`, `aria-label` on the panel, and focus trapping.

### P3 — History Cards Show No Diagram Metadata

Health score, diagram thumbnail, and visual status indicators are absent from history cards, even though the data is available (`entry.result?.adaptiveInsights`).

### P3 — Clerk Components Will Not Respond to Light Theme

Both sign-in and sign-up use hardcoded dark Clerk appearance objects. Must be made conditional on `useTheme()` resolved value.

### P3 — Mermaid Theme Variables Are Dark-Only

`ArchitectureCanvas.tsx` hardcodes Mermaid `themeVariables` with dark graphite values. In light mode, the diagram would render dark on a potentially lighter canvas background.

### P3 — TileMosaic Back Face is Flat Amber

Tiles flip to a solid amber rectangle. The task requires "meaningful visual content" on selected tiles. This needs per-tile SVG miniatures or at minimum a subtle pattern/icon on the amber face.

### P3 — Duplicate Blur Decorators on Projects Page

Two identical `absolute` amber blur circles are copy-pasted in `app/workspace/projects/page.tsx`.

---

*Audit complete. No files were modified.*
