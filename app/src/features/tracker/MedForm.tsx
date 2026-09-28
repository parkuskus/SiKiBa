import { useState } from "react"
import { ArrowLeft, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUserId } from "@/data/currentUser"
import { upsertSupplement } from "@/features/tracker/supplementForm"

const BENTUK = ["Tablet", "Kapsul", "Sendok teh", "Sendok makan", "Tetes", "Supositoria", "Semprot", "Sachet"]
const DOSIS_UNIT = ["Tablet", "Kapsul", "Sendok teh", "Sendok makan", "Tetes", "Supositoria", "Semprot", "Puf", "Ampul", "Sachet", "Pesarium", "Butir"]
const FREK = [
  { v: "harian1", l: "1 kali sehari" },
  { v: "harian2", l: "2 kali sehari" },
  { v: "harian3", l: "3 kali sehari" },
  { v: "mingguan", l: "Hari tertentu tiap minggu" },
]
const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const HARI_HURUF = ["S", "S", "S", "R", "K", "J", "S"]

function ringkasHari(hari: number[]): string {
  if (hari.length === 7) return "Setiap hari"
  if (!hari.length) return "Belum dipilih"
  return `Setiap ${[...hari].sort((a, b) => a - b).map((i) => HARI[i]).join(", ")}`
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[480px] rounded-t-[24px] bg-white p-5 pb-8 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-[#1E2326]">{title}</p>
          <button onClick={onClose} aria-label="Tutup" className="grid size-8 place-items-center rounded-full bg-[#F7F2EB] text-[#6C757D]">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const todayStr = () => new Date().toISOString().slice(0, 10)
const plusDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export default function MedForm({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [nama, setNama] = useState("")
  const [bentuk, setBentuk] = useState("Tablet")
  const [mulai, setMulai] = useState(todayStr())
  const [selesai, setSelesai] = useState(plusDays(30))
  const [jumlah, setJumlah] = useState("30")
  const [dosis, setDosis] = useState("Tablet")
  const [frek, setFrek] = useState("harian1")
  const [hari, setHari] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [times, setTimes] = useState<string[]>(["19:00"])
  const [sheet, setSheet] = useState<"bentuk" | "frek" | "dosis" | "hari" | null>(null)
  const [hariTmp, setHariTmp] = useState<number[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const setFrekCount = (v: string) => {
    setFrek(v)
    const n = v === "harian2" ? 2 : v === "harian3" ? 3 : 1
    setTimes((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? "19:00"))
    if (v === "mingguan" && !hari.length) setHari([0, 1, 2, 3, 4, 5, 6])
    setSheet(null)
  }

  const handleDone = async () => {
    setErr(null)
    if (!nama.trim()) return setErr("Isi nama obat")
    if (!mulai || !selesai) return setErr("Isi tanggal mulai dan selesai")
    if (mulai > selesai) return setErr("Tanggal selesai sebelum mulai")
    if (times.some((t) => !t)) return setErr("Isi semua jam minum")
    if (frek === "mingguan" && !hari.length) return setErr("Pilih minimal 1 hari")
    setLoading(true)
    try {
      await upsertSupplement({
        id: `m-${Date.now()}`,
        userId: await getCurrentUserId(),
        namaSuplemen: nama,
        waktu: times[0],
        statusAktif: true,
        bentuk,
        dosis,
        jumlah: jumlah ? Number(jumlah) : undefined,
        tanggalMulai: mulai,
        tanggalSelesai: selesai,
        frekuensi: frek,
        hari: frek === "mingguan" ? hari : undefined,
        waktuList: times,
      })
      onDone()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  const frekLabel = FREK.find((f) => f.v === frek)?.l ?? frek

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <button onClick={onBack} aria-label="Kembali" className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-[#EAE6E0] text-[#1E2326] active:scale-[0.98] transition">
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="!m-0 text-[16px] font-bold tracking-tight text-[#1E2326]">Tambah Obat</h1>
      </div>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Nama obat</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama obat" className="h-12 rounded-2xl bg-[#FFFCF6] px-4 placeholder:text-xs" />
          </div>

          <button type="button" onClick={() => setSheet("bentuk")} className="flex h-12 w-full items-center justify-between rounded-2xl bg-[#FFFCF6] px-4 ring-1 ring-[#EAE6E0] text-left">
            <span className="text-sm text-[#1E2326]">{bentuk}</span>
            <ChevronDown className="size-4 text-[#8A8F93]" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="rounded-2xl bg-[#FFFCF6] px-4 py-3 ring-1 ring-[#EAE6E0] text-left">
              <span className="block text-[11px] text-[#8A8F93]">Tanggal mulai</span>
              <Input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} className="h-auto border-0 bg-transparent p-0 text-sm font-semibold text-[#1E2326] focus-visible:ring-0" />
            </button>
            <button type="button" className="rounded-2xl bg-[#FFFCF6] px-4 py-3 ring-1 ring-[#EAE6E0] text-left">
              <span className="block text-[11px] text-[#8A8F93]">Tanggal selesai</span>
              <Input type="date" value={selesai} onChange={(e) => setSelesai(e.target.value)} className="h-auto border-0 bg-transparent p-0 text-sm font-semibold text-[#1E2326] focus-visible:ring-0" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Kuantitas</Label>
              <Input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="h-12 rounded-2xl bg-[#FFFCF6] px-4" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Dosis</Label>
              <button type="button" onClick={() => setSheet("dosis")} className="flex h-12 w-full items-center justify-between rounded-2xl bg-[#FFFCF6] px-4 ring-1 ring-[#EAE6E0] text-left">
                <span className="text-sm text-[#1E2326]">{dosis || "Pilih dosis"}</span>
                <ChevronDown className="size-4 text-[#8A8F93]" />
              </button>
            </div>
          </div>

          <button type="button" onClick={() => setSheet("frek")} className="flex w-full items-center justify-between rounded-2xl bg-[#FFFCF6] px-4 py-3.5 ring-1 ring-[#EAE6E0] text-left">
            <span className="text-sm text-[#1E2326]">Frekuensi</span>
            <span className="flex items-center gap-1 text-sm font-semibold text-[#7AAE9A]">{frekLabel} <ChevronDown className="size-4 text-[#8A8F93]" /></span>
          </button>

          {frek === "mingguan" && (
            <button type="button" onClick={() => { setHariTmp(hari); setSheet("hari") }} className="flex w-full items-center justify-between rounded-2xl bg-[#FFFCF6] px-4 py-3.5 ring-1 ring-[#EAE6E0] text-left">
              <span className="text-sm text-[#1E2326]">Pilih hari</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-[#7AAE9A]">{ringkasHari(hari)} <ChevronDown className="size-4 text-[#8A8F93]" /></span>
            </button>
          )}

          <div className="space-y-2">
            <Label className="text-xs">Jam minum</Label>
            {times.map((t, i) => (
              <Input key={i} type="time" value={t} onChange={(e) => setTimes((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))} className="rounded-2xl bg-[#FFFCF6] px-4" />
            ))}
          </div>

          {err && <p className="text-center text-xs text-[#E57373]">{err}</p>}

          <Button className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white py-6 text-sm font-semibold" disabled={loading} onClick={() => void handleDone()}>
            {loading ? "Menyimpan" : "Selesai"}
          </Button>
        </CardContent>
      </Card>

      {sheet === "bentuk" && (
        <Sheet title="Bentuk sediaan" onClose={() => setSheet(null)}>
          <div className="space-y-1">
            {BENTUK.map((b) => (
              <button key={b} onClick={() => { setBentuk(b); setSheet(null) }} className={`w-full rounded-2xl px-4 py-3 text-left text-sm ring-1 transition-colors ${bentuk === b ? "bg-[#7AAE9A] font-semibold text-white ring-[#7AAE9A]" : "bg-white text-[#1E2326] ring-[#EAE6E0]"}`}>
                {b}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {sheet === "frek" && (
        <Sheet title="Frekuensi" onClose={() => setSheet(null)}>
          <div className="space-y-1">
            {FREK.map((f) => (
              <button key={f.v} onClick={() => setFrekCount(f.v)} className={`w-full rounded-2xl px-4 py-3 text-left text-sm ring-1 transition-colors ${frek === f.v ? "bg-[#7AAE9A] font-semibold text-white ring-[#7AAE9A]" : "bg-white text-[#1E2326] ring-[#EAE6E0]"}`}>
                {f.l}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {sheet === "dosis" && (
        <Sheet title="Dosis" onClose={() => setSheet(null)}>
          <div className="max-h-[50vh] space-y-1 overflow-y-auto">
            {DOSIS_UNIT.map((u) => (
              <button key={u} onClick={() => { setDosis(u); setSheet(null) }} className="w-full border-b border-[#F0F0F0] px-4 py-3.5 text-left text-[15px] text-[#1E2326] last:border-0 active:bg-[#FFFCF6]">
                {u}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {sheet === "hari" && (
        <Sheet title="Pilih Hari" onClose={() => setSheet(null)}>
          <p className="text-sm text-[#1E2326]">Hari tertentu tiap minggu</p>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {HARI.map((h, i) => (
              <button
                key={h}
                type="button"
                onClick={() => setHariTmp((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))}
                className={`rounded-2xl py-3 text-sm font-semibold ring-1 transition-colors ${hariTmp.includes(i) ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-[#F0F5F1] text-[#1E2326] ring-[#EAE6E0]"}`}
              >
                {HARI_HURUF[i]}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-[#1E2326]">{ringkasHari(hariTmp)}</p>
          <Button className="mt-4 w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white py-6 text-sm font-semibold" onClick={() => { setHari(hariTmp); setSheet(null) }}>
            Selesai
          </Button>
        </Sheet>
      )}
    </div>
  )
}
