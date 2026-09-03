import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitHipotiroid } from "@/features/skrining/bbl/hipotiroidForm"

type Result = { kategori: "HIJAU" | "KUNING" | "MERAH" }

export default function HipotiroidScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: { warna: string; kategori: string }) => void
}) {
  const [form, setForm] = useState({
    sudahTSH: false,
    usiaBayiHari: 2,
    gejala: {
      ikterusLama: false,
      konstipasi: false,
      tangisanSerak: false,
      aktivitasKurang: false,
      lidahBesar: false,
    },
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  const handle = async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await submitHipotiroid({
        userId: await getCurrentUserId(),
        sudahTSH: form.sudahTSH,
        usiaBayiHari: form.sudahTSH ? undefined : Number(form.usiaBayiHari),
        gejala: form.gejala,
      })
      setResult(res as Result)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  const closeWithResult = () => {
    if (result) onSuccess({ warna: result.kategori, kategori: result.kategori })
    else onBack()
  }

  if (result) {
    const bg = result.kategori === "MERAH" ? "bg-[#FDECEC]" : result.kategori === "KUNING" ? "bg-[#FFF8EC]" : "bg-[#EDF6EF]"
    const ring = result.kategori === "MERAH" ? "ring-[#E57373]/20" : result.kategori === "KUNING" ? "ring-[#F5C16C]/20" : "ring-[#7ACB8A]/20"
    const text = result.kategori === "MERAH" ? "text-[#C62828]" : result.kategori === "KUNING" ? "text-[#8A6D00]" : "text-[#2E7D32]"
    const rekomendasi =
      result.kategori === "MERAH"
        ? "Gejala mengarah perlu evaluasi segera. Bawa ke fasilitas kesehatan untuk pemeriksaan lanjutan."
        : result.kategori === "KUNING"
          ? "Belum skrining TSH pada window 48 sampai 72 jam. Segera jadwalkan tes tetes darah di fasyankes."
          : "Skrining TSH sudah dan tanpa gejala mencurigakan. Lanjutkan pemantauan tumbuh kembang."

    return (
      <Card className={`rounded-[24px] border-0 ${bg} ring-1 ${ring} shadow-sm`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 bg-white ${text} ${ring}`}>{result.kategori}</span>
            <span className="text-xs text-[#8A8F93]">{form.sudahTSH ? "Sudah TSH" : `Belum TSH hari ke ${form.usiaBayiHari}`}</span>
          </div>
          <h3 className={`font-[Poppins] text-[16px] font-semibold leading-tight ${text}`}>
            {result.kategori === "MERAH" ? "Perlu rujukan segera" : result.kategori === "KUNING" ? "Perlu perhatian" : "Kondisi terpantau baik"}
          </h3>
          <p className="text-sm leading-relaxed text-[#2E3436]">{rekomendasi}</p>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-[#EAE6E0] space-y-1">
            <p className="text-xs font-semibold text-[#1E2326]">Ringkasan cek</p>
            <p className="text-xs text-[#6C757D] leading-relaxed">
              TSH {form.sudahTSH ? "sudah" : "belum"} Usia {form.usiaBayiHari} hari{" "}
              {Object.entries(form.gejala)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(" ") || "tanpa gejala"}
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
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Hipotiroid Kongenital</p>
            <p className="text-xs text-[#8A8F93]">Cek TSH dan gejala hipotiroid pada bayi</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Sudah tes TSH</Label>
          <div className="flex gap-1.5">
            {([
              { v: true, l: "Sudah" },
              { v: false, l: "Belum" },
            ] as const).map((it) => (
              <button
                key={String(it.v)}
                onClick={() => setForm((s) => ({ ...s, sudahTSH: it.v }))}
                className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${form.sudahTSH === it.v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}
              >
                {it.l}
              </button>
            ))}
          </div>
        </div>

        {!form.sudahTSH && (
          <div className="space-y-1.5">
            <Label className="text-xs">Usia bayi hari</Label>
            <Input type="number" value={form.usiaBayiHari} onChange={(e) => setForm((s) => ({ ...s, usiaBayiHari: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
            <p className="text-[11px] text-[#8A8F93]">Ideal 2 sampai 3 hari 48 sampai 72 jam</p>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Gejala yang mungkin ada</Label>
          {[
            { k: "ikterusLama", l: "Kuning lama lebih dari 2 minggu" },
            { k: "konstipasi", l: "Sembelit" },
            { k: "tangisanSerak", l: "Tangisan serak" },
            { k: "aktivitasKurang", l: "Aktivitas kurang" },
            { k: "lidahBesar", l: "Lidah besar" },
          ].map((it) => (
            <label key={it.k} className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
              <span className="text-sm text-[#1E2326] leading-tight pr-3">{it.l}</span>
              <input
                type="checkbox"
                checked={form.gejala[it.k as keyof typeof form.gejala]}
                onChange={(e) => setForm((s) => ({ ...s, gejala: { ...s.gejala, [it.k]: e.target.checked } }))}
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
