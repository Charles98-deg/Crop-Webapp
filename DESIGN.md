---
name: AgriScan
description: Fast, high-contrast field plant pathology triage for growers under outdoor sunlight
colors:
  primary: "#22C55E"
  primary-foreground: "#060D09"
  background: "#060D09"
  foreground: "#FFFFFF"
  card: "rgba(13, 28, 19, 0.75)"
  card-foreground: "#FFFFFF"
  popover: "#0A160F"
  popover-foreground: "#FFFFFF"
  secondary: "rgba(22, 44, 30, 0.8)"
  secondary-foreground: "#FFFFFF"
  muted: "rgba(15, 30, 22, 0.7)"
  muted-foreground: "#A7F3D0"
  accent: "#10B981"
  accent-foreground: "#FFFFFF"
  destructive: "#EF4444"
  destructive-foreground: "#FFFFFF"
  warning: "#F59E0B"
  warning-foreground: "#060D09"
  border: "rgba(255, 255, 255, 0.12)"
  border-subtle: "rgba(255, 255, 255, 0.08)"
  input: "rgba(10, 22, 15, 0.95)"
  ring: "#22C55E"
typography:
  display:
    fontFamily: "'Newsreader', Georgia, serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Newsreader', Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "7px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  2xl: "22px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: AgriScan

## Overview

**Creative North Star: "The Field Diagnostic Instrument"**

AgriScan is built for growers outdoors in direct sunlight: one hand on the crop, one hand holding a mobile phone, stressed because their livelihood is at risk. It feels like an essential, calm, precision agricultural diagnostic instrument—trustworthy, rapid, uncluttered, and uncompromisingly legible.

The aesthetic strips away sci-fi glowing effects, cyber-dashboard telemetry, pulsing neon borders, and multiple stacked backdrop blurs. In their place is a single, deep organic obsidian surface (`#060D09`), high-contrast crisp white typography, restrained botanical green accents (`#22C55E`), and deliberate editorial serif titles (`Newsreader`) paired with an ultra-readable geometric sans (`Plus Jakarta Sans`).

**Key Characteristics:**
- **Single Canvas Ground:** Everything lives on `bg-background` (`#060D09`). Never use `bg-slate-950` or conflicting dark backgrounds.
- **Sunlight Readability:** High text-to-background contrast ratio (exceeding WCAG AAA for key metrics and 4.5:1 minimum for body text). No faint slate grays for critical labels.
- **Physical Restraint:** Max one subtle backdrop blur per screen. No pulsing radar glows, no multi-color gradient text, no animated neon rings.
- **One Clear Promise:** The landing page has one job—empowering the grower to scan their sick crop immediately. Nothing competes with the primary action.

## Colors

A focused, botanical obsidian palette rooted in organic chlorophyll tones and deep peat soil.

### Primary
- **Botanical Emerald** (`#22C55E` / `bg-primary`): Used exclusively for primary action triggers (e.g. "Scan your crop"), healthy diagnostic verdicts, and critical progress confirmation. Never sprayed decoratively across backgrounds or borders.

### Secondary
- **Deep Canopy Green** (`rgba(22, 44, 30, 0.8)` / `bg-secondary`): Tonal surfaces for secondary action targets, chips, and muted controls.

### Neutral
- **Obsidian Earth** (`#060D09` / `bg-background`): The singular canvas foundation of the application.
- **Frosted Peat Card** (`rgba(13, 28, 19, 0.75)` / `bg-card`): The container background for diagnostic cards and result modules.
- **Pure White** (`#FFFFFF` / `text-foreground`): Primary text, headings, and high-priority data points.
- **Mint Sage** (`#A7F3D0` / `text-muted-foreground`): Subtitles, helper guidance, and secondary metadata.
- **Organic Border** (`rgba(34, 197, 94, 0.28)` / `border-border`): 1px structural borders dividing content cards.

