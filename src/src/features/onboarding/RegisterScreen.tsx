import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitRegister, formatGPA } from "@/features/onboarding/registerForm"
import { supabase } from "@/data/supabase"
import { db } from "@/data/db"
import { syncProfile } from "@/data/sync"

type Props = { onBack: () => void; onSuccess: () => void; onToLogin: () => void }

function toE164(noHp: string): string {
  const clean = noHp.replace(/[^0-9]/g, "")
  if (clean.startsWith("0")) return `+62${clean.slice(1)}`
  if (clean.startsWith("62")) return `+${clean}`
  if (clean.startsWith("+62")) return clean
  return `+62${clean}`
}

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
  const [otp, setOtp] = useState("")
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
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setDemoCode(code)
      console.log("[demo OTP]", code, "untuk", e164)
      // coba phone OTP, kalau gagal fallback ke email sintetis — tapi demo tetap jalan
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
        if (error) {
          const email = `${form.noHp.replace(/[^0-9]/g, "")}@siagabunda.test`
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
    if (otp.trim().length < 6) {
      setOtpErr("Kode 6 digit wajib diisi")
      return
    }
    const isOnline = typeof navigator !== "undefined" && navigator.onLine
    // online → pakai verifikasi Supabase beneran, jangan override dengan demo
    if (isOnline) {
      setOtpLoading(true)
      try {
        const isEmail = phoneForOtp.includes("@")
        const { data, error } = await supabase.auth.verifyOtp({
          phone: isEmail ? undefined : (phoneForOtp as string),
          email: isEmail ? (phoneForOtp as string) : undefined,
          token: otp.trim(),
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
    // offline/demo fallback — hanya saat offline
    if (demoCode && otp.trim() === demoCode) {
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
      console.log("[register demo offline]", tmp.uk, tmp.hpl, demoUserId)
      onSuccess()
      return
    }
    setOtpErr("Kode salah atau kadaluarsa. Saat online pakai kode SMS/email asli, kode demo hanya untuk offline.")
  }

  if (step === "otp") {
    return (
      <div className="min-h-[100dvh] bg-[#FFFCF6] flex flex-col">
        <div className="mx-auto w-full max-w-[480px] flex-1 px-4 pb-6 pt-4">
          <button onClick={() => setStep("form")} className="size-9 rounded-full bg-white ring-1 ring-[#EAE6E0] grid place-items-center text-[#7AAE9A]">
            <ChevronRight className="size-4 rotate-180" />
          </button>
          <h1 className="mt-4 font-[Poppins] text-[20px] font-semibold text-[#1E2326] leading-tight">Masukkan kode OTP</h1>
          <p className="mt-1 text-sm text-[#8A8F93] leading-relaxed">Kode 6 digit dikirim ke {phoneForOtp.includes("@") ? "email" : "WhatsApp"} {phoneForOtp}. Masukkan untuk verifikasi.</p>
          {typeof navigator !== "undefined" && !navigator.onLine && demoCode && (
            <div className="mt-3 rounded-2xl bg-[#FFF8EC] px-3 py-2.5 ring-1 ring-[#F5C16C]/20 text-center">
              <p className="text-xs font-medium text-[#8A6D00]">Kode demo offline</p>
              <p className="font-mono text-lg font-bold tracking-[0.3em] text-[#1E2326]">{demoCode}</p>
              <p className="text-[11px] text-[#8A8F93]">Gunakan saat offline tanpa SMS</p>
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

        <h1 className="mt-4 font-[Poppins] text-[20px] font-semibold text-[#1E2326] leading-tight">Daftar Akun Bunda</h1>
        <p className="mt-1 text-sm text-[#8A8F93] leading-relaxed">Isi data dengan benar. Usia kehamilan dan perkiraan lahir akan dihitung otomatis.</p>

        <Card className="mt-4 rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama lengkap</Label>
              <Input value={form.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Nama Bunda" className="rounded-xl bg-[#FFFCF6]" />
              {errs.nama && <p className="text-xs text-[#E57373]">{errs.nama}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal lahir</Label>
                <Input type="date" value={form.tanggalLahir} onChange={(e) => set("tanggalLahir", e.target.value)} className="rounded-xl bg-[#FFFCF6]" />
                {errs.tanggalLahir && <p className="text-xs text-[#E57373]">{errs.tanggalLahir}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor HP</Label>
                <Input value={form.noHp} onChange={(e) => set("noHp", e.target.value)} placeholder="08xxxxxxxxxx" className="rounded-xl bg-[#FFFCF6]" />
                {errs.noHp && <p className="text-xs text-[#E57373]">{errs.noHp}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Hamil ke</Label>
                <Input type="number" value={form.gravida} onChange={(e) => set("gravida", Number(e.target.value))} className="rounded-xl bg-[#FFFCF6]" />
                {errs.gravida && <p className="text-xs text-[#E57373]">{errs.gravida}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah lahir</Label>
                <Input type="number" value={form.para} onChange={(e) => set("para", Number(e.target.value))} className="rounded-xl bg-[#FFFCF6]" />
                {errs.para && <p className="text-xs text-[#E57373]">{errs.para}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Keguguran</Label>
                <Input type="number" value={form.abortus} onChange={(e) => set("abortus", Number(e.target.value))} className="rounded-xl bg-[#FFFCF6]" />
                {errs.abortus && <p className="text-xs text-[#E57373]">{errs.abortus}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Hari pertama haid terakhir</Label>
              <Input type="date" value={form.hpht} onChange={(e) => set("hpht", e.target.value)} className="rounded-xl bg-[#FFFCF6]" />
              {errs.hpht && <p className="text-xs text-[#E57373]">{errs.hpht}</p>}
              <p className="text-[11px] text-[#9AA3A6]">Dipakai untuk hitung usia kehamilan dan perkiraan lahir</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Fasyankes</Label>
              <Input value={form.fasyankes} onChange={(e) => set("fasyankes", e.target.value)} placeholder="Puskesmas atau klinik" className="rounded-xl bg-[#FFFCF6]" />
              {errs.fasyankes && <p className="text-xs text-[#E57373]">{errs.fasyankes}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nama bidan</Label>
              <Input value={form.namaBidan} onChange={(e) => set("namaBidan", e.target.value)} placeholder="Nama bidan pendamping" className="rounded-xl bg-[#FFFCF6]" />
              {errs.namaBidan && <p className="text-xs text-[#E57373]">{errs.namaBidan}</p>}
            </div>

            {globalErr && <p className="text-xs text-[#E57373] text-center">{globalErr}</p>}

            <Button onClick={handleRequestOtp} disabled={loading} className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] py-3.5 text-sm font-semibold">
              {loading ? "Mengirim kode" : "Daftar"}
            </Button>

            <button onClick={onToLogin} className="w-full text-center text-sm font-medium text-[#7AAE9A] underline underline-offset-4 decoration-[#7AAE9A]/30">
              Sudah punya akun? Masuk di sini
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
