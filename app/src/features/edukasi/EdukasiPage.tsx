import { useState } from "react"
import EdukasiMenuScreen from "./EdukasiMenuScreen"
import FertilisasiScreen from "./FertilisasiScreen"
import JaninWeekScreen from "./JaninWeekScreen"
import PlasentaKetubanScreen from "./PlasentaKetubanScreen"
import FisiologiScreen from "./FisiologiScreen"
import TandaBahayaScreen from "./TandaBahayaScreen"
import PsikologiScreen from "./PsikologiScreen"

export default function EdukasiPage({ onOpenSkriningMental, isPostpartum }: { onOpenSkriningMental: () => void; isPostpartum: boolean }) {
  const [screen, setScreen] = useState<"menu" | "fertilisasi" | "janin" | "s06c" | "fisiologi" | "bahaya" | "psikologi">("menu")

  if (screen === "fertilisasi") {
    return <FertilisasiScreen onBack={() => setScreen("menu")} />
  }
  if (screen === "janin") {
    return <JaninWeekScreen onBack={() => setScreen("menu")} />
  }
  if (screen === "s06c") {
    return <PlasentaKetubanScreen onBack={() => setScreen("menu")} />
  }
  if (screen === "fisiologi") {
    return <FisiologiScreen onBack={() => setScreen("menu")} />
  }
  if (screen === "bahaya") {
    return <TandaBahayaScreen onBack={() => setScreen("menu")} />
  }
  if (screen === "psikologi") {
    return <PsikologiScreen onBack={() => setScreen("menu")} onOpenSkrining={onOpenSkriningMental} canOpenSkrining={!isPostpartum} />
  }

  return <EdukasiMenuScreen onOpenFertilisasi={() => setScreen("fertilisasi")} onOpenJanin={() => setScreen("janin")} onOpenPlasenta={() => setScreen("s06c")} onOpenFisiologi={() => setScreen("fisiologi")} onOpenBahaya={() => setScreen("bahaya")} onOpenPsikologi={() => setScreen("psikologi")} />
}
