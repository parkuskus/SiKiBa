import { useEffect, useState } from "react"
import { Bell, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUserId } from "@/data/currentUser"
import { disablePushNotifications, enablePushNotifications, isPushConfigured, isPushLinked, supportsPush } from "@/services/pushNotifications"

export default function NotificationSettingScreen({ onBack }: { onBack: () => void }) {
  const [notifPerm, setNotifPerm] = useState<string>(supportsPush() ? Notification.permission : "unsupported")
  const [userId, setUserId] = useState("")
  const [pushLinked, setPushLinked] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (supportsPush()) setNotifPerm(Notification.permission)
    void getCurrentUserId().then((id) => {
      setUserId(id)
      return isPushLinked(id)
    }).then(setPushLinked).catch(() => setPushLinked(false))
  }, [])

  const handleNotif = async () => {
    setWorking(true)
    setError("")
    try {
      await enablePushNotifications(userId)
      setNotifPerm(Notification.permission)
      setPushLinked(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengaktifkan notifikasi")
      if (typeof Notification !== "undefined") setNotifPerm(Notification.permission)
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="-mx-4 -mt-5">
      <header className="rounded-b-[32px] bg-[#4A6E54] px-6 pb-6 pt-[max(1.75rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} aria-label="Kembali" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/95 text-[#DB2777] transition-transform active:scale-95">
            <ChevronLeft className="size-5" />
          </button>
          <div>
            <h1 className="!m-0 text-lg font-bold leading-tight">Notifikasi</h1>
            <p className="mt-0.5 text-xs text-white/90">Pengingat suplemen dan ANC</p>
          </div>
        </div>
      </header>

      <div className="space-y-3.5 px-4 pb-6 pt-5">
        <section className="space-y-3 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-white text-[#4A6E54] ring-1 ring-[#D9E7E2]"><Bell className="size-5" /></span>
            <div className="min-w-0 flex-1">
              <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Izin perangkat</h2>
              <p className="mt-0.5 text-xs text-[#33443F]">Pengingat suplemen dan jadwal periksa</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${pushLinked ? "bg-[#EDF6EF] text-[#2E7D32]" : notifPerm === "denied" ? "bg-[#FDECEC] text-[#C62828]" : "bg-white text-[#536961]"}`}>
              {pushLinked ? "Aktif" : notifPerm === "denied" ? "Ditolak" : notifPerm === "unsupported" ? "Tidak didukung" : notifPerm === "granted" ? "Belum tertaut" : "Belum aktif"}
            </span>
          </div>

          <p className="rounded-[16px] bg-white p-3 text-xs leading-relaxed text-[#33443F]">
            {userId.startsWith("demo-")
              ? "Akun Dummy memakai pengingat lokal. Untuk menguji push saat aplikasi tertutup, gunakan akun email terverifikasi."
              : pushLinked
              ? "Push pengingat sudah aktif di perangkat ini."
              : !isPushConfigured()
                ? "Push server belum dikonfigurasi. Jadwal tetap dapat dilihat di halaman Pengingat."
                : notifPerm === "granted"
                  ? "Izin perangkat aktif. Tautkan push agar pengingat tetap diterima saat aplikasi tertutup."
              : notifPerm === "denied"
                ? "Izin ditolak. Ubah izin SIAGA Bunda melalui pengaturan browser perangkat."
                : notifPerm === "unsupported"
                  ? "Browser ini belum mendukung notifikasi. Bunda tetap dapat melihat jadwal di halaman Pengingat."
                  : "Izinkan notifikasi agar Bunda mendapat pengingat minum suplemen dan jadwal periksa. Di iOS, pasang aplikasi ke layar utama terlebih dahulu."}
          </p>
          {error && <p role="alert" className="rounded-[14px] bg-[#FDECEC] p-3 text-xs text-[#C62828]">{error}</p>}

          {!userId.startsWith("demo-") && !pushLinked && isPushConfigured() && notifPerm !== "denied" && notifPerm !== "unsupported" && (
            <Button disabled={working || !userId} className="min-h-12 w-full rounded-full bg-[#4A6E54] text-sm font-bold text-white hover:bg-[#3D5C46]" onClick={() => void handleNotif()}>
              {working ? "Mengaktifkan" : notifPerm === "granted" ? "Tautkan push notification" : "Aktifkan notifikasi"}
            </Button>
          )}
          {pushLinked && <Button disabled={working} variant="outline" className="min-h-12 w-full rounded-full" onClick={async () => {
            setWorking(true)
            try { await disablePushNotifications(); setPushLinked(false) }
            catch { setError("Gagal mematikan push. Coba lagi saat terhubung internet.") }
            finally { setWorking(false) }
          }}>Matikan push</Button>}
          <p className="text-xs leading-relaxed text-[#33443F]">Obat diingatkan pada jam minum. Pemeriksaan rutin diingatkan dua hari dan satu hari sebelumnya pukul 09.00 sesuai zona waktu perangkat.</p>
        </section>
      </div>
    </div>
  )
}
