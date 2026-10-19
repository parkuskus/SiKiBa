# Medium Priorities Implementation Plan

> **For agentic workers:** Implement inline, task by task. Steps use checkbox syntax.

**Goal:** Address the implementable parts of Medium 1–3 from the media evaluation without losing queued health data, inventing clinical content, or claiming unperformed device QA.

**Architecture:** Add a small app-shell notice backed by the account-scoped Dexie sync queue; keep queue failures for user-visible retry. Audit existing UI and fix only measurable accessibility/performance issues. Add result-to-education navigation only for topics already present in the app.

**Tech Stack:** React 19, TypeScript, Dexie, Supabase JS, Vite, existing Tailwind tokens and Lucide icons.

**Spec:** `docs/EVALUASI_AHLI_MEDIA_DEASY_2026-10-18.md` (Medium 1–3, rows 33–35).

## Global Constraints

- Preserve the existing SIAGA Bunda visual system and Indonesian EYD copy.
- Keep offline screening writes local and never silently discard their sync queue.
- Do not invent clinical claims or new educational material.
- Maintain accessible labels, focus, keyboard use, and 44px minimum targets.
- `npm run build` is the verification gate; no component-test framework is installed.

## Review Focus

- Queue records from another signed-in account must not appear in this account's status or be deleted on retry.
- Failed/authorization-blocked sync remains available locally and is not presented as cloud-saved.
- An education link only appears where matching material exists; postpartum users must not be sent into pregnancy-only screening actions.
- Retry/status controls remain usable by keyboard and narrow viewport layouts.
- Offline state and zero-pending state must not make unsupported persistence claims.

---

### Task 1: Understandable sync state and safe retry

**Files:** `app/src/data/sync.ts`, new `app/src/features/sync/SyncStatusNotice.tsx`, `app/src/App.tsx`, `app/src/features/profil/StorageSettingScreen.tsx`, and a focused `app/scripts/check-sync-copy.mjs`.

- [ ] Test first: verify authorization failure in `flushSyncQueue` retains its queue item and UI copy differentiates offline, pending, and failed retry states.
- [ ] Run the check and observe failure against current queue deletion behavior.
- [ ] Preserve blocked queue items, expose an account-scoped pending count/retry action, and explain local-vs-cloud state in plain Indonesian.
- [ ] Run focused checks and build.

### Task 2: Medium-2 measured quality pass

**Files:** report and any specific audited screen only; no broad redesign.

- [ ] Audit login, screening form/result, history, and storage/education flows for keyboard access, labels/errors, 44px targets, contrast, reduced motion, responsive overflow, and obvious render/performance defects.
- [ ] Add a failing focused check before each code fix; fix only verified implementation findings.
- [ ] Record what cannot be verified without a browser/device/screen reader; run build and detector once at the end.

### Task 3: Connect existing KIE topics to results

**Files:** `app/src/App.tsx`, `app/src/features/edukasi/EdukasiPage.tsx`, `app/src/features/skrining/SkriningPage.tsx`, `app/src/features/skrining/components/SkriningResultScreen.tsx`, and a focused mapping check.

- [ ] Test first: existing matching topic mappings are exact and unsupported types produce no link.
- [ ] Add a result action that opens only a directly relevant existing topic and returns to that topic from the education detail screen.
- [ ] Do not write new health guidance. Run focused check and build.

### Completion notes

- [x] Update `docs/BACKLOG.md` and this evaluation report with implemented work, blockers, and device/clinical validation still outstanding.
