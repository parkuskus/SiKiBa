import { validatePassword } from "./passwordPolicy.ts";

type AuthResult = { error: unknown | null };

type AuthClient = {
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<AuthResult>;
  refreshSession: () => Promise<{ data?: { session?: { access_token?: string } | null }; error: unknown | null }>;
  signOut: (options: { scope: "local" }) => Promise<AuthResult>;
};

export async function loginWithPassword(
  auth: AuthClient,
  startMfa: () => Promise<AuthResult>,
  email: string,
  password: string,
): Promise<void> {
  const { error } = await auth.signInWithPassword({ email, password });
  if (error) throw new Error("Email atau sandi tidak cocok");
  try {
    const result = await startMfa();
    if (result.error) throw result.error;
  } catch {
    try { await auth.signOut({ scope: "local" }); } catch { /* Never keep an unverified local session after OTP delivery fails. */ }
    throw new Error("Kode verifikasi belum dapat dikirim. Coba lagi.");
  }
}

export function hasVerifiedMfaToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return false;
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="))) as Record<string, unknown>;
    return payload.app_mfa_verified === true;
  } catch {
    return false;
  }
}

export function maskEmail(email: string): string {
  const [local, domain] = email.trim().split("@");
  if (!local || !domain) return "alamat email";
  return `${local[0]}***@${domain}`;
}

export async function verifyMfa(
  auth: Pick<AuthClient, "refreshSession" | "signOut">,
  verifyCode: (code: string) => Promise<AuthResult>,
  code: string,
): Promise<{ access_token: string }> {
  const { error: verifyError } = await verifyCode(code);
  if (verifyError) throw new Error("Kode salah atau kedaluwarsa");

  const { data, error } = await auth.refreshSession();
  const token = data?.session?.access_token;
  if (error || !token || !hasVerifiedMfaToken(token)) {
    try { await auth.signOut({ scope: "local" }); } catch { /* A session without the server claim remains denied by RLS. */ }
    throw new Error("Sesi belum terverifikasi. Silakan masuk kembali.");
  }
  return { access_token: token };
}

export async function completePasswordReset(
  auth: {
    updateUser: (attributes: { password: string }) => Promise<AuthResult>;
    signOut: (options: { scope: "local" }) => Promise<AuthResult>;
  },
  password: string,
  confirmation: string,
): Promise<void> {
  const validationError = validatePassword(password, confirmation);
  if (validationError) throw new Error(validationError);
  const { error } = await auth.updateUser({ password });
  if (error) throw new Error("Gagal memperbarui sandi. Coba lagi.");
  await auth.signOut({ scope: "local" });
}
