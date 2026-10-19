import { useEffect, useState } from "react"
import { liveQuery } from "dexie"
import { CloudUpload, RefreshCw, WifiOff } from "lucide-react"
import { db } from "@/data/db"
import { getCurrentUserId } from "@/data/currentUser"
import { supabase } from "@/data/supabase"
import { flushSyncQueue } from "@/data/sync"

export default function SyncStatusNotice() {
  const [pending, setPending] = useState(0)
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine)
  const [retrying, setRetrying] = useState(false)
  const [retryFailed, setRetryFailed] = useState(false)

  useEffect(() => {
    const updateNetwork = () => setOnline(navigator.onLine)
    window.addEventListener("online", updateNetwork)
    window.addEventListener("offline", updateNetwork)
    let stop: (() => void) | undefined
    let active = true
    void getCurrentUserId().then(async (userId) => {
      if (!active) return
      let queueUserId = userId
      if (userId === "demo-dummy") {
        const { data: { session } } = await supabase.auth.getSession()
        try {
          if (session?.user.is_anonymous && localStorage.getItem("siaga_demo_push_user_id") === session.user.id) {
            queueUserId = session.user.id
          }
        } catch { /* Penyimpanan demo hanya tersedia di browser. */ }
      }
      if (!active) return
      const subscription = liveQuery(() => db.syncQueue.where("userId").equals(queueUserId).count()).subscribe({
        next: setPending,
        error: () => setPending(0),
      })
      stop = () => subscription.unsubscribe()
    })
    return () => {
      active = false
      stop?.()
      window.removeEventListener("online", updateNetwork)
      window.removeEventListener("offline", updateNetwork)
    }
  }, [])

  const retry = async () => {
    setRetrying(true)
    setRetryFailed(false)
    try {
      await flushSyncQueue()
      const { data: { session } } = await supabase.auth.getSession()
      const remaining = session
        ? await db.syncQueue.where("userId").equals(session.user.id).count()
        : pending
      setPending(remaining)
      setRetryFailed(remaining > 0)
    } catch {
      setRetryFailed(true)
    } finally {
      setRetrying(false)
    }
  }

  if (online && pending === 0 && !retryFailed) return null
  const message = retryFailed
    ? "Belum berhasil dikirim. Data tersimpan di perangkat. Periksa akun atau koneksi, lalu coba lagi."
    : pending > 0
      ? `${pending} data menunggu dikirim. Data tersimpan di perangkat${online ? "." : " dan akan dicoba saat terhubung."}`
      : "Tidak ada koneksi. Data baru tersimpan di perangkat ini."

  return (
    <aside className="mb-3 flex items-center gap-3 rounded-2xl bg-[#FFF1E8] px-3.5 py-3 text-[#33443F]" role="status" aria-live="polite">
      {online ? <CloudUpload className="size-5 shrink-0 text-[#4A6E54]" aria-hidden="true" /> : <WifiOff className="size-5 shrink-0 text-[#7A4310]" aria-hidden="true" />}
      <p className="min-w-0 flex-1 text-xs leading-relaxed">{message}</p>
      {online && pending > 0 && (
        <button type="button" onClick={() => void retry()} disabled={retrying} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#4A6E54] px-3 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D2B29] disabled:opacity-60">
          <RefreshCw className={`size-3.5 ${retrying ? "animate-spin" : ""}`} aria-hidden="true" />
          {retrying ? "Mengirim" : "Coba lagi"}
        </button>
      )}
    </aside>
  )
}
