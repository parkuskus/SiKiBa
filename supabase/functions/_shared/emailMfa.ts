type CryptoRandom = Pick<Crypto, "getRandomValues">;

export function generateOtp(random: CryptoRandom = crypto): string {
  const value = random.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(value).padStart(6, "0");
}

export async function hashOtp(code: string, secret: string, cryptoApi: Crypto = crypto): Promise<string> {
  if (!/^\d{6}$/.test(code)) throw new Error("OTP must be six digits");
  const key = await cryptoApi.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await cryptoApi.subtle.sign("HMAC", key, new TextEncoder().encode(code));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function maskEmail(email: string): string {
  const [local, domain] = email.trim().split("@");
  if (!local || !domain) return "alamat email";
  return `${local[0]}***@${domain}`;
}

export function hasMfaClaim(claims: Record<string, unknown> | null | undefined): boolean {
  return claims?.app_mfa_verified === true;
}
