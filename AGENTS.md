# AgriScan agent rules

## Stack
React 19, TypeScript, Vite, Tailwind v4. All app code is .ts/.tsx. Never add .js files.

## Design workflow (mandatory for every UI change)
1. Read DESIGN.md before editing UI. If missing, create it from src/index.css.
2. Use the `impeccable` skill for any design, audit, polish or layout task. Use `apple-design` and `emil-design-eng` only for motion.
3. After each UI change, audit your own edit: typos, spacing, alignment, contrast, 375px mobile, reduced motion. Fix before finishing.

## Hard rules
- Colors only from tokens in src/index.css (bg-background, bg-card, text-foreground, bg-primary, border-border). No raw hex, no slate-* or emerald-* classes.
- One page background: bg-background, never bg-slate-950.
- Fonts via font-sans and font-serif only. No inline fontFamily, no Georgia.
- No pulsing glows, no gradient text, max one backdrop-blur layer per screen.
- Spacing from Tailwind's scale only. Run npx tsc --noEmit after changes.
