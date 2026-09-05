import { useEffect, useState } from "react"
import AppHeader from "@/shared/components/layout/AppHeader"
import BottomNav from "@/shared/components/layout/BottomNav"
import BirthDialog from "@/shared/components/layout/BirthDialog"
import BerandaPage from "@/features/beranda/BerandaPage"
import SkriningPage from "@/features/skrining/SkriningPage"
import EdukasiPage from "@/features/edukasi/EdukasiPage"
import PengingatPage from "@/features/tracker/PengingatPage"
import ProfilPage from "@/features/profil/ProfilPage"
import SplashScreen from "@/features/onboarding/SplashScreen"
import RegisterScreen from "@/features/onboarding/RegisterScreen"
import LoginScreen from "@/features/onboarding/LoginScreen"
import { supabase } from "@/data/supabase"
import { db } from "@/data/db"
import { getCurrentUserId } from "@/data/currentUser"

type Tab = "beranda" | "skrining" | "edukasi" | "tracker" | "profil"
type Onboarding = "splash" | "register" | "login" | "app"

export default function App() {
  const [tab, setTab] = useState<Tab>("beranda")
  const [isPostpartum, setIsPostpartum] = useState(() => {
    try { return localStorage.getItem("siaga_isPostpartum") === "true" } catch { return false }
  })
  const [showBirth, setShowBirth] = useState(false)
  const [onboarding, setOnboarding] = useState<Onboarding>("splash")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setOnboarding("app")
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) setOnboarding("app")
      if (event === "SIGNED_OUT") setOnboarding("splash")
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
        onAutoMasuk={() => setOnboarding("app")}
        onDaftar={() => setOnboarding("register")}
        onMasuk={() => setOnboarding("login")}
      />
    )
  }
  if (onboarding === "register") {
    return <RegisterScreen onBack={() => setOnboarding("splash")} onSuccess={() => setOnboarding("app")} onToLogin={() => setOnboarding("login")} />
  }
  if (onboarding === "login") {
    return <LoginScreen onBack={() => setOnboarding("splash")} onSuccess={() => setOnboarding("app")} onToRegister={() => setOnboarding("register")} />
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFFCF6] text-[#2E3436]">
      <AppHeader />

      <main className="mx-auto max-w-[480px] px-4 pb-28 pt-5">
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
            />
          )}
          {tab === "skrining" && <SkriningPage setTab={setTab} setShowBirth={setShowBirth} isPostpartum={isPostpartum} />}
          {tab === "edukasi" && <EdukasiPage />}
          {tab === "tracker" && <PengingatPage />}
          {tab === "profil" && <ProfilPage uk={uk} hplLabel={hplLabel} />}
        </div>
      </main>

      <BottomNav active={tab} onChange={setTab} />

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
