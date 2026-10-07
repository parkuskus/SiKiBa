import { useState } from "react"
import EdukasiMenuScreen from "./EdukasiMenuScreen"
import FertilisasiScreen from "./FertilisasiScreen"
import JaninWeekScreen from "./JaninWeekScreen"
import PlasentaKetubanScreen from "./PlasentaKetubanScreen"

export default function EdukasiPage() {
  const [screen, setScreen] = useState<"menu" | "fertilisasi" | "janin" | "s06c">("menu")

  if (screen === "fertilisasi") {
    return <FertilisasiScreen onBack={() => setScreen("menu")} />
  }
  if (screen === "janin") {
    return <JaninWeekScreen onBack={() => setScreen("menu")} />
  }
  if (screen === "s06c") {
    return <PlasentaKetubanScreen onBack={() => setScreen("menu")} />
  }

  return <EdukasiMenuScreen onOpenFertilisasi={() => setScreen("fertilisasi")} onOpenJanin={() => setScreen("janin")} onOpenPlasenta={() => setScreen("s06c")} />
}
