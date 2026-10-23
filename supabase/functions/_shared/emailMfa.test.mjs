import test from "node:test";
import assert from "node:assert/strict";
import {
  generateOtp,
  hasMfaClaim,
  hashOtp,
  maskEmail,
} from "./emailMfa.ts";

test("generates a zero-padded six-digit OTP", () => {
  const code = generateOtp({ getRandomValues: (value) => { value[0] = 42; return value; } });
  assert.match(code, /^\d{6}$/);
  assert.equal(code, "000042");
});

test("HMAC digests are secret-bound and do not equal the OTP", async () => {
  const digest = await hashOtp("246810", "test-secret");
  assert.notEqual(digest, "246810");
  assert.equal(await hashOtp("246810", "other-secret") === digest, false);
});

test("hashOtp rejects codes that are not six digits", async () => {
  await assert.rejects(hashOtp("12x456", "test-secret"), /six digits/);
});

test("email masking preserves only the first local-part character", () => {
  assert.equal(maskEmail("bunda@example.id"), "b***@example.id");
});

test("MFA claim is granted only by the boolean true value", () => {
  assert.equal(hasMfaClaim({ app_mfa_verified: true }), true);
  assert.equal(hasMfaClaim({ app_mfa_verified: "true" }), false);
  assert.equal(hasMfaClaim({}), false);
});
