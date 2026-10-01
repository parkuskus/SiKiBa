# AGENTS.md — SIAGA Bunda

PWA skrining kesehatan ibu hamil/nifas/bayi (React 19 + Vite 6 + Tailwind v4 + Dexie + Supabase). Product spec: `docs/SiKiBa_Spesifikasi_Storyboard_Prototype.md`, screen IDs (`S-xx`): `docs/SCREENS.md`, design lock: `docs/DESIGN.md`.

## App essentials

- **Users:** ibu hamil, ibu nifas (0–42 hari), orang tua bayi baru lahir. Secondary: bidan (terima ekspor PDF via WhatsApp).
- **Modules (5):** Onboarding (S-00/01) · Beranda (S-02) · Skrining (S-03–05) · Edukasi (S-06) · Reminder/Tracker (S-07) + Profil (S-08).
- **Clinical core:** Poedji Rochjati, MAP/NICE, IMT-LILA/IOM, EPDS 10-item, MEOWS, Kramer — pure functions in `app/src/clinical-rules/`, must be pakar-validated; never invent thresholds.
- **Result pattern:** traffic light Hijau/Kuning/Merah + faktor + langkah + bagikan. MERAH results are never deletable.
- **Chatbot “Siba”:** `app/src/features/chatbot/` (`ChatbotPage.tsx`, `personality.ts`) + `app/src/services/chatService.ts`. Online → Supabase Edge Function `chat`; offline/fail → local FAQ fallback (never breaks UX). API keys never in client. Escalation must surface the same emergency overlay as MERAH results (TODO in code).
- **Brand:** SIAGA Bunda, tagline “Siaga menjaga bunda dan buah hati”. Sage `#7AAE9A`/`#4A6E54`, pink `#FFE2E2`/`#FFCFCF`, bg `#FFFDEC`/`#FFFCF6`, Plus Jakarta Sans.

## Design preferences (locked)

- **Figma-first redesign:** never copy old FE structure; Figma is source of truth, code follows after lock. Exception: screening form *content* may follow old FE (clinical fields), but each screening is its own screen — no `N dari 6` labels.
- **Signature layout:** colored stage (rounded bottom 32) + white sheet (rounded top 32). Auth sheets bleed behind cards.
- **Style refs:** Heally teal kit structure + HalloBumil warmth; flat vector illustrations (hijab mother, sage dress, leaves/hearts); floral footer asset; subtle grain texture on plain backgrounds.
- Labels 1–2 words; hero/mascot slots are placeholders until real PNGs land in `app/public/illu/`.

## Layout (moved — don't use old paths)

- `app/` = code (`src/`, `public/`, `.env`, `package.json`). Old `src/` path is dead.
- `docs/` = all product/design docs (was `extra/`). `assets/` = brand files, PDFs, `token.css`, `design-reference/`.
- Env lives at `app/.env` (never `app/src/.env`).

## Commands (run in `app/`)

- `npm run build` = `tsc -b && vite build` — the only verification gate. No tests exist.
- `npm run dev` = vite on **5173**. Keep ONE server; duplicate ports + the PWA service worker serve stale UI.
- Seeing stale UI after an edit? Incognito window, or DevTools → Application → unregister service workers. Never debug CSS before ruling out cache.

## CSS gotcha (bit us repeatedly)

- `app/src/index.css` must NOT contain unlayered `h1`/`h2`/`p` rules — unlayered CSS beats Tailwind utilities, so `text-*` and `mt-*` silently stop working. Use inline `style` for anything a global rule could override.

## Copy rules (locked in `docs/DESIGN.md`)

- EYD Indonesian. No `• — :` in UI text, `dan` not `&`, hours with dot (`19.00`), menu labels 1–2 words.
- Figma a11y audit treats text containing `tab/menu/nav/cta` as a button — never write `menuju`, `Tablet`, etc. in labels.

## Figma workflow (figma-cli lives OUTSIDE repo at `C:\Users\aufar\figma-cli`)

- Run as `node src/index.js <cmd>` from that dir. If commands fail with fetch/connection errors: `daemon start`, then `status` must show the file + daemon running.
- `connect` often LOOKS stuck (no output within 30s) but is actually already connected — abort it and run `status` to confirm instead of waiting/retrying.
- Never pass JSX inline through PowerShell (it splits args). Write JSX to a file, render via a small `.mjs` using `execFileSync('node', [CLI, 'render', jsx])`.
- `roundedTL/TR/BL/BR` props are accepted but silently ignored (upstream bug) — set corner radii afterward via `eval`.
- White small text only on `primary-dark` (`#4A6E54`); text ≥12px; targets ≥44px; audit must be A before coding a screen.
- Images: `create image <url>` needs a public URL and is slow for MBs. For local files, serve `app/public` (`python -m http.server`) and use `http://localhost:<port>/...`. No `file://`.
- Figma variable collection is `SIAGA Bunda` (`primary #7AAE9A`, `primary-dark #4A6E54`); CSS mirror: `assets/token.css`.
- User often hand-edits the canvas: `find`/export before assuming IDs, and never re-render over a frame the user touched — fix it with `eval` instead.

## Data & auth

- Dexie (`app/src/data/db.ts`) is the offline mirror; Supabase Postgres is source of truth; `syncProfile`/`fireOrQueue` push on reconnect. RLS is per `auth.uid()`.
- OTP is demo-first (`otpDummy.ts`, 6-digit code shown in UI); real SMS needs Twilio setup in Supabase Dashboard.
- After finishing a screen/form/rule, append it to `docs/BACKLOG.md` progress so the next session can resume without re-reading everything.
