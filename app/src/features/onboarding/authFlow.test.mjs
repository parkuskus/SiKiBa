import test from "node:test";
import assert from "node:assert/strict";
import { validatePassword } from "./passwordPolicy.ts";
import { completePasswordReset, hasVerifiedMfaToken, loginWithPassword, maskEmail, verifyMfa } from "./authFlow.ts";

function jwt(claims) {
  const encoded = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `header.${encoded}.signature`;
}

test("password policy requires at least eight characters", () => {
  assert.equal(validatePassword("Abc123!", "Abc123!"), "Sandi minimal 8 karakter");
  assert.equal(validatePassword("Abc12345", "Abc12345"), null);
});

test("password policy requires matching confirmation", () => {
  assert.equal(validatePassword("Abc12345", "Abc12346"), "Konfirmasi sandi tidak sama");
});

test("wrong password returns one generic error and does not start OTP", async () => {
  let otpStarted = false;
  const auth = { signInWithPassword: async () => ({ error: new Error("email not found") }) };
  await assert.rejects(loginWithPassword(auth, async () => { otpStarted = true; return {}; }, "nobody@example.id", "bad"), {
    message: "Email atau sandi tidak cocok",
  });
  assert.equal(otpStarted, false);
});

test("OTP send failure revokes the temporary password session", async () => {
  let signedOut = false;
  const auth = {
    signInWithPassword: async () => ({ error: null }),
    signOut: async () => { signedOut = true; },
  };
  await assert.rejects(loginWithPassword(auth, async () => ({ error: new Error("Resend internal error") }), "bunda@example.id", "secret"), {
    message: "Kode verifikasi belum dapat dikirim. Coba lagi.",
  });
  assert.equal(signedOut, true);
});

test("wrong or expired OTP does not refresh the session", async () => {
  let refreshed = false;
  const auth = { refreshSession: async () => { refreshed = true; return {}; }, signOut: async () => ({}) };
  await assert.rejects(verifyMfa(auth, async () => ({ error: new Error("expired") }), "000000"), /Kode salah atau kedaluwarsa/);
  assert.equal(refreshed, false);
});

test("successful OTP refresh requires a server-signed MFA claim", async () => {
  let refreshed = false;
  const auth = {
    refreshSession: async () => { refreshed = true; return { data: { session: { access_token: jwt({ app_mfa_verified: true }) } }, error: null }; },
    signOut: async () => ({ error: null }),
  };
  const session = await verifyMfa(auth, async (code) => ({ error: code === "246810" ? null : new Error("bad") }), "246810");
  assert.equal(refreshed, true);
  assert.equal(hasVerifiedMfaToken(session.access_token), true);
});

test("a refresh without the MFA claim is rejected and signed out", async () => {
  let signedOut = false;
  const auth = {
    refreshSession: async () => ({ data: { session: { access_token: jwt({ sub: "user" }) } }, error: null }),
    signOut: async () => { signedOut = true; return { error: null }; },
  };
  await assert.rejects(verifyMfa(auth, async () => ({ error: null }), "246810"), /Sesi belum terverifikasi/);
  assert.equal(signedOut, true);
});

test("MFA claim parser fails closed on malformed tokens and string claims", () => {
  assert.equal(hasVerifiedMfaToken("bad-token"), false);
  assert.equal(hasVerifiedMfaToken(jwt({ app_mfa_verified: "true" })), false);
});

test("OTP screen masks all but the first email character", () => {
  assert.equal(maskEmail("bunda@example.id"), "b***@example.id");
});

test("password reset validates the new password, updates Auth, and clears its session", async () => {
  const calls = [];
  const auth = {
    updateUser: async (attributes) => { calls.push(["update", attributes]); return { error: null }; },
    signOut: async (options) => { calls.push(["signOut", options]); return { error: null }; },
  };
  await completePasswordReset(auth, "NewPass123", "NewPass123");
  assert.deepEqual(calls, [["update", { password: "NewPass123" }], ["signOut", { scope: "local" }]]);
});

test("password reset rejects mismatch without updating Auth", async () => {
  let updated = false;
  const auth = { updateUser: async () => { updated = true; return { error: null }; }, signOut: async () => ({ error: null }) };
  await assert.rejects(completePasswordReset(auth, "NewPass123", "OtherPass"), /Konfirmasi sandi tidak sama/);
  assert.equal(updated, false);
});
