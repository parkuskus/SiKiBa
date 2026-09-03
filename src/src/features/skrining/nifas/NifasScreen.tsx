import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitNifas } from "@/features/skrining/nifas/nifasForm"

type Result = { kategori: "HIJAU" | "KUNING" | "MERAH"; meows: string }

export default function NifasScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: { warna: string; kategori: string }) => void
}) {
  const [form, setForm] = useState({
    hariKe: 2,
    suhu: 36.8,
    sistolik: 120,
    diastolik: 80,
    nadi: 80,
    spo2: 98,
    perdarahanMl: 100,
    lochiaBau: false,
    nyeriUterus: false,
    lukaBengkak: false,
    nyeriSkala: 2,
    produksiASI: "ada" as "ada" | "sedikit" | "tidak",
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Result | null>(null)

  const handle = async () => {
    setErr(null)
    setFieldErrs({})
    setLoading(true)
    try {
      const res = await submitNifas({
        userId: "demo-siti",
        hariKe: Number(form.hariKe),
        suhu: Number(form.suhu),
        sistolik: Number(form.sistolik),
        diastolik: Number(form.diastolik),
        nadi: form.nadi ? Number(form.nadi) : undefined,
        spo2: form.spo2 ? Number(form.spo2) : undefined,
        perdarahanMl: form.perdarahanMl ? Number(form.perdarahanMl) : undefined,
        lochiaBau: form.lochiaBau,
        nyeriUterus: form.nyeriUterus,
        lukaBengkak: form.lukaBengkak,
        nyeriSkala: Number(form.nyeriSkala),
        produksiASI: form.produksiASI,
      })
      setResult(res as Result)
    } catch (e: unknown) {
      const errObj = e as { errs?: Record<string, string>; message?: string }
      if (errObj.errs) setFieldErrs(errObj.errs)
      else setErr(errObj.message ?? "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  const closeWithResult = () => {
    if (result) onSuccess({ warna: result.kategori, kategori: result.kategori })
    else onBack()
  }

  if (result) {
    const bg =
      result.kategori === "MERAH"
        ? "bg-[#FDECEC]"
        : result.kategori === "KUNING"
          ? "bg-[#FFF8EC]"
          : "bg-[#EDF6EF]"
    const ring =
      result.kategori === "MERAH"
        ? "ring-[#E57373]/20"
        : result.kategori === "KUNING"
          ? "ring-[#F5C16C]/20"
          : "ring-[#7ACB8A]/20"
    const text =
      result.kategori === "MERAH"
        ? "text-[#C62828]"
        : result.kategori === "KUNING"
          ? "text-[#8A6D00]"
          : "text-[#2E7D32]"
    const rekomendasi =
      result.kategori === "MERAH"
        ? "Segera ke fasilitas kesehatan. Bawa buku KIA dan hubungi bidan pendamping."
        : result.kategori === "KUNING"
          ? "Perlu pantau ketat dan hubungi bidan dalam 24 jam. Istirahat cukup dan pantau suhu serta perdarahan."
          : "Kondisi nifas terpantau baik. Lanjutkan pantau mandiri dan jaga kebersihan luka."

    return (
      <Card className={`rounded-[24px] border-0 ${bg} ring-1 ${ring} shadow-sm`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 bg-white ${text} ${ring}`}>
              {result.kategori}
            </span>
            <span className="text-xs text-[#8A8F93]">Hari ke {form.hariKe} MEOWS {result.meows}</span>
          </div>
          <h3 className={`font-[Poppins] text-[16px] font-semibold leading-tight ${text}`}>
            {result.kategori === "MERAH" ? "Perlu rujukan segera" : result.kategori === "KUNING" ? "Perlu perhatian" : "Kondisi aman"}
          </h3>
          <p className="text-sm leading-relaxed text-[#2E3436]">{rekomendasi}</p>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-[#EAE6E0] space-y-1">
            <p className="text-xs font-semibold text-[#1E2326]">Ringkasan cek</p>
            <p className="text-xs text-[#6C757D] leading-relaxed">
              Suhu {form.suhu} derajat TD {form.sistolik} per {form.diastolik} Nadi {form.nadi} SpO2 {form.spo2} persen Perdarahan {form.perdarahanMl} ml
              {form.lochiaBau ? " Lochia berbau" : ""} {form.nyeriUterus ? " Nyeri tekan perut" : ""} {form.lukaBengkak ? " Luka bengkak" : ""}
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 rounded-full bg-white"
              onClick={() => {
                setResult(null)
              }}
            >
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
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Masa Nifas</p>
            <p className="text-xs text-[#8A8F93]">Cek harian 0 sampai 42 hari setelah lahiran</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Hari ke nifas</Label>
            <Input type="number" value={form.hariKe} onChange={(e) => setForm((s) => ({ ...s, hariKe: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
            {fieldErrs.hariKe && <p className="text-xs text-[#E57373]">{fieldErrs.hariKe}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Suhu tubuh derajat</Label>
            <Input type="number" step="0.1" value={form.suhu} onChange={(e) => setForm((s) => ({ ...s, suhu: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
            {fieldErrs.suhu && <p className="text-xs text-[#E57373]">{fieldErrs.suhu}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sistolik mmHg</Label>
            <Input type="number" value={form.sistolik} onChange={(e) => setForm((s) => ({ ...s, sistolik: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Diastolik mmHg</Label>
            <Input type="number" value={form.diastolik} onChange={(e) => setForm((s) => ({ ...s, diastolik: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nadi per menit</Label>
            <Input type="number" value={form.nadi} onChange={(e) => setForm((s) => ({ ...s, nadi: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" placeholder="Kosongkan jika tidak ada alat" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">SpO2 persen</Label>
            <Input type="number" value={form.spo2} onChange={(e) => setForm((s) => ({ ...s, spo2: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" placeholder="Kosongkan jika tidak ada alat" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Perdarahan ml</Label>
            <Input type="number" value={form.perdarahanMl} onChange={(e) => setForm((s) => ({ ...s, perdarahanMl: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Skala nyeri 0 sampai 10</Label>
            <Input type="number" value={form.nyeriSkala} onChange={(e) => setForm((s) => ({ ...s, nyeriSkala: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Produksi ASI</Label>
          <div className="flex gap-1.5">
            {(["ada", "sedikit", "tidak"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setForm((s) => ({ ...s, produksiASI: v }))}
                className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${form.produksiASI === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}
              >
                {v === "ada" ? "Ada" : v === "sedikit" ? "Sedikit" : "Tidak ada"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {[
            { k: "lochiaBau", l: "Cairan nifas berbau tidak sedap" },
            { k: "nyeriUterus", l: "Nyeri tekan di perut bawah" },
            { k: "lukaBengkak", l: "Luka perineum atau bekas operasi bengkak atau bernanah" },
          ].map((it) => (
            <label key={it.k} className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
              <span className="text-sm text-[#1E2326] pr-3 leading-tight">{it.l}</span>
              <input
                type="checkbox"
                checked={form[it.k as keyof typeof form] as boolean}
                onChange={(e) => setForm((s) => ({ ...s, [it.k]: e.target.checked }))}
                className="size-5 accent-[#7AAE9A] shrink-0"
              />
            </label>
          ))}
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
