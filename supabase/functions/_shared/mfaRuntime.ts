import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import type { MfaDependencies } from "./emailMfaHandlers.ts";

export function createMfaDependencies(): MfaDependencies {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  return {
    secret: Deno.env.get("MFA_OTP_HMAC_SECRET") ?? "",
    authenticate: async (token) => {
      const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: { user }, error } = await auth.auth.getUser(token);
      if (error || !user?.email) return null;
      const encodedClaims = token.split(".")[1];
      if (!encodedClaims) return null;
      const normalized = encodedClaims.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
      if (payload.sub !== user.id || typeof payload.session_id !== "string") return null;
      const methods = Array.isArray(payload.amr)
        ? payload.amr.map((entry: unknown) => typeof entry === "string" ? entry : entry && typeof entry === "object" ? (entry as { method?: unknown }).method : null)
        : [];
      return {
        userId: user.id,
        email: user.email,
        sessionId: payload.session_id,
        passwordAuthenticated: methods.includes("password"),
      };
    },
    startChallenge: async (userId, sessionId, digest) => {
      const { data, error } = await admin.rpc("start_email_mfa_challenge", {
        p_user_id: userId, p_session_id: sessionId, p_digest: digest,
      });
      if (error) throw error;
      return data;
    },
    verifyChallenge: async (userId, sessionId, digest) => {
      const { data, error } = await admin.rpc("verify_email_mfa_challenge", {
        p_user_id: userId, p_session_id: sessionId, p_digest: digest,
      });
      if (error) throw error;
      return data;
    },
    revokeSession: async (userId, sessionId) => {
      const { error } = await admin.rpc("revoke_email_mfa_session", { p_user_id: userId, p_session_id: sessionId });
      if (error) throw error;
    },
    removeChallenge: async (userId, sessionId) => {
      const { error } = await admin.rpc("clear_email_mfa_challenge", { p_user_id: userId, p_session_id: sessionId });
      if (error) throw error;
    },
    sendEmail: async (email, code) => {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      const from = Deno.env.get("RESEND_FROM_EMAIL");
      if (!resendKey || !from) throw new Error("email provider unavailable");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [email],
          subject: "Kode masuk SIAGA Bunda",
          text: `Kode verifikasi SIAGA Bunda: ${code}. Kode berlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun.`,
        }),
      });
      if (!response.ok) throw new Error("email delivery failed");
    },
  };
}
