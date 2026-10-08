import { useCallback, useEffect, useState } from "react"
import { MessageCircleHeart } from "lucide-react"
import BottomNav from "@/shared/components/layout/BottomNav"
import BirthDialog from "@/shared/components/layout/BirthDialog"
import BerandaPage from "@/features/beranda/BerandaPage"
import SkriningPage from "@/features/skrining/SkriningPage"
import EdukasiPage from "@/features/edukasi/EdukasiPage"
import PengingatPage from "@/features/tracker/PengingatPage"
import ProfilPage from "@/features/profil/ProfilPage"
import ChatbotPage from "@/features/chatbot/ChatbotPage"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import SplashScreen from "@/features/onboarding/SplashScreen"
import RegisterScreen from "@/features/onboarding/RegisterScreen"
import LoginScreen from "@/features/onboarding/LoginScreen"
import { supabase } from "@/data/supabase"
import { db } from "@/data/db"
import { getCurrentUserId } from "@/data/currentUser"

type Tab = "beranda" | "skrining" | "edukasi" | "tracker" | "profil"
type Onboarding = "splash" | "register" | "login" | "app"

export default function App() {
  const [tab, setTab] = useState<Tab>(() => new URLSearchParams(window.location.search).get("tab") === "tracker" ? "tracker" : "beranda")
  const [isPostpartum, setIsPostpartum] = useState(() => {
    try { return localStorage.getItem("siaga_isPostpartum") === "true" } catch { return false }
  })
  const [showBirth, setShowBirth] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [onboarding, setOnboarding] = useState<Onboarding>("splash")
  const [showBottomNav, setShowBottomNav] = useState(true)

  const enterApp = useCallback(() => {
    try { localStorage.removeItem("siaga_logged_out") } catch {}
    try { setIsPostpartum(localStorage.getItem("siaga_isPostpartum") === "true") } catch {}
    setOnboarding("app")
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" && session?.user) {
        try {
          localStorage.removeItem("siaga_logged_out")
          localStorage.removeItem("siaga_demo_user_id")
          localStorage.setItem("siaga_active_user_id", session.user.id)
        } catch {}
        setOnboarding("app")
      }
      if (event === "SIGNED_OUT") {
        try { localStorage.setItem("siaga_logged_out", "true") } catch {}
        setOnboarding("splash")
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // persist isPostpartum & cek 42 hari nifas selesai → buka kunci hamil lagi
  useEffect(() => {
    try { localStorage.setItem("siaga_isPostpartum", String(isPostpartum)) } catch {}
  }, [isPostpartum])

  useEffect(() => {
    // jika nifas sudah lewat 42 hari, otomatis izinkan kembali ke hamil (tapi jangan paksa, biarkan user tap Kembali)
    try {
      const bd = localStorage.getItem("siaga_birth_date")
      if (isPostpartum && bd) {
        const diff = Math.floor((Date.now() - new Date(bd).getTime()) / 86400000)
        if (diff > 42) {
          // biarkan tetap postpartum sampai user konfirmasi, tapi Skrining akan unlock hamil
        }
      }
    } catch {}
  }, [isPostpartum])

  const uk = 28
  const progress = 70
  const countdown = 82
  const hplLabel = "19 Nov 2026"

  if (onboarding === "splash") {
    return (
      <SplashScreen
        onAutoMasuk={enterApp}
        onDaftar={() => setOnboarding("register")}
        onMasuk={() => setOnboarding("login")}
      />
    )
  }
  if (onboarding === "register") {
    return <RegisterScreen onBack={() => setOnboarding("splash")} onSuccess={enterApp} onToLogin={() => setOnboarding("login")} />
  }
  if (onboarding === "login") {
    return <LoginScreen onBack={() => setOnboarding("splash")} onSuccess={enterApp} onToRegister={() => setOnboarding("register")} />
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFFCF6] text-[#2E3436]">
      <main className={`mx-auto max-w-[480px] px-4 pt-5 ${showBottomNav ? "pb-28" : "pb-0"}`}>
        <div className="w-full">
          {tab === "beranda" && (
            <BerandaPage
              uk={uk}
              progress={progress}
              countdown={countdown}
              isPostpartum={isPostpartum}
              setIsPostpartum={setIsPostpartum}
              setShowBirth={setShowBirth}
              setTab={setTab}
              setShowBottomNav={setShowBottomNav}
            />
          )}
          {tab === "skrining" && <SkriningPage setTab={setTab} setShowBirth={setShowBirth} isPostpartum={isPostpartum} setShowBottomNav={setShowBottomNav} />}
          {tab === "edukasi" && <EdukasiPage />}
          {tab === "tracker" && <PengingatPage setShowBottomNav={setShowBottomNav} />}
          {tab === "profil" && <ProfilPage uk={uk} hplLabel={hplLabel} setShowBottomNav={setShowBottomNav} />}
        </div>
      </main>

      {showBottomNav && <BottomNav active={tab} onChange={setTab} />}

      {/* ponytail: FAB Kira — sheet overlay, BottomNav 5 tab tidak berubah */}
      {showBottomNav && (
        <button
          aria-label="Tanya Kira"
          onClick={() => setShowChat(true)}
          className="fixed bottom-24 right-[max(1rem,calc(50%-240px+1rem))] z-40 grid size-[56px] place-items-center rounded-full bg-[#DB2777] text-white shadow-lg active:scale-95"
        >
          <MessageCircleHeart className="size-6" />
        </button>
      )}

      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent showCloseButton={false} className="fixed inset-x-auto bottom-0 left-1/2 top-auto flex h-[min(88dvh,760px)] min-h-[420px] w-full max-w-[480px] -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[28px] rounded-b-none border-0 bg-[#FFFCF6] p-0 ring-0 sm:max-w-[480px]">
          <ChatbotPage onClose={() => setShowChat(false)} />
        </DialogContent>
      </Dialog>

      <BirthDialog
        open={showBirth}
        onOpenChange={setShowBirth}
        onSave={async ({ tanggal, jam, bb, pb }) => {
          const iso = new Date(`${tanggal}T${jam || "00:00"}`).toISOString()
          try { localStorage.setItem("siaga_birth_date", iso) } catch {}
          try {
            const uid = await getCurrentUserId()
            await db.bblProfiles.put({ id: uid, userId: uid, dataLahir: iso, apgar: undefined, usiaGestasi: undefined } as never)
            // simpan juga berat/panjang di detail jika ada field
            await db.nifasScreenings.put({ id: `birth-${Date.now()}`, userId: uid, hariKe: 0, parameterVital: { bb, pb, tanggal, jam }, status: "lahir", createdAt: iso } as never)
          } catch {}
          setIsPostpartum(true)
          setShowBirth(false)
          setTab("beranda")
        }}
      />
    </div>
  )
}
