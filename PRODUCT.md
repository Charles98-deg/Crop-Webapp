# AgriScan: product brief

## What it is
A web app that works in any browser on any device. A grower photographs a sick crop and immediately gets a 24-hour plan to save it. Global scope, not Nigeria-only. The plan is the product; everything else supports it.

## Users
Growers anywhere, from smallholders on cheap phones with weak connections to commercial farm staff. Often outdoors in sunlight, one hand free, stressed because the crop is at risk. They need speed and plain language, not enterprise vocabulary.

## Core flow (three screens only)
1. Landing: one promise, one button ("Scan your crop"). Nothing competes with it.
2. Scan: camera or upload fills the screen. Crop and location are optional and secondary. No banners, no fake telemetry, no duplicate navigation.
3. Result: answer first, in the order below.

## How the AI answers (backend returns JSON; UI renders in this order)
1. Not a plant: friendly retake message only.
2. Verdict: crop_identified, health_status, pathology_name, severity_level, confidence_score. Hedge wording ("Likely", "Possible") when confidence is below 0.85.
3. Do now: action_plan_0_2_hours, 2_6_hours, 6_24_hours as a timeline.
4. Avoid: the avoid list, visually distinct as a warning.
5. Treatment: organic_local_remedy first; standard_chemical_treatment second, collapsed.
6. Escalation: when to get a local expert.
7. Prevention and observable_symptoms: collapsed.
8. Audio: spoken version of the plan.
If is_uncertain or needs_clarification is true: show clarification_question with options as tappable chips, then re-run.

## Global requirements (currently NOT met)
- The system prompts in backend/main.py and server.ts hardcode Cross River State, NAFDAC, CRADP, six West African crops and Nigerian Pidgin. Make country, region and language inputs the prompt uses. Replace the fixed WestAfricanCrop list with a global list plus auto-detect.
- Never recommend chemicals banned by international conventions or the user's country. Prefer organic, locally available options.
- Make no claim the app can't back up: no "Enterprise Certified", no fake telemetry, no offline claim without a service worker.

## Design direction
- Operate mode for scan and result screens: speed, scanability, large tap targets, readable in sunlight. Persuade mode for the landing page only.
- One background color, one accent, semantic tokens only. Use the loaded fonts (Plus Jakarta Sans, Newsreader); no inline fontFamily.
- Calm and trustworthy, like a good field or health tool, not a sci-fi dashboard. No glow, gradient text or stacked blur.
- Plain, short, translatable sentences.
- Design for 360px width first; fast on slow networks.

## Architecture
React 19, TypeScript, Vite, Tailwind v4. POST /api/diagnose with image, crop, location, fieldNotes. Two backends exist: backend/main.py (FastAPI, on Render) and server.ts (Express, used by npm run dev and AI Studio). Both call Gemini with a JSON schema. Keep them in sync; src/types.ts is the contract.

## Rules for agents
Audit before editing. Cite the rule behind every change. Change nothing that isn't broken. Run npx tsc --noEmit.
