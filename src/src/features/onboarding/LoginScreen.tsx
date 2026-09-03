import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/data/db"
import { supabase } from "@/data/supabase"

type Props = { onBack: () => void; onSuccess: () => void; onToRegister: () => void }

function toE164(noHp: string): string {
  const clean = noHp.replace(/[^0-9]/g, "")
  if (clean.startsWith("0")) return `+62${clean.slice(1)}`
  if (clean.startsWith("62")) return `+${clean}`
  if (clean.startsWith("+62")) return clean
  return `+62${clean}`
}

export default function LoginScreen({ onBack, onSuccess, onToRegister }: Props) {
  const [noHp, setNoHp] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"form" | "otp">("form")
  const [otp, setOtp] = useState("")
  const [otpErr, setOtpErr] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [phoneForOtp, setPhoneForOtp] = useState("")
  const [demoCode, setDemoCode] = useState<string | null>(null)

  const handleRequestOtp = async () => {
    setErr(null)
    if (!noHp.trim()) {
      setErr("Nomor HP wajib diisi")
      return
    }
    if (!navigator.onLine) {
      const clean = noHp.replace(/[^0-9]/g, "")
      const profiles = await db.profiles.toArray()
      const found = profiles.find((p) => p.noHp === clean)
      if (!found) {
        if (profiles.length === 0) setErr("Belum ada akun di ponsel ini. Silakan daftar terlebih dahulu.")
        else setErr("Nomor tidak ditemukan. Periksa kembali nomor HP atau daftar akun baru.")
        return
      }
      onSuccess()
      return
    }
    setLoading(true)
    try {
      const e164 = toE164(noHp)
      setPhoneForOtp(e164)
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setDemoCode(code)
      console.log("[demo OTP login]", code, "untuk", e164)
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
        if (error) {
          const email = `${noHp.replace(/[^0-9]/g, "")}@siagabunda.test`
          setPhoneForOtp(email)
          await supabase.auth.signInWithOtp({ email })
        }
      } catch {
        // abaikan, demo tetap jalan
      }
      setStep("otp")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengirim kode OTP"
      setErr(msg.includes("rate limit") ? "Terlalu sering minta kode. Coba lagi beberapa saat." : msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setOtpErr(null)
    if (otp.trim().length < 6) {
      setOtpErr("Kode 6 digit wajib diisi")
      return
    }
    if (demoCode && otp.trim() === demoCode) {
      // demo: cek lokal saja
      const clean = noHp.replace(/[^0-9]/g, "")
      const profiles = await db.profiles.toArray()
      const found = profiles.find((p) => p.noHp === clean)
      if (!found && profiles.length > 0) {
        setOtpErr("Nomor tidak terdaftar di ponsel ini")
        return
      }
      if (profiles.length === 0) {
        // untuk demo login tanpa daftar, izinkan masuk
      }
      onSuccess()
      return
    }
    setOtpLoading(true)
    try {
      const isEmail = phoneForOtp.includes("@")
      const { error } = await supabase.auth.verifyOtp({
        phone: isEmail ? undefined : (phoneForOtp as string),
        email: isEmail ? (phoneForOtp as string) : undefined,
        token: otp.trim(),
        type: isEmail ? "email" : "sms",
      } as never)
      if (error) throw error
      onSuccess()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kode salah atau kadaluarsa"
      setOtpErr(msg)
    } finally {
      setOtpLoading(false)
    }
  }

  if (step === "otp") {
    return (
      <div className="min-h-[100dvh] bg-[#FFFCF6] flex flex-col">
        <div className="mx-auto w-full max-w-[480px] flex-1 px-4 pb-6 pt-4">
          <button onClick={() => setStep("form")} className="size-9 rounded-full bg-white ring-1 ring-[#EAE6E0] grid place-items-center text-[#7AAE9A]">
            <ChevronRight className="size-4 rotate-180" />
          </button>
          <h1 className="mt-4 font-[Poppins] text-[20px] font-semibold text-[#1E2326] leading-tight">Masukkan kode OTP</h1>
          <p className="mt-1 text-sm text-[#8A8F93] leading-relaxed">Kode 6 digit dikirim ke {phoneForOtp.includes("@") ? "email" : "WhatsApp"} {phoneForOtp}.</p>
          {demoCode && (
            <div className="mt-3 rounded-2xl bg-[#FFF8EC] px-3 py-2.5 ring-1 ring-[#F5C16C]/20 text-center">
              <p className="text-xs font-medium text-[#8A6D00]">Kode demo untuk percobaan</p>
              <p className="font-mono text-lg font-bold tracking-[0.3em] text-[#1E2326]">{demoCode}</p>
              <p className="text-[11px] text-[#8A8F93]">Gunakan kode ini untuk verifikasi tanpa SMS</p>
            </div>
          )}
          <Card className="mt-4 rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Kode OTP</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="123456" className="rounded-xl bg-[#FFFCF6] tracking-[0.3em] text-center text-lg" inputMode="numeric" />
                {otpErr && <p className="text-xs text-[#E57373] text-center">{otpErr}</p>}
              </div>
              <Button onClick={handleVerifyOtp} disabled={otpLoading} className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] py-3.5 text-sm font-semibold">
                {otpLoading ? "Memeriksa" : "Verifikasi"}
              </Button>
              <button onClick={handleRequestOtp} className="w-full text-center text-sm font-medium text-[#7AAE9A] underline underline-offset-4 decoration-[#7AAE9A]/30">
                Kirim ulang kode
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFFCF6] flex flex-col">
      <div className="mx-auto w-full max-w-[480px] flex-1 px-4 pb-6 pt-4">
        <button onClick={onBack} className="size-9 rounded-full bg-white ring-1 ring-[#EAE6E0] grid place-items-center text-[#7AAE9A]">
          <ChevronRight className="size-4 rotate-180" />
        </button>

        <h1 className="mt-4 font-[Poppins] text-[20px] font-semibold text-[#1E2326] leading-tight">Masuk Akun</h1>
        <p className="mt-1 text-sm text-[#8A8F93] leading-relaxed">Masukkan nomor HP yang dipakai saat daftar. Kode OTP akan dikirim untuk verifikasi.</p>

        <Card className="mt-4 rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nomor HP</Label>
              <Input value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="08xxxxxxxxxx" className="rounded-xl bg-[#FFFCF6]" />
            </div>

            {err && <p className="text-xs text-[#E57373] text-center">{err}</p>}

            <Button onClick={handleRequestOtp} disabled={loading} className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] py-3.5 text-sm font-semibold">
              {loading ? "Mengirim kode" : "Kirim kode OTP"}
            </Button>

            <button onClick={onToRegister} className="w-full text-center text-sm font-medium text-[#7AAE9A] underline underline-offset-4 decoration-[#7AAE9A]/30">
              Belum punya akun? Daftar di sini
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
