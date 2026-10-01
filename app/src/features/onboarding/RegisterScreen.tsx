import { useRef, useState } from "react"
import { ChevronRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitRegister, formatGPA } from "@/features/onboarding/registerForm"
import { toE164, dummyEmail, makeDummyCode } from "@/features/onboarding/otpDummy"
import { supabase } from "@/data/supabase"
import { db } from "@/data/db"
import { syncProfile } from "@/data/sync"

type Props = { onBack: () => void; onSuccess: () => void; onToLogin: () => void }

export default function RegisterScreen({ onBack, onSuccess, onToLogin }: Props) {
  const [form, setForm] = useState({
    nama: "",
    tanggalLahir: "",
    noHp: "",
    gravida: 1,
    para: 0,
    abortus: 0,
    hpht: "",
    fasyankes: "",
    namaBidan: "",
  })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [globalErr, setGlobalErr] = useState<string | null>(null)
  const [step, setStep] = useState<"form" | "otp">("form")
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const boxRefs = useRef<(HTMLInputElement | null)[]>([])
  const otpValue = digits.join("")
  const setDigit = (i: number, v: string) => {
    const d = v.replace(/[^0-9]/g, "").slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[i] = d
      return next
    })
    if (d && i < 5) boxRefs.current[i + 1]?.focus()
  }
  const handleBoxKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) boxRefs.current[i - 1]?.focus()
  }
  const handleBoxPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6)
    if (!t) return
    e.preventDefault()
    setDigits(t.padEnd(6, " ").split(""))
    boxRefs.current[Math.min(t.length, 5)]?.focus()
  }
  const [otpErr, setOtpErr] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [phoneForOtp, setPhoneForOtp] = useState("")
  const [demoCode, setDemoCode] = useState<string | null>(null)

  const set = (k: string, v: string | number) => setForm((s) => ({ ...s, [k]: v }))

  const handleRequestOtp = async () => {
    setGlobalErr(null)
    setErrs({})
    // validasi dulu via submitRegister logic tanpa simpan
    const tempErrs: Record<string, string> = {}
    if (!form.nama.trim()) tempErrs.nama = "Nama wajib"
    if (!form.tanggalLahir) tempErrs.tanggalLahir = "Tanggal lahir wajib"
    if (!/^08\d{8,11}$/.test(form.noHp.replace(/[^0-9]/g, ""))) tempErrs.noHp = "No HP tidak valid (08...)"
    if (!form.hpht) tempErrs.hpht = "HPHT wajib"
    if (!form.fasyankes.trim()) tempErrs.fasyankes = "Fasyankes wajib"
    if (!form.namaBidan.trim()) tempErrs.namaBidan = "Nama bidan wajib"
    if (Object.keys(tempErrs).length) {
      setErrs(tempErrs)
      return
    }
    if (!navigator.onLine) {
      // offline fallback langsung simpan lokal
      setLoading(true)
      try {
        const res = await submitRegister({
          nama: form.nama,
          tanggalLahir: form.tanggalLahir,
          noHp: form.noHp,
          gravida: Number(form.gravida),
          para: Number(form.para),
          abortus: Number(form.abortus),
          hpht: form.hpht,
          fasyankes: form.fasyankes,
          namaBidan: form.namaBidan,
        })
        console.log("[register offline] UK", res.uk, "HPL", res.hpl)
        onSuccess()
      } catch (e: unknown) {
        const err = e as { errs?: Record<string, string>; message?: string }
        if (err.errs) setErrs(err.errs)
        else setGlobalErr(err.message ?? "Gagal menyimpan")
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      const e164 = toE164(form.noHp)
      setPhoneForOtp(e164)
      // demo: generate kode sintetis agar bisa dicoba tanpa SMS/email beneran
      const code = makeDummyCode()
      setDemoCode(code)
      console.log("[demo OTP]", code, "untuk", e164)
      // coba phone OTP, kalau gagal fallback ke email sintetis — tapi demo tetap jalan
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
        if (error) {
          const email = dummyEmail(form.noHp)
          setPhoneForOtp(email)
          await supabase.auth.signInWithOtp({ email })
        }
      } catch {
        // abaikan, demo code tetap bisa dipakai
      }
      setStep("otp")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengirim kode OTP"
      setGlobalErr(msg.includes("rate limit") ? "Terlalu sering minta kode. Coba lagi beberapa saat." : msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setOtpErr(null)
    if (otpValue.trim().length < 6) {
      setOtpErr("Kode 6 digit wajib diisi")
      return
    }
    // demo didahulukan — biar bisa dicoba tanpa SMS beneran (online maupun offline)
    if (demoCode && otpValue.trim() === demoCode) {
      const demoUserId = `demo-${form.noHp.replace(/[^0-9]/g, "")}`
      const tmp = await submitRegister({
        nama: form.nama,
        tanggalLahir: form.tanggalLahir,
        noHp: form.noHp,
        gravida: Number(form.gravida),
        para: Number(form.para),
        abortus: Number(form.abortus),
        hpht: form.hpht,
        fasyankes: form.fasyankes,
        namaBidan: form.namaBidan,
      })
      const profile = { ...tmp.profile, id: demoUserId }
      await db.profiles.put(profile)
      syncProfile(profile)
      try { await db.profiles.delete(tmp.profile.id) } catch {}
      console.log("[register demo]", tmp.uk, tmp.hpl, demoUserId)
      onSuccess()
      return
    }
    const isOnline = typeof navigator !== "undefined" && navigator.onLine
    // online → coba verifikasi Supabase beneran
    if (isOnline) {
      setOtpLoading(true)
      try {
        const isEmail = phoneForOtp.includes("@")
        const { data, error } = await supabase.auth.verifyOtp({
          phone: isEmail ? undefined : (phoneForOtp as string),
          email: isEmail ? (phoneForOtp as string) : undefined,
          token: otpValue.trim(),
          type: isEmail ? "email" : "sms",
        } as never)
        if (error) throw error
        const userId = data.user?.id ?? data.session?.user?.id
        if (!userId) throw new Error("Verifikasi berhasil tapi sesi tidak ditemukan")
        const tmp = await submitRegister({
          nama: form.nama,
          tanggalLahir: form.tanggalLahir,
          noHp: form.noHp,
          gravida: Number(form.gravida),
          para: Number(form.para),
          abortus: Number(form.abortus),
          hpht: form.hpht,
          fasyankes: form.fasyankes,
          namaBidan: form.namaBidan,
        })
        const profile = { ...tmp.profile, id: userId }
        await db.profiles.put(profile)
        syncProfile(profile)
        try {
          await db.profiles.delete(tmp.profile.id)
        } catch {}
        console.log("[register] UK", tmp.uk, "HPL", tmp.hpl, "GPA", formatGPA(profile.gravida, profile.para, profile.abortus), "uid", userId)
        onSuccess()
        return
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Kode salah atau kadaluarsa"
        setOtpErr(msg)
        return
      } finally {
        setOtpLoading(false)
      }
    }
    setOtpErr("Kode salah atau kadaluarsa.")
  }

  if (step === "otp") {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col">
        <div className="bg-[#4A6E54] px-6 pb-12 pt-[max(1.75rem,env(safe-area-inset-top))] mx-auto w-full max-w-[480px] rounded-b-[32px]">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setStep("form")} aria-label="Kembali" className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#4A6E54]">
              <ChevronRight className="size-5 rotate-180" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-extrabold tracking-tight text-white">Masukkan kode OTP</h1>
              <p className="text-xs text-white/90">Langkah 2 dari 2</p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#DB2777]">
              <MessageCircle className="size-5" />
            </span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[480px] flex-1 px-6 pb-6 -mt-6">
          <p className="text-center text-[13px] text-[#33443F]">Kode 6 digit dikirim ke {phoneForOtp.includes("@") ? "email" : "WhatsApp"} {phoneForOtp}</p>
          {demoCode && (
            <div className="mt-3 rounded-[20px] bg-[#FFF8EC] px-3 py-3 ring-1 ring-[#F5C16C]/40 text-center">
              <p className="text-xs font-medium text-[#7A5F00]">Kode demo untuk percobaan</p>
              <p className="font-mono text-2xl font-bold tracking-[0.3em] text-[#1D2B29]">{demoCode}</p>
              <p className="text-xs text-[#33443F]">Gunakan kode ini tanpa SMS</p>
            </div>
          )}
          <div className="mt-4 rounded-[24px] bg-[#EAF4F0] p-4 space-y-4">
            <div className="flex items-center justify-center gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxRefs.current[i] = el
                  }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => handleBoxKey(i, e)}
                  onPaste={handleBoxPaste}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  className={`size-11 rounded-[14px] text-center text-xl font-bold outline-none transition ${
                    d ? "bg-[#FFE2E2] text-[#9D2553]" : "bg-white text-[#1D2B29] ring-1 ring-[#D9E7E2]"
                  } focus:ring-2 focus:ring-[#4A6E54]`}
                />
              ))}
            </div>
            {otpErr && <p className="text-xs text-[#E57373] text-center">{otpErr}</p>}
            <p className="text-center text-xs text-[#33443F]">Kode kedaluwarsa dalam 05 00</p>
            <Button onClick={handleVerifyOtp} disabled={otpLoading} className="w-full rounded-full bg-[#4A6E54] hover:bg-[#3D5C46] py-3.5 text-sm font-semibold text-white">
              {otpLoading ? "Memeriksa" : "Verifikasi"}
            </Button>
            <button onClick={handleRequestOtp} className="w-full text-center text-sm font-medium text-[#33443F]">
              Kirim ulang kode
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-[#33443F]">Pastikan nomor aktif untuk hasil akurat</p>
        </div>
        <div className="relative mx-auto w-full max-w-[480px]">
          <img src="/illu/illu-11-florist-2.png" alt="" aria-hidden className="pointer-events-none w-full select-none object-cover" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      <div className="bg-[#4A6E54] px-6 pb-12 pt-[max(1.75rem,env(safe-area-inset-top))] mx-auto w-full max-w-[480px] rounded-b-[32px]">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} aria-label="Kembali" className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#4A6E54]">
            <ChevronRight className="size-5 rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold tracking-tight text-white">Daftar akun baru</h1>
            <p className="text-xs text-white/90">Langkah 1 dari 2</p>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[480px] flex-1 px-6 pb-6 -mt-6 space-y-3.5">
        <p className="text-center text-[13px] text-[#33443F]">Isi data kehamilan untuk skrining personal</p>

        <div className="rounded-[24px] bg-[#EAF4F0] p-3.5 space-y-3">
          <p className="text-sm font-bold text-[#1D2B29]">Data diri ibu</p>
          <div className="space-y-1.5">
            <Label className="text-xs text-[#33443F]">Nama lengkap</Label>
            <Input value={form.nama} onChange={(e) => set("nama", e.target.value)} placeholder="cth Siti Aminah" className="rounded-2xl bg-white" />
            {errs.nama && <p className="text-xs text-[#E57373]">{errs.nama}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#33443F]">Tanggal lahir</Label>
              <Input type="date" value={form.tanggalLahir} onChange={(e) => set("tanggalLahir", e.target.value)} className="rounded-2xl bg-white" />
              {errs.tanggalLahir && <p className="text-xs text-[#E57373]">{errs.tanggalLahir}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[#33443F]">Nomor WhatsApp</Label>
              <Input value={form.noHp} onChange={(e) => set("noHp", e.target.value)} placeholder="0812xxxxxxx" className="rounded-2xl bg-white" />
              {errs.noHp && <p className="text-xs text-[#E57373]">{errs.noHp}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-[#EAF4F0] p-3.5 space-y-3">
          <p className="text-sm font-bold text-[#1D2B29]">Data kehamilan</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1 rounded-2xl bg-white px-2 py-2.5 text-center">
              <Label className="text-xs text-[#33443F]">Hamil ke</Label>
              <Input type="number" value={form.gravida} onChange={(e) => set("gravida", Number(e.target.value))} className="rounded-xl bg-white text-center font-bold" />
              {errs.gravida && <p className="text-xs text-[#E57373]">{errs.gravida}</p>}
            </div>
            <div className="space-y-1 rounded-2xl bg-white px-2 py-2.5 text-center">
              <Label className="text-xs text-[#33443F]">Lahiran</Label>
              <Input type="number" value={form.para} onChange={(e) => set("para", Number(e.target.value))} className="rounded-xl bg-white text-center font-bold" />
              {errs.para && <p className="text-xs text-[#E57373]">{errs.para}</p>}
            </div>
            <div className="space-y-1 rounded-2xl bg-white px-2 py-2.5 text-center">
              <Label className="text-xs text-[#33443F]">Keguguran</Label>
              <Input type="number" value={form.abortus} onChange={(e) => set("abortus", Number(e.target.value))} className="rounded-xl bg-white text-center font-bold" />
              {errs.abortus && <p className="text-xs text-[#E57373]">{errs.abortus}</p>}
            </div>
          </div>

          <div className="rounded-2xl bg-[#4A6E54] px-3.5 py-3">
            <Label className="text-xs text-white/90">Hari pertama haid terakhir</Label>
            <Input type="date" value={form.hpht} onChange={(e) => set("hpht", e.target.value)} className="mt-1 rounded-xl bg-white font-bold" />
            {errs.hpht && <p className="text-xs text-[#FFE2E2]">{errs.hpht}</p>}
          </div>

          <div className="rounded-2xl bg-[#FFF1E8] px-3.5 py-2.5">
            <p className="text-xs font-bold text-[#1D2B29]">Usia dan HPL terhitung otomatis</p>
            <p className="text-xs text-[#33443F]">Terisi setelah tanggal HPHT diisi</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-[#33443F]">Fasyankes tujuan</Label>
            <Input value={form.fasyankes} onChange={(e) => set("fasyankes", e.target.value)} placeholder="Puskesmas Cibangkong" className="rounded-2xl bg-white" />
            {errs.fasyankes && <p className="text-xs text-[#E57373]">{errs.fasyankes}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-[#33443F]">Nama bidan</Label>
            <Input value={form.namaBidan} onChange={(e) => set("namaBidan", e.target.value)} placeholder="Bidan Wati" className="rounded-2xl bg-white" />
            {errs.namaBidan && <p className="text-xs text-[#E57373]">{errs.namaBidan}</p>}
          </div>
        </div>

        {globalErr && <p className="text-xs text-[#E57373] text-center">{globalErr}</p>}

        <Button onClick={handleRequestOtp} disabled={loading} className="w-full rounded-full bg-[#4A6E54] hover:bg-[#3D5C46] py-3.5 text-sm font-semibold text-white">
          {loading ? "Mengirim kode" : "Daftar dan lanjut"}
        </Button>

        <button onClick={onToLogin} className="w-full rounded-full bg-white py-3 text-center text-sm font-medium text-[#33443F] ring-2 ring-[#FFCFCF]">
          Sudah punya akun? Masuk
        </button>
        <p className="text-center text-xs text-[#33443F]">Data tersimpan aman di HP dan cloud</p>
      </div>
      <div className="relative mx-auto w-full max-w-[480px]">
        <img src="/illu/illu-11-florist-2.png" alt="" aria-hidden className="pointer-events-none w-full select-none object-cover" />
      </div>
    </div>
  )
}
