import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, LogIn, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { db } from "@/data/db"
import { supabase } from "@/data/supabase"

type Props = { onBack: () => void; onSuccess: () => void; onToRegister: () => void }

export default function LoginScreen({ onBack, onSuccess, onToRegister }: Props) {
  const [email, setEmail] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"form" | "otp">("form")
  const [otp, setOtp] = useState("")
  const [otpErr, setOtpErr] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [emailForOtp, setEmailForOtp] = useState("")
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const updateOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1)
    setOtp((current) => {
      const next = current.padEnd(6, " ").split("")
      next[index] = digit
      return next.join("").trimEnd()
    })
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const pasteOtp = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6)
    if (!pasted) return
    event.preventDefault()
    setOtp(pasted)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleRequestOtp = async () => {
    setErr(null)
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErr("Alamat email tidak valid")
      return
    }
    if (!navigator.onLine) {
      const profiles = await db.profiles.toArray()
      const found = profiles.find((p) => p.email?.toLowerCase() === normalizedEmail)
      if (!found) {
        if (profiles.length === 0) setErr("Belum ada akun di ponsel ini. Silakan daftar terlebih dahulu.")
        else setErr("Email tidak ditemukan. Periksa kembali atau daftar akun baru.")
        return
      }
      onSuccess()
      return
    }
    setLoading(true)
    try {
      setEmailForOtp(normalizedEmail)
      const { error } = await supabase.auth.signInWithOtp({ email: normalizedEmail, options: { shouldCreateUser: false } })
      if (error) throw error
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
    setOtpLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailForOtp,
        token: otp.trim(),
        type: "email",
      })
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
        <div className="mx-auto flex h-[128px] w-full max-w-[480px] shrink-0 items-center gap-2.5 rounded-b-[32px] bg-[#4A6E54] px-6 pb-[30px] pt-7">
          <button onClick={() => setStep("form")} aria-label="Kembali" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/95 text-[#DB2777]">
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1 text-white">
            <h1 className="text-lg font-bold leading-normal">Masukkan kode OTP</h1>
            <p className="text-xs leading-normal">Langkah 2 dari 2</p>
          </div>
          <span className="grid size-[52px] shrink-0 place-items-center rounded-[26px] bg-white/95 text-[#DB2777]">
            <Mail className="size-7" />
          </span>
        </div>
        <div className="mx-auto w-full max-w-[480px] flex-1 space-y-3.5 px-6 pb-6 pt-6">
          <p className="text-[13px] leading-normal text-[#33443F]">Kode 6 digit dikirim ke {emailForOtp}.</p>
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 6 }, (_, index) => {
              const digit = otp[index] ?? ""
              const filled = Boolean(digit)
              return (
                <input
                  key={index}
                  ref={(element) => { otpRefs.current[index] = element }}
                  value={digit}
                  onChange={(event) => updateOtpDigit(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !digit && index > 0) otpRefs.current[index - 1]?.focus()
                  }}
                  onPaste={pasteOtp}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${index + 1}`}
                  className={`h-[52px] w-11 rounded-[14px] border text-center text-xl font-bold outline-none transition-colors focus:ring-2 focus:ring-[#4A6E54] ${filled ? "border-[#7AAE9A] bg-[#DFF0EA] text-[#4A6E54]" : "border-[#D9E7E2] bg-white text-[#33443F]"}`}
                />
              )
            })}
          </div>
          {otpErr && <p className="text-center text-xs text-[#E57373]">{otpErr}</p>}
          <p className="text-xs leading-normal text-[#33443F]">Periksa kotak masuk dan folder spam</p>
          <Button onClick={handleVerifyOtp} disabled={otpLoading} className="w-full rounded-full bg-[#4A6E54] px-4 py-5 mt-3 text-base font-bold text-white hover:bg-[#3D5C46]">
            {otpLoading ? "Memeriksa" : "Verifikasi"}
          </Button>
          <button onClick={handleRequestOtp} className="w-full text-center text-sm font-medium leading-normal text-[#33443F]">
            Kirim ulang kode
          </button>
        </div>
        <div className="relative mx-auto mt-auto w-full max-w-[480px]">
          <img src="/illu/illu-11-florist-2.png" alt="" aria-hidden className="pointer-events-none w-full select-none object-cover" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFFCF6] flex flex-col">
      <div className="mx-auto flex w-full max-w-[480px] items-center gap-2.5 rounded-b-[32px] bg-[#4A6E54] px-6 pb-12 pt-[max(1.75rem,env(safe-area-inset-top))]">
        <button onClick={onBack} aria-label="Kembali" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/95 text-[#DB2777]">
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1 text-white">
          <h1 className="text-lg font-bold leading-normal">Login Akun</h1>
          <p className="text-xs leading-normal">Lanjut Pantau Kesehatan Bunda</p>
        </div>
        <span className="grid size-[52px] shrink-0 place-items-center rounded-[26px] bg-white/95 text-[#DB2777]">
          <LogIn className="size-[26px]" />
        </span>
      </div>

      <div className="mx-auto w-full max-w-[480px] px-6 pb-6 pt-6">
        <Card className="rounded-[24px] border-0 bg-[#EAF4F0] shadow-none">
          <CardContent className="space-y-2.5 p-3.5">
            <p className="text-[13px] leading-normal text-[#33443F]">Masukkan e-mail terdaftar</p>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" aria-label="Email" className="h-12 rounded-2xl border-[#D9E7E2] bg-white px-3.5 text-sm mt-2" />

            {err && <p className="text-xs text-[#E57373] text-center">{err}</p>}

            <Button onClick={handleRequestOtp} disabled={loading} className="w-full rounded-full bg-[#4A6E54] px-4 py-4 text-base font-bold text-white hover:bg-[#3D5C46]">
              {loading ? "Mengirim kode" : "Kirim Kode OTP"}
            </Button>

            <button onClick={onToRegister} className="w-full text-center text-sm font-medium leading-normal text-[#33443F]">
              Belum punya akun? <span className="underline underline-offset-2">Daftar di sini</span>
            </button>
          </CardContent>
        </Card>
        <div className="mt-3.5 flex items-center justify-center gap-2 text-[#33443F]">
          <ShieldCheck className="size-[18px] shrink-0 text-[#138A7A]" />
          <p className="text-xs leading-normal">Kode 6 digit dikirim ke email</p>
        </div>
      </div>
      <div className="relative mx-auto mt-auto w-full max-w-[480px]">
        <img src="/illu/illu-11-florist-2.png" alt="" aria-hidden className="pointer-events-none w-full select-none object-cover" />
      </div>
    </div>
  )
}
