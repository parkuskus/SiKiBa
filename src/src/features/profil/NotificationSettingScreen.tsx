import { useEffect, useState } from "react"
import { ArrowLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotificationSettingScreen({ onBack }: { onBack: () => void }) {
  const [notifPerm, setNotifPerm] = useState<string>(typeof Notification !== "undefined" ? Notification.permission : "unsupported")

  useEffect(() => {
    if (typeof Notification !== "undefined") setNotifPerm(Notification.permission)
  }, [])

  const handleNotif = async () => {
    if (typeof Notification === "undefined") return
    const p = await Notification.requestPermission()
    setNotifPerm(p)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <button onClick={onBack} aria-label="Kembali" className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-[#EAE6E0] text-[#6C757D] active:scale-[0.98] transition">
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="!m-0 text-[16px] font-bold tracking-tight text-[#1E2326]">Notifikasi</h1>
      </div>

      <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-[#EAF2EC] grid place-items-center text-[#7AAE9A] ring-1 ring-[#7AAE9A]/15">
              <Bell className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-snug text-[#1E2326]">Pengingat suplemen dan ANC</p>
              <p className="mt-1 text-xs text-[#8A8F93]">Status izin perangkat ini</p>
            </div>
            <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${notifPerm === "granted" ? "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20" : notifPerm === "denied" ? "bg-[#FDECEC] text-[#C62828] ring-[#E57373]/20" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
              {notifPerm === "granted" ? "Diizinkan" : notifPerm === "denied" ? "Ditolak" : notifPerm === "unsupported" ? "Tidak didukung" : "Belum"}
            </span>
          </div>
          <p className="mt-8 text-xs leading-relaxed text-[#6C757D]">Notifikasi membantu Bunda tidak lupa minum vitamin dan jadwal periksa. Di iOS perlu install ke layar utama dulu.</p>
          {notifPerm !== "granted" && notifPerm !== "unsupported" && (
            <Button size="sm" className="mt-4 w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white py-5" onClick={() => void handleNotif()}>
              Minta izin notifikasi
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
