import test from "node:test";
import assert from "node:assert/strict";
import { createMfaHandlers } from "./emailMfaHandlers.ts";
import { hashOtp } from "./emailMfa.ts";

const identity = { userId: "user-a", email: "bunda@example.id", sessionId: "session-a", passwordAuthenticated: true };
const request = (path, { token = "valid", body, method = "POST" } = {}) => new Request(`http://local/${path}`, {
  method,
  headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

function dependencies(overrides = {}) {
  return {
    authenticate: async () => identity,
    startChallenge: async () => "sent",
    verifyChallenge: async () => "verified",
    revokeSession: async () => {},
    removeChallenge: async () => {},
    sendEmail: async () => {},
    secret: "0123456789abcdef0123456789abcdef",
    crypto: globalThis.crypto,
    ...overrides,
  };
}

test("rejects missing bearer token before touching MFA state", async () => {
  let started = false;
  const handlers = createMfaHandlers(dependencies({ startChallenge: async () => { started = true; return "sent"; } }));
  const response = await handlers.start(request("mfa-start", { token: null }));
  assert.equal(response.status, 401);
  assert.equal(started, false);
});

test("recovery and OTP-only sessions cannot start or verify MFA", async (t) => {
  for (const action of ["start", "verify"]) {
    await t.test(action, async () => {
      let touched = false;
      const handlers = createMfaHandlers(dependencies({
        authenticate: async () => ({ ...identity, passwordAuthenticated: false }),
        startChallenge: async () => { touched = true; return "sent"; },
        verifyChallenge: async () => { touched = true; return "verified"; },
      }));
      const response = await handlers[action](request(`mfa-${action}`, { body: { code: "246810" } }));
      assert.equal(response.status, 403);
      assert.equal(touched, false);
    });
  }
});

test("start sends OTP by email but persists only its keyed digest", async () => {
  let savedDigest;
  let sentCode;
  const handlers = createMfaHandlers(dependencies({
    startChallenge: async (_userId, _sessionId, digest) => { savedDigest = digest; return "sent"; },
    sendEmail: async (_email, code) => { sentCode = code; },
  }));
  const response = await handlers.start(request("mfa-start"));
  assert.equal(response.status, 202);
  assert.match(sentCode, /^\d{6}$/);
  assert.equal(savedDigest, await hashOtp(sentCode, "0123456789abcdef0123456789abcdef"));
  assert.notEqual(savedDigest, sentCode);
});

test("start honors server cooldown without sending another code", async () => {
  let sent = false;
  const handlers = createMfaHandlers(dependencies({ startChallenge: async () => "cooldown", sendEmail: async () => { sent = true; } }));
  const response = await handlers.start(request("mfa-start"));
  assert.equal(response.status, 429);
  assert.equal(sent, false);
});

test("start refuses an absent or weak HMAC secret", async () => {
  let sent = false;
  const handlers = createMfaHandlers(dependencies({ secret: "short", sendEmail: async () => { sent = true; } }));
  const response = await handlers.start(request("mfa-start"));
  assert.equal(response.status, 503);
  assert.equal(sent, false);
});

test("email failure removes the unsent challenge and returns a generic error", async () => {
  let removed = false;
  const handlers = createMfaHandlers(dependencies({
    sendEmail: async () => { throw new Error("provider secret detail"); },
    removeChallenge: async () => { removed = true; },
  }));
  const response = await handlers.start(request("mfa-start"));
  assert.equal(response.status, 502);
  assert.equal(removed, true);
  assert.deepEqual(await response.json(), { error: "email_delivery_failed" });
});

test("verification rejects malformed codes without calling the repository", async () => {
  let verified = false;
  const handlers = createMfaHandlers(dependencies({ verifyChallenge: async () => { verified = true; return "verified"; } }));
  const response = await handlers.verify(request("mfa-verify", { body: { code: "12x456" } }));
  assert.equal(response.status, 400);
  assert.equal(verified, false);
});

test("verification passes only the keyed digest and succeeds once", async () => {
  let received;
  const handlers = createMfaHandlers(dependencies({ verifyChallenge: async (...args) => { received = args; return "verified"; } }));
  const response = await handlers.verify(request("mfa-verify", { body: { code: "246810" } }));
  assert.equal(response.status, 200);
  assert.deepEqual(received, [identity.userId, identity.sessionId, await hashOtp("246810", "0123456789abcdef0123456789abcdef")]);
  assert.deepEqual(await response.json(), { verified: true });
});

test("expired, locked, and replayed OTPs cannot enable a session", async (t) => {
  for (const [status, expected] of [["expired", 410], ["locked", 429], ["used", 409]]) {
    await t.test(status, async () => {
      const handlers = createMfaHandlers(dependencies({ verifyChallenge: async () => status }));
      const response = await handlers.verify(request("mfa-verify", { body: { code: "246810" } }));
      assert.equal(response.status, expected);
    });
  }
});

test("revoke only clears the authenticated caller's session", async () => {
  let revoked;
  const handlers = createMfaHandlers(dependencies({ revokeSession: async (...args) => { revoked = args; } }));
  const response = await handlers.revoke(request("mfa-revoke"));
  assert.equal(response.status, 200);
  assert.deepEqual(revoked, [identity.userId, identity.sessionId]);
});
