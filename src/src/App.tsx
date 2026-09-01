import { useState } from "react"
import AppHeader from "@/shared/components/layout/AppHeader"
import BottomNav from "@/shared/components/layout/BottomNav"
import BirthDialog from "@/shared/components/layout/BirthDialog"
import BerandaPage from "@/features/beranda/BerandaPage"
import SkriningPage from "@/features/skrining/SkriningPage"
import EdukasiPage from "@/features/edukasi/EdukasiPage"
import PengingatPage from "@/features/tracker/PengingatPage"
import ProfilPage from "@/features/profil/ProfilPage"
import SplashScreen from "@/features/onboarding/SplashScreen"

type Tab = "beranda" | "skrining" | "edukasi" | "tracker" | "profil"

export default function App() {
  const [tab, setTab] = useState<Tab>("beranda")
  const [isPostpartum, setIsPostpartum] = useState(false)
  const [showBirth, setShowBirth] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  const uk = 28
  const progress = 70
  const countdown = 82
  const hplLabel = "19 Nov 2026"

  if (showSplash) {
    return (
      <SplashScreen
        onAutoMasuk={() => setShowSplash(false)}
        onDaftar={() => setShowSplash(false)}
        onMasuk={() => setShowSplash(false)}
      />
    )
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
          {tab === "skrining" && <SkriningPage setTab={setTab} setShowBirth={setShowBirth} />}
          {tab === "edukasi" && <EdukasiPage />}
          {tab === "tracker" && <PengingatPage />}
          {tab === "profil" && <ProfilPage uk={uk} hplLabel={hplLabel} />}
        </div>
      </main>

      <BottomNav active={tab} onChange={setTab} />

      <BirthDialog
        open={showBirth}
        onOpenChange={setShowBirth}
        onSave={() => {
          setIsPostpartum(true)
          setShowBirth(false)
          setTab("beranda")
        }}
      />
    </div>
  )
}
