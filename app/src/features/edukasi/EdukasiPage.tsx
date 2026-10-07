import { useState } from "react"
import EdukasiMenuScreen from "./EdukasiMenuScreen"
import FertilisasiScreen from "./FertilisasiScreen"

export default function EdukasiPage() {
  const [screen, setScreen] = useState<"menu" | "fertilisasi">("menu")

  if (screen === "fertilisasi") {
    return <FertilisasiScreen onBack={() => setScreen("menu")} />
  }

  return <EdukasiMenuScreen onOpenFertilisasi={() => setScreen("fertilisasi")} />
}
