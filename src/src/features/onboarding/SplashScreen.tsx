import { useEffect, useState } from "react"
import { db } from "@/data/db"

type Props = {
  onDaftar: () => void
  onMasuk: () => void
  onAutoMasuk: () => void
}

export default function SplashScreen({ onDaftar, onMasuk, onAutoMasuk }: Props) {
  const [phase, setPhase] = useState<"splash" | "action">("splash")
  const [bar, setBar] = useState(0)

  useEffect(() => {
    let cancelled = false
    const start = Date.now()
    const duration = 2200
    const id = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / duration) * 100)
      if (!cancelled) setBar(pct)
      if (pct >= 100) clearInterval(id)
    }, 30)

    const timer = setTimeout(async () => {
      if (cancelled) return
      try {
        const count = await db.profiles.count()
        if (count > 0 && !cancelled) {
          onAutoMasuk()
          return
        }
      } catch {
        // Dexie gagal, tetap tampilkan aksi
      }
      if (!cancelled) setPhase("action")
    }, 2200)

    return () => {
      cancelled = true
      clearTimeout(timer)
      clearInterval(id)
    }
  }, [onAutoMasuk])

  return (
    <div className="min-h-[100dvh] bg-[#FFFCF6] flex flex-col">
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-6 pb-10 pt-16 text-center">
        <div className="animate-in fade-in zoom-in duration-700">
          <img src="/logo-siaga-bunda.png" alt="SIAGA Bunda" className="mx-auto size-20 rounded-[20px] bg-white p-2.5 ring-1 ring-black/5 object-contain shadow-sm" />
          <h1 className="mt-4 text-[22px] font-extrabold tracking-tight leading-tight text-[#1E2326]">SIAGA Bunda</h1>
          <p className="mt-1 text-sm leading-relaxed text-[#8A8F93]">Siaga menjaga Bunda dan buah hati</p>
        </div>

        <div className="mt-10 w-full">
          {phase === "splash" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-1.5 w-32 rounded-full bg-[#EAE6E0] overflow-hidden">
                <div className="h-full rounded-full bg-[#7AAE9A] transition-none" style={{ width: `${bar}%` }} />
              </div>
              <p className="text-xs text-[#9AA3A6]">Loading {Math.round(bar)}% persen</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-3">
              <button onClick={onDaftar} className="w-full rounded-full bg-[#7AAE9A] py-3.5 text-sm font-semibold text-white shadow-sm active:scale-[0.99] transition-transform">
                Mulai sekarang
              </button>
              <button onClick={onMasuk} className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-[#7AAE9A] ring-1 ring-[#EAE6E0] active:scale-[0.99] transition-transform">
                Sudah punya akun
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="pb-6 text-center text-[11px] text-[#9AA3A6]">Versi 0.1.0 • PDUPT Poltekkes Bandung</p>
    </div>
  )
}
