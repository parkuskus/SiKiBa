import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitLaktasi } from "@/features/skrining/nifas/laktasiForm"

type Result = { warna: "HIJAU" | "KUNING" | "MERAH"; masalah?: string }

export default function LaktasiScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: { warna: string; kategori: string }) => void
}) {
  const [form, setForm] = useState({
    usiaBayiHari: 3,
    frekuensiMenyusuPerHari: 8,
    kondisiPuting: "normal" as "normal" | "nyeri" | "luka" | "masuk",
    kondisiPayudara: "normal" as "normal" | "bengkak" | "keras" | "merah",
    volumeASI: "cukup" as "cukup" | "sedikit" | "tidak ada",
    bbBayiTren: "naik" as "naik" | "stagnan" | "turun",
    bakPerHari: 6,
    demam: false,
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  const handle = async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await submitLaktasi({
        userId: await getCurrentUserId(),
        usiaBayiHari: Number(form.usiaBayiHari),
        frekuensiMenyusuPerHari: Number(form.frekuensiMenyusuPerHari),
        kondisiPuting: form.kondisiPuting,
        kondisiPayudara: form.kondisiPayudara,
        volumeASI: form.volumeASI,
        bbBayiTren: form.bbBayiTren,
        bakPerHari: Number(form.bakPerHari),
        demam: form.demam,
      })
      setResult(res as Result)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  const closeWithResult = () => {
    if (result) onSuccess({ warna: result.warna, kategori: result.warna })
    else onBack()
  }

  if (result) {
    const bg = result.warna === "MERAH" ? "bg-[#FDECEC]" : result.warna === "KUNING" ? "bg-[#FFF8EC]" : "bg-[#EDF6EF]"
    const ring = result.warna === "MERAH" ? "ring-[#E57373]/20" : result.warna === "KUNING" ? "ring-[#F5C16C]/20" : "ring-[#7ACB8A]/20"
    const text = result.warna === "MERAH" ? "text-[#C62828]" : result.warna === "KUNING" ? "text-[#8A6D00]" : "text-[#2E7D32]"
    const rekomendasi =
      result.warna === "MERAH"
        ? "Dugaan mastitis. Segera ke fasilitas kesehatan untuk evaluasi dan terapi antibiotik jika diperlukan."
        : result.warna === "KUNING"
          ? "Perlu bantuan. Perbaiki pelekatan dan tingkatkan frekuensi menyusui. Hubungi bidan atau konselor laktasi."
          : "Menyusui terpantau baik. Lanjutkan pelekatan yang benar dan pantau BAK bayi."

    return (
      <Card className={`rounded-[24px] border-0 ${bg} ring-1 ${ring} shadow-sm`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 bg-white ${text} ${ring}`}>{result.warna}</span>
            <span className="text-xs text-[#8A8F93]">Hari ke {form.usiaBayiHari} BAK {form.bakPerHari} kali</span>
          </div>
          <h3 className={`font-[Poppins] text-[16px] font-semibold leading-tight ${text}`}>
            {result.warna === "MERAH" ? "Perlu rujukan segera" : result.warna === "KUNING" ? "Perlu perhatian" : "Kondisi baik"}
          </h3>
          {result.masalah && <p className={`text-sm font-medium ${text}`}>{result.masalah}</p>}
          <p className="text-sm leading-relaxed text-[#2E3436]">{rekomendasi}</p>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-[#EAE6E0] space-y-1">
            <p className="text-xs font-semibold text-[#1E2326]">Ringkasan cek</p>
            <p className="text-xs text-[#6C757D] leading-relaxed">
              Usia {form.usiaBayiHari} hari Menyusu {form.frekuensiMenyusuPerHari} kali Puting {form.kondisiPuting} Payudara {form.kondisiPayudara} ASI {form.volumeASI} BB {form.bbBayiTren} BAK {form.bakPerHari} kali {form.demam ? " Demam ya" : ""}
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 rounded-full bg-white" onClick={() => setResult(null)}>
              Ulangi
            </Button>
            <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white" onClick={closeWithResult}>
              Tutup
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div>
          <div>
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Laktasi dan Menyusui</p>
            <p className="text-xs text-[#8A8F93]">Cek kecukupan ASI dan masalah menyusui</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Usia bayi hari</Label>
            <Input type="number" value={form.usiaBayiHari} onChange={(e) => setForm((s) => ({ ...s, usiaBayiHari: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Menyusu per hari</Label>
            <Input type="number" value={form.frekuensiMenyusuPerHari} onChange={(e) => setForm((s) => ({ ...s, frekuensiMenyusuPerHari: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">BAK bayi per hari</Label>
            <Input type="number" value={form.bakPerHari} onChange={(e) => setForm((s) => ({ ...s, bakPerHari: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5 flex items-end">
            <label className="flex w-full items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
              <span className="text-sm text-[#1E2326] leading-tight">Demam</span>
              <input type="checkbox" checked={form.demam} onChange={(e) => setForm((s) => ({ ...s, demam: e.target.checked }))} className="size-5 accent-[#7AAE9A]" />
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Kondisi puting</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["normal", "nyeri", "luka", "masuk"] as const).map((v) => (
              <button key={v} onClick={() => setForm((s) => ({ ...s, kondisiPuting: v }))} className={`rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${form.kondisiPuting === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
                {v === "normal" ? "Normal" : v === "nyeri" ? "Nyeri" : v === "luka" ? "Luka" : "Masuk"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Kondisi payudara</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["normal", "bengkak", "keras", "merah"] as const).map((v) => (
              <button key={v} onClick={() => setForm((s) => ({ ...s, kondisiPayudara: v }))} className={`rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${form.kondisiPayudara === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
                {v === "normal" ? "Normal" : v === "bengkak" ? "Bengkak" : v === "keras" ? "Keras" : "Merah"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Volume ASI</Label>
          <div className="flex gap-1.5">
            {(["cukup", "sedikit", "tidak ada"] as const).map((v) => (
              <button key={v} onClick={() => setForm((s) => ({ ...s, volumeASI: v }))} className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${form.volumeASI === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
                {v === "cukup" ? "Cukup" : v === "sedikit" ? "Sedikit" : "Tidak ada"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Tren berat bayi</Label>
          <div className="flex gap-1.5">
            {(["naik", "stagnan", "turun"] as const).map((v) => (
              <button key={v} onClick={() => setForm((s) => ({ ...s, bbBayiTren: v }))} className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${form.bbBayiTren === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
                {v === "naik" ? "Naik" : v === "stagnan" ? "Tetap" : "Turun"}
              </button>
            ))}
          </div>
        </div>

        {err && <p className="text-xs text-[#E57373] text-center">{err}</p>}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={onBack}>
            Batal
          </Button>
          <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white" disabled={loading} onClick={handle}>
            {loading ? "Menyimpan" : "Lihat hasil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
