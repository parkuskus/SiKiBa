# Kritis-3 Data Protection Design

## Intent

Mitigate the remaining local-storage and account-deletion findings while preserving the user's explicit requirement that health data remain available offline, including after logout.

## Decisions

- Keep a device-persistent, non-extractable Web Crypto key in IndexedDB. Encrypt sensitive local values at rest and transparently decrypt them for app use. The key remains after logout so offline access continues.
- This is protection against casual/direct database inspection, not malicious same-origin JavaScript, a compromised browser, or a device already unlocked.
- Migrate existing plaintext rows without deleting them until their encrypted replacements are committed. If migration/encryption fails, fail closed for affected writes and preserve readable legacy records; do not silently replace values with empty data.
- Delete cloud account data only through an authenticated Supabase Edge Function. It removes the user's private avatar objects and invokes Auth admin deletion, relying on owner foreign-key cascades for relational data. The client clears only that user's local rows after server success; failure must preserve local data and session.
- The account remains available after ordinary logout. Account deletion is permanent and requires the existing two confirmations.

## Non-goals and limits

- No passcode prompt or key derived from OTP/password; that would prevent seamless offline access after logout.
- No protection against same-origin script compromise, browser profile compromise, or a device-level attacker with the app unlocked.
- No production-account testing or destructive cloud test without the dedicated test accounts already discussed.

## Components

- Dexie crypto/storage boundary and migration for profile and health-related records.
- Supabase `delete-account` Edge Function and the client deletion flow.
- Tests for encryption roundtrip, legacy migration/failure safety, owner-scoped local cleanup, and server-side owner identity.

## Acceptance

- Existing and new local records remain readable offline after logout, but sensitive stored values are ciphertext after migration.
- A failed migration or failed cloud deletion does not discard source data.
- Cloud deletion derives the target exclusively from the caller's verified JWT, removes avatar objects, and lets auth/profile cascades remove related account records.
- Successful deletion clears only the deleting user's local rows and then signs out/reloads.
