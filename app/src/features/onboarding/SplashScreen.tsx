import { useEffect, useState } from "react"
import { db } from "@/data/db"

type Props = {
  onDaftar: () => void
  onMasuk: () => void
  onAutoMasuk: () => void
}

// S-00 Splash — kotak hijau sampai atas + hero illu-01 (ikut Figma 21:936)
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
      let loggedOut = false
      try { loggedOut = localStorage.getItem("siaga_logged_out") === "true" } catch {}
      if (loggedOut) {
        setPhase("action")
        return
      }
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
      <div className="rounded-b-[32px] bg-[#4A6E54] px-6 pb-8 pt-[max(1.75rem,env(safe-area-inset-top))] mx-auto w-full max-w-[480px]">
        <div className="mx-auto flex w-full max-w-[480px] items-center justify-center gap-2">
          <img src="/logo-siaga-transparent.webp" alt="Logo SIAGA Bunda" className="size-9 rounded-xl bg-white p-1 object-contain" />
          <p className="text-lg font-extrabold tracking-tight text-white">SIAGA Bunda</p>
        </div>
        <div className="mx-auto mt-4 w-full max-w-[480px]">
          <img src="/illu/illu-01-hero.webp" alt="Bunda hamil" className="mx-auto h-56 w-auto object-contain" />
          <h1 className="mt-4 text-center text-[30px] font-extrabold tracking-tight leading-tight" style={{ color: "#ffffff", marginBottom: 2 }}>SIAGA Bunda</h1>
          <p className="mt-1 text-center text-sm text-white/90">Siaga menjaga Bunda dan buah hati</p>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center overflow-hidden px-6 pb-6 pt-6 text-center">
        <div className="relative z-10 flex w-full flex-col items-center">
        <div className="flex items-center justify-center gap-2">
          <span className="rounded-full bg-[#FFE2E2] px-3 py-1.5 text-[15px] font-bold text-[#9D2553]">Hangat</span>
          <span className="rounded-full bg-[#DFF0EA] px-3 py-1.5 text-s font-bold text-[#16685C]">Menjaga</span>
          <span className="rounded-full bg-[#FFF1E8] px-3 py-1.5 text-s font-bold text-[#9A5B00]">Peduli</span>
        </div>

        <div className="mt-6 w-full">
          {phase === "splash" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-2 w-44 overflow-hidden rounded-full bg-[#FFE2E2]">
                <div className="h-full rounded-full bg-[#4A6E54] transition-none" style={{ width: `${bar}%` }} />
              </div>
              <p className="text-xs text-[#33443F]">Memuat data kehamilan...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-3">
              <button onClick={onDaftar} className="w-full rounded-full bg-[#4A6E54] py-3.5 text-sm font-semibold text-white shadow-sm active:scale-[0.99] transition-transform">
                Mulai sekarang
              </button>
              <button onClick={onMasuk} className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-[#33443F] ring-2 ring-[#FFCFCF] active:scale-[0.99] transition-transform">
                Sudah punya akun? Masuk
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      <div className="relative mx-auto mt-auto w-full max-w-[480px]">
        <img src="/illu/illu-11-florist-2.webp" alt="" aria-hidden className="pointer-events-none w-full select-none object-cover" />
        <p className="absolute inset-x-0 bottom-4 left-4 text-center text-[8px] text-[#33443F]">Versi 1.0.0 Penelitian Poltekkes Bandung 2026</p>
      </div>
    </div>
  )
}
