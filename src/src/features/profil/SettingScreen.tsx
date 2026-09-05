import { useEffect, useState } from "react"
import { Bell, Database, Shield, Trash2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/data/db"

export default function SettingScreen({ onBack }: { onBack: () => void }) {
  const [notifPerm, setNotifPerm] = useState<string>(typeof Notification !== "undefined" ? Notification.permission : "unsupported")
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [estimate, setEstimate] = useState<{ usage?: number; quota?: number } | null>(null)
  const [clearing, setClearing] = useState(false)

  const refreshStorage = async () => {
    try {
      if (navigator.storage?.persisted) setPersisted(await navigator.storage.persisted())
      if (navigator.storage?.estimate) setEstimate(await navigator.storage.estimate())
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void refreshStorage()
    if (typeof Notification !== "undefined") setNotifPerm(Notification.permission)
  }, [])

  const handleNotif = async () => {
    if (typeof Notification === "undefined") return
    const p = await Notification.requestPermission()
    setNotifPerm(p)
  }

  const handlePersist = async () => {
    try {
      if (navigator.storage?.persist) {
        const ok = await navigator.storage.persist()
        setPersisted(ok)
        await refreshStorage()
      }
    } catch {
      // ignore
    }
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
      <div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7AAE9A]">
          <ChevronRight className="size-4 rotate-180" /> Kembali ke profil
        </button>
        <h2 className="text-[18px] font-semibold text-[#1E2326] mt-2 leading-tight">Pengaturan</h2>
        <p className="text-sm text-[#8A8F93]">Notifikasi dan privasi data</p>
      </div>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#EAF2EC] grid place-items-center text-[#7AAE9A] ring-1 ring-[#7AAE9A]/15">
              <Bell className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E2326] leading-none">Notifikasi</p>
              <p className="text-xs text-[#8A8F93]">Pengingat suplemen dan ANC</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-[#FFFCF6] p-3 ring-1 ring-[#EAE6E0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#1E2326]">Izin notifikasi</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${notifPerm === "granted" ? "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20" : notifPerm === "denied" ? "bg-[#FDECEC] text-[#C62828] ring-[#E57373]/20" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
                {notifPerm === "granted" ? "Diizinkan" : notifPerm === "denied" ? "Ditolak" : notifPerm === "unsupported" ? "Tidak didukung" : "Belum"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#6C757D]">Notifikasi membantu Bunda tidak lupa minum vitamin dan jadwal periksa. Di iOS perlu install ke layar utama dulu.</p>
            {notifPerm !== "granted" && notifPerm !== "unsupported" && (
              <Button size="sm" className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white" onClick={() => void handleNotif()}>
                Minta izin notifikasi
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#F0F5F1] grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
              <Database className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E2326] leading-none">Penyimpanan lokal</p>
              <p className="text-xs text-[#8A8F93]">Agar data tetap aman meski jarang dibuka</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-[#FFFCF6] p-3 ring-1 ring-[#EAE6E0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#1E2326]">Simpan permanen</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${persisted ? "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20" : "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/20"}`}>
                {persisted === null ? "Memeriksa" : persisted ? "Aktif" : "Belum aktif"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#6C757D]">Browser dapat menghapus data lama jika jarang dibuka. Aktifkan simpan permanen saat onboarding agar data SIAGA Bunda diprioritaskan.</p>
            {usageMb && (
              <p className="text-[11px] text-[#8A8F93]">Terpakai {usageMb} MB {quotaMb ? `dari ${quotaMb} MB` : ""}</p>
            )}
            {!persisted && (
              <Button size="sm" variant="outline" className="w-full rounded-full" onClick={() => void handlePersist()}>
                Aktifkan simpan permanen
              </Button>
            )}
            <div className="pt-1">
              <Button size="sm" variant="outline" className="w-full rounded-full text-[#C62828] ring-[#E57373]/20 hover:bg-[#FDECEC]" disabled={clearing} onClick={() => void handleClear()}>
                <Trash2 className="size-4" /> {clearing ? "Menghapus" : "Hapus data lokal"}
              </Button>
              <p className="mt-1 text-[11px] text-center text-[#8A8F93]">Hapus hanya di ponsel ini. Data di Supabase tetap aman jika sudah sinkron.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#EAF2EC] grid place-items-center text-[#7AAE9A] ring-1 ring-[#7AAE9A]/15">
              <Shield className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E2326] leading-none">Privasi</p>
              <p className="text-xs text-[#8A8F93]">Data Bunda terlindungi</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-[#FFFCF6] p-3 ring-1 ring-[#EAE6E0] space-y-1.5">
            <p className="text-xs leading-relaxed text-[#2E3436]">Data kesehatan disimpan terenkripsi di ponsel dan di Supabase dengan RLS per user. Kunci tidak disimpan di kode aplikasi. Ekspor PDF ada watermark untuk keperluan medis.</p>
            <p className="text-[11px] leading-relaxed text-[#6C757D]">Sinkron ke Supabase berjalan otomatis saat online. Backup manual via ekspor PDF di Profil.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
