import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitRiskFactor } from "@/features/skrining/ibu-hamil/riskFactorForm"

type Result = { skor: number; kategori: string; warna: string; faktorRisiko: string[] }

export default function RiskFactorScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: Result) => void
}) {
  const [input, setInput] = useState({ usia: 26, paritas: 1, jarakTahun: 3, riwayatSC: false, riwayatPE: false, penyakitKronik: false, kehamilanGanda: false, kelainanLetak: false, hidramnion: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const res = await submitRiskFactor({
        userId: await getCurrentUserId(),
        usia: input.usia,
        paritas: input.paritas,
        jarakTahun: input.jarakTahun || undefined,
        riwayatSC: input.riwayatSC,
        riwayatPE: input.riwayatPE,
        penyakitKronik: input.penyakitKronik,
        kehamilanGanda: input.kehamilanGanda,
        hidramnion: input.hidramnion,
        kelainanLetak: input.kelainanLetak,
      })
      onSuccess(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
      <CardContent className="p-4">
        <div>
          <div>
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Faktor Risiko</p>
            <p className="text-xs text-[#8A8F93]">Jawab sesuai kondisi Bunda</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Usia Bunda tahun</Label>
            <Input type="number" value={input.usia} onChange={(e) => setInput((s) => ({ ...s, usia: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Jumlah anak lahir</Label>
            <Input type="number" value={input.paritas} onChange={(e) => setInput((s) => ({ ...s, paritas: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Jarak hamil terakhir tahun</Label>
            <Input type="number" value={input.jarakTahun} onChange={(e) => setInput((s) => ({ ...s, jarakTahun: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" placeholder="Kosongkan jika hamil pertama" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {[
            { k: "riwayatSC", l: "Pernah operasi caesar" },
            { k: "riwayatPE", l: "Pernah preeklamsia" },
            { k: "penyakitKronik", l: "Punya penyakit menahun" },
            { k: "kehamilanGanda", l: "Hamil kembar sekarang" },
            { k: "kelainanLetak", l: "Posisi bayi sungsang atau lintang" },
            { k: "hidramnion", l: "Air ketuban banyak" },
          ].map((it) => {
            const checked = input[it.k as keyof typeof input] as boolean
            return (
              <label key={it.k} className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
                <span className="text-sm text-[#1E2326]">{it.l}</span>
                <input type="checkbox" checked={checked} onChange={(e) => setInput((s) => ({ ...s, [it.k]: e.target.checked }))} className="size-5 accent-[#7AAE9A]" />
              </label>
            )
          })}
        </div>

        {error && <p className="mt-3 text-xs text-[#E57373] text-center">{error}</p>}

        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={onBack}>Batal</Button>
          <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Menyimpan" : "Lihat hasil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