### Named Rules
**The Single Canvas Rule.** Every view and surface renders atop `bg-background`. `bg-slate-950`, `bg-slate-900`, and arbitrary hex darks are strictly banned.
**The Token Fidelity Rule.** Never declare raw hex codes or Tailwind default color scales (e.g., `slate-*`, `emerald-*`, `teal-*`) in component templates. Every color must resolve through semantic theme tokens (`bg-primary`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`).

## Typography

**Display Font:** Newsreader (serif, optical size 6-72) with Georgia, serif fallback  
**Body Font:** Plus Jakarta Sans with system-ui fallback  
**Label/Data Font:** Plus Jakarta Sans

**Character:** The pairing of an authoritative, humane editorial serif with a crisp, modern geometric sans balances botanical science with immediate field legibility.

### Hierarchy
- **Display** (Bold 700, 3rem–4.5rem, line-height 1.1): Hero landing headline only. Rendered with `font-serif`.
- **Headline** (ExtraBold 800, 1.5rem–2rem, line-height 1.25): Diagnostic verdicts, primary screen titles.
- **Title** (SemiBold 600, 1.125rem–1.25rem, line-height 1.3): Card titles and section headers. Rendered with `font-serif`.
- **Body** (Regular 400 & Medium 500, 0.875rem–1rem, line-height 1.5): Action steps, triage explanations, notes (measure 60–75ch).
- **Label** (Bold 700, 0.75rem, tracking 0.05em, uppercase): Status badges, timeline timestamps, category indicators.

### Named Rules
**The Font Class Rule.** Typography uses `font-sans` and `font-serif` utility classes exclusively. Inline `style={{ fontFamily: '...' }}` and direct references to `Georgia` are prohibited.
**The No-Gradient Rule.** Text color is always solid `text-foreground`, `text-primary`, or `text-muted-foreground`. Gradient text masking (`bg-clip-text text-transparent`) is forbidden.

## Layout

- **Base viewport:** Optimized for 360px–375px mobile viewports first, expanding cleanly to tablet and desktop.
- **Grid & Rhythm:** 4px baseline scale (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px). Spacing strictly follows the Tailwind spacing scale.
- **Screen Flow (3 Screens Only):**
  1. *Landing:* One promise, one primary button ("Scan your crop"). Zero distractions.
  2. *Scanner:* Viewfinder camera and upload workspace filling the active viewport. Crop and location secondary and optional.
  3. *Result:* Urgent 24-hour actionable triage plan delivered in strict sequential order.

## Elevation & Depth

Surfaces are flat by default with subtle organic 1px border containment (`border-border`). 

- **Tonal Layering:** Depth is created through translucent card layering (`bg-card` on `bg-background`), not deep drop shadows.
- **Restrained Backdrop Filter:** Max one `backdrop-blur-*` layer per screen.
- **Zero Halo Rule:** Glowing zero-offset radial halos (`shadow-[0_0_30px_...]`) and pulsing glow animations are banned. Real depth comes from 1px structural borders.

## Shapes

- **Base Radius:** 12px (`rounded-xl`) for cards, dialogs, and primary action controls.
- **Sub-elements:** 8px–10px (`rounded-lg` / `rounded-md`) for thumbnail media, inner items, and input controls.
- **Pills:** `rounded-full` reserved for status chips and floating utility buttons.

## Components

### Buttons
- **Shape:** `rounded-xl` (12px radius) or `rounded-full` for hero CTA. Minimum tap target 48x48px for all outdoor touch interactions.
- **Primary:** `bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-[0.98]`.
- **Secondary:** `bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80`.
- **Outline:** `border border-border bg-transparent text-foreground hover:bg-secondary`.
- **Ghost:** `bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted`.

### Cards
- **Corner Style:** `rounded-xl` (12px).
- **Background:** `bg-card text-card-foreground border border-border`.
- **Internal Padding:** `p-5` or `p-6` (20px–24px).

### Badges / Chips
- **Shape:** `rounded-full px-3 py-1 text-xs font-semibold`.
- **Default:** `bg-secondary text-muted-foreground border border-border`.
- **Destructive / Avoid:** `bg-destructive/20 text-destructive-foreground border border-destructive/40`.

## Do's and Don'ts

### Do:
- **Do** test every screen at 360px–375px mobile width.
- **Do** ensure all interactive controls have a minimum touch target of 48px height (`min-h-[48px]`).
- **Do** use semantic tokens (`bg-background`, `bg-card`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`) exclusively.
- **Do** keep copy short, plain, translatable, and focused on saving the grower's crop within 24 hours.
- **Do** verify changes by running `npx tsc --noEmit`.

### Don't:
- **Don't** use `bg-slate-950` or any slate color classes anywhere in the app.
- **Don't** use raw hex codes (e.g. `#22C55E`, `#0D1C13`) in component classes or inline styles.
- **Don't** use inline `fontFamily` or mention `Georgia` directly. Use `font-serif` or `font-sans`.
- **Don't** use gradient text (`bg-clip-text text-transparent`) or pulsing glowing shadows.
- **Don't** stack multiple `backdrop-blur` layers.
- **Don't** display fake telemetry or unverifiable enterprise certifications.
