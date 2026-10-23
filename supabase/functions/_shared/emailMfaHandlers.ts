import { generateOtp, hashOtp } from "./emailMfa.ts";

export type MfaIdentity = { userId: string; email: string; sessionId: string; passwordAuthenticated: boolean };
export type MfaDependencies = {
  authenticate: (token: string) => Promise<MfaIdentity | null>;
  startChallenge: (userId: string, sessionId: string, digest: string) => Promise<string>;
  verifyChallenge: (userId: string, sessionId: string, digest: string) => Promise<string>;
  revokeSession: (userId: string, sessionId: string) => Promise<void>;
  removeChallenge: (userId: string, sessionId: string) => Promise<void>;
  sendEmail: (email: string, code: string) => Promise<void>;
  secret: string;
  crypto?: Crypto;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

async function identity(request: Request, deps: MfaDependencies): Promise<MfaIdentity | null> {
  const authorization = request.headers.get("Authorization");
  const match = authorization?.match(/^Bearer\s+([^\s]+)$/i);
  if (!match) return null;
  try {
    const result = await deps.authenticate(match[1]);
    return result?.userId && result.email && result.sessionId ? result : null;
  } catch {
    return null;
  }
}

function methodResponse(request: Request): Response | null {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
  return null;
}

export function createMfaHandlers(deps: MfaDependencies) {
  const cryptoApi = deps.crypto ?? crypto;

  async function start(request: Request): Promise<Response> {
    const methodError = methodResponse(request);
    if (methodError) return methodError;
    if (deps.secret.length < 32) return json(503, { error: "mfa_unavailable" });
    const caller = await identity(request, deps);
    if (!caller) return json(401, { error: "unauthorized" });
    if (!caller.passwordAuthenticated) return json(403, { error: "password_required" });

    const code = generateOtp(cryptoApi);
    const digest = await hashOtp(code, deps.secret, cryptoApi);
    try {
      const status = await deps.startChallenge(caller.userId, caller.sessionId, digest);
      if (status !== "sent") {
        return status === "locked"
          ? json(429, { error: "temporarily_locked" })
          : status === "cooldown"
            ? json(429, { error: "resend_cooldown" })
            : json(401, { error: "unauthorized" });
      }
    } catch {
      return json(503, { error: "mfa_unavailable" });
    }

    try {
      await deps.sendEmail(caller.email, code);
      return json(202, { sent: true });
    } catch {
      try { await deps.removeChallenge(caller.userId, caller.sessionId); } catch { /* Retry/authentication remains fail-closed. */ }
      return json(502, { error: "email_delivery_failed" });
    }
  }

  async function verify(request: Request): Promise<Response> {
    const methodError = methodResponse(request);
    if (methodError) return methodError;
    if (deps.secret.length < 32) return json(503, { error: "mfa_unavailable" });
    const caller = await identity(request, deps);
    if (!caller) return json(401, { error: "unauthorized" });
    if (!caller.passwordAuthenticated) return json(403, { error: "password_required" });
    let body: unknown;
    try { body = await request.json(); } catch { return json(400, { error: "invalid_request" }); }
    const code = body && typeof body === "object" ? (body as { code?: unknown }).code : null;
    if (typeof code !== "string" || !/^\d{6}$/.test(code)) return json(400, { error: "invalid_code" });

    try {
      const status = await deps.verifyChallenge(caller.userId, caller.sessionId, await hashOtp(code, deps.secret, cryptoApi));
      if (status === "verified") return json(200, { verified: true });
      if (status === "expired") return json(410, { error: "code_expired" });
      if (status === "locked") return json(429, { error: "temporarily_locked" });
      if (status === "used") return json(409, { error: "code_already_used" });
      return json(400, { error: "invalid_code" });
    } catch {
      return json(503, { error: "mfa_unavailable" });
    }
  }

  async function revoke(request: Request): Promise<Response> {
    const methodError = methodResponse(request);
    if (methodError) return methodError;
    const caller = await identity(request, deps);
    if (!caller) return json(401, { error: "unauthorized" });
    try {
      await deps.revokeSession(caller.userId, caller.sessionId);
      return json(200, { revoked: true });
    } catch {
      return json(503, { error: "mfa_unavailable" });
    }
  }

  return { start, verify, revoke };
}
