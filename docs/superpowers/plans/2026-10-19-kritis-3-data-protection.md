# Kritis-3 Data Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encrypt sensitive Dexie values while preserving offline access and make account deletion remove cloud and account-owned local data safely.

**Architecture:** Use a persistent non-extractable Web Crypto key and a Dexie storage boundary that transparently handles encrypted records and safe migration. Add an authenticated Supabase Edge Function that removes private avatar objects and deletes only the caller's Auth user; the client deletes its local account rows only after server success.

**Tech Stack:** React 19, TypeScript, Dexie 4, Web Crypto, Supabase Edge Functions (Deno), PostgreSQL foreign-key cascades.

**Spec:** `docs/superpowers/specs/2026-10-19-kritis-3-data-protection-design.md`

## Global Constraints

- Offline data remains available after logout.
- Do not drop/mask plaintext legacy rows unless encrypted replacement is durably committed.
- Do not clear local rows or sign out when cloud account deletion fails.
- Never accept a user ID to delete from client input; derive it from verified JWT.
- Keep the device key after logout; account deletion removes only that user's records.
- No runtime dependency additions; `fake-indexeddb` is test-only.

## Review Focus

- Existing plaintext rows during upgrade: migration failure retains source data.
- Offline reads after logout: key persistence preserves availability.
- IndexedDB values and indexes: routing/index fields remain usable while sensitive fields are encrypted.
- Cloud storage cleanup failure: account deletion must not falsely report full success.
- Shared device with multiple local profiles: cleanup must not remove other users' rows or queue items.

---

### Task 1: Local encryption and migration

**Files:**
- Modify: `app/src/data/crypto.ts`
- Modify: `app/src/data/db.ts`
- Create: `app/scripts/check-local-crypto.mjs`

**Interfaces:**
- Produce `encryptJson` and `decryptJson` using a persistent device key and versioned ciphertext envelope.
- Preserve Dexie table APIs for all current callers.

- [x] Write assert-based checks for ciphertext at rest, legacy migration, encrypted Blob and queue, cross-user local cleanup, and reopen.
- [x] Run the check and confirm it fails before implementation (initially showed plaintext at rest).
- [x] Implement persistent non-exportable AES-GCM device key and no-plaintext-fallback behavior.
- [x] Add idempotent Dexie migration, preserving the original rows until encrypted replacements commit; remove sensitive indexes and retain owner/query indexes.
- [x] Verify migration failure preserves legacy plaintext when a corrupt ciphertext is present; normal Dexie reads/writes use fake IndexedDB.
- [x] Run the script and `npm run build` from `app/`.

### Task 2: Authenticated cloud deletion

**Files:**
- Create: `supabase/functions/delete-account/index.ts`
- Modify: `app/src/features/profil/ProfilPage.tsx`
- Create: `app/scripts/check-account-delete-policy.mjs`
- Modify: `docs/BACKLOG.md`

**Interfaces:**
- Edge Function accepts authenticated POST with no target user ID and deletes the `profile-avatars` objects under the JWT user's folder before deleting that Auth user through service role.
- Client calls the function, then clears local rows for the active user and signs out only after success.

- [x] Add checks for owner identity derived from JWT and client cleanup guarded on server success.
- [x] Implement function JWT validation using Supabase Auth, storage object listing/removal scoped to `user.id`, and admin deletion of only `user.id`.
- [x] Implement client error handling that preserves local state on function failure, and owner-scoped local cleanup on success.
- [x] Assert deletion never clears other local users' profile/health rows; static checks cover cloud-first ordering.
- [x] Run the policy script, `npm run build`, and `git diff --check`.
- [x] Deploy and exercise the Edge Function against a disposable synthetic account; do not use either retained A/B account.

### Task 3: Cross-account RLS coverage

**Files:**
- Create: `app/scripts/check-rls-ab.mjs`
- Modify: `docs/BACKLOG.md`

**Interfaces:**
- Consume the locally stored `SIAGA_TEST_USER_ID_A/B`, `SIAGA_TEST_EMAIL_A/B`, and `SIAGA_TEST_PASSWORD_A/B` from ignored `supabase/.env`.
- Use user-scoped anon clients for all row operations; service role may only create/inspect/clean synthetic auth accounts, never perform the RLS assertions.

- [x] Assert both dedicated accounts exist and obtain fresh user sessions without printing credentials or JWTs.
- [x] Statically verify every user-owned policy in migrations uses `auth.uid()` against the owner column.
- [x] For every owner table, assert B cannot insert a synthetic row claiming A's owner ID.
- [x] Seed unique synthetic rows only in tables where A has an existing owner-scoped delete grant; assert B cannot read, update, or delete those rows, then clean them as A.
- [x] Test the private avatar bucket path policy with one tiny synthetic image; assert B cannot read/write A's path and remove the object as A.
- [x] Run the script against the configured project and report per-table outcomes; never grant broader delete rights just to make test cleanup possible.
