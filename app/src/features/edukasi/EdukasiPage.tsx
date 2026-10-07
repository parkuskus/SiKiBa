import { useState } from "react"
import EdukasiMenuScreen from "./EdukasiMenuScreen"
import FertilisasiScreen from "./FertilisasiScreen"
import JaninWeekScreen from "./JaninWeekScreen"

export default function EdukasiPage() {
  const [screen, setScreen] = useState<"menu" | "fertilisasi" | "janin">("menu")

  if (screen === "fertilisasi") {
    return <FertilisasiScreen onBack={() => setScreen("menu")} />
  }
  if (screen === "janin") {
    return <JaninWeekScreen onBack={() => setScreen("menu")} />
  }

  return <EdukasiMenuScreen onOpenFertilisasi={() => setScreen("fertilisasi")} onOpenJanin={() => setScreen("janin")} />
}
