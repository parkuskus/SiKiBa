import { useEffect, useState } from "react"
import { ArrowLeft, Database, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/data/db"

export default function StorageSettingScreen({ onBack }: { onBack: () => void }) {
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [estimate, setEstimate] = useState<{ usage?: number; quota?: number } | null>(null)
  const [clearing, setClearing] = useState(false)

  const refreshStorage = async () => {
    try {
      if (navigator.storage?.persisted) setPersisted(await navigator.storage.persisted())
      if (navigator.storage?.estimate) setEstimate(await navigator.storage.estimate())
    } catch {}
  }

  useEffect(() => {
    void refreshStorage()
  }, [])

  const handlePersist = async () => {
    try {
      if (navigator.storage?.persist) {
        setPersisted(await navigator.storage.persist())
        await refreshStorage()
      }
    } catch {}
  }

  const handleClear = async () => {
    if (!confirm("Hapus semua data lokal di ponsel ini? Data yang belum sinkron ke Supabase akan hilang.")) return
    setClearing(true)
    try {
      await db.delete()
      window.location.reload()
    } finally {
      setClearing(false)
    }
  }

  const usageMb = estimate?.usage ? (estimate.usage / 1024 / 1024).toFixed(2) : null
  const quotaMb = estimate?.quota ? (estimate.quota / 1024 / 1024).toFixed(0) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <button onClick={onBack} aria-label="Kembali" className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-[#EAE6E0] text-[#6C757D] active:scale-[0.98] transition">
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="!m-0 text-[16px] font-bold tracking-tight text-[#1E2326]">Penyimpanan Lokal</h1>
      </div>

      <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#F0F5F1] grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
              <Database className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E2326] leading-none">Simpan permanen</p>
              <p className="mt-0.5 text-xs text-[#8A8F93]">Agar data tetap aman meski jarang dibuka</p>
            </div>
            <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${persisted ? "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20" : "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/20"}`}>
              {persisted === null ? "Memeriksa" : persisted ? "Aktif" : "Belum aktif"}
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#6C757D]">Browser dapat menghapus data lama jika jarang dibuka. Aktifkan simpan permanen agar data SIAGA Bunda diprioritaskan.</p>
          {usageMb && <p className="mt-1 text-[11px] text-[#8A8F93]">Terpakai {usageMb} MB{quotaMb ? ` dari ${quotaMb} MB` : ""}</p>}
          {!persisted && (
            <Button size="sm" variant="outline" className="mt-3 w-full rounded-full" onClick={() => void handlePersist()}>
              Aktifkan simpan permanen
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <Button size="sm" variant="outline" className="w-full rounded-full text-[#C62828] ring-[#E57373]/20 hover:bg-[#FDECEC]" disabled={clearing} onClick={() => void handleClear()}>
            <Trash2 className="size-4" /> {clearing ? "Menghapus" : "Hapus data lokal"}
          </Button>
          <p className="mt-2 text-center text-[11px] text-[#8A8F93]">Hapus hanya di ponsel ini. Data di Supabase tetap aman jika sudah sinkron.</p>
        </CardContent>
      </Card>
    </div>
  )
}
