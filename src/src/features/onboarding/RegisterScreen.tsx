import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitRegister, formatGPA } from "@/features/onboarding/registerForm"

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

  const set = (k: string, v: string | number) => setForm((s) => ({ ...s, [k]: v }))

  const handleSubmit = async () => {
    setGlobalErr(null)
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
      // simpan info ringkas untuk debug, tidak ditampilkan berlebihan
      console.log("[register] UK", res.uk, "HPL", res.hpl, "GPA", formatGPA(res.profile.gravida, res.profile.para, res.profile.abortus))
      onSuccess()
    } catch (e: unknown) {
      const err = e as { errs?: Record<string, string>; message?: string }
      if (err.errs) setErrs(err.errs)
      else setGlobalErr(err.message ?? "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
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

            <Button onClick={handleSubmit} disabled={loading} className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] py-3.5 text-sm font-semibold">
              {loading ? "Menyimpan" : "Daftar"}
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
