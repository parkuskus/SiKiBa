import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitLaktasi } from "@/features/skrining/nifas/laktasiForm"

type Result = { warna: "HIJAU" | "KUNING" | "MERAH"; kategori: string; masalah?: string; faktorRisiko: string[]; faktorAman: string[] }

export default function LaktasiScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: Result) => void
}) {
  const [form, setForm] = useState({
    usiaBayiHari: 3,
    frekuensiMenyusuPerHari: 8,
    durasiMenyusuMenit: 15,
    kondisiPuting: "normal" as "normal" | "nyeri" | "luka" | "masuk",
    kondisiPayudara: "normal" as "normal" | "bengkak" | "keras" | "merah",
    volumeASI: "cukup" as "cukup" | "sedikit" | "tidak ada",
    bbBayiTren: "naik" as "naik" | "stagnan" | "turun",
    bakPerHari: 6,
    urin: "jernih" as "jernih" | "kuning" | "gelap",
    demam: false,
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handle = async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await submitLaktasi({
        userId: await getCurrentUserId(),
        usiaBayiHari: Number(form.usiaBayiHari),
        frekuensiMenyusuPerHari: Number(form.frekuensiMenyusuPerHari),
        durasiMenyusuMenit: form.durasiMenyusuMenit ? Number(form.durasiMenyusuMenit) : undefined,
        kondisiPuting: form.kondisiPuting,
        kondisiPayudara: form.kondisiPayudara,
        volumeASI: form.volumeASI,
        bbBayiTren: form.bbBayiTren,
        bakPerHari: Number(form.bakPerHari),
        urin: form.urin,
        demam: form.demam,
      })
      onSuccess(res as Result)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
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
          <div className="space-y-1.5">
            <Label className="text-xs">Durasi per sesi menit</Label>
            <Input type="number" value={form.durasiMenyusuMenit} onChange={(e) => setForm((s) => ({ ...s, durasiMenyusuMenit: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Demam pada ibu</Label>
          <label className="flex w-full items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
            <span className="text-sm text-[#1E2326] leading-tight">Demam (curiga mastitis bila payudara bengkak)</span>
            <input type="checkbox" checked={form.demam} onChange={(e) => setForm((s) => ({ ...s, demam: e.target.checked }))} className="size-5 shrink-0 accent-[#7AAE9A]" />
          </label>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Warna urin bayi</Label>
          <div className="flex gap-1.5">
            {(["jernih", "kuning", "gelap"] as const).map((v) => (
              <button key={v} onClick={() => setForm((s) => ({ ...s, urin: v }))} className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${form.urin === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
                {v === "jernih" ? "Jernih" : v === "kuning" ? "Kuning" : "Gelap pekat"}
              </button>
            ))}
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
