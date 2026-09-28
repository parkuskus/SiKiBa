// ponytail: OTP dummy untuk demo/UAT tanpa SMS beneran.
// Ganti ke Supabase Auth SMS real saat Twilio sudah disetup (Auth -> Providers -> Phone).
export function toE164(noHp: string): string {
  const clean = noHp.replace(/[^0-9]/g, "")
  if (clean.startsWith("0")) return `+62${clean.slice(1)}`
  if (clean.startsWith("62")) return `+${clean}`
  return `+62${clean}`
}

export function dummyEmail(noHp: string): string {
  return `${noHp.replace(/[^0-9]/g, "")}@siagabunda.test`
}

export function makeDummyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
