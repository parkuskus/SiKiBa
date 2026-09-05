import { useEffect, useState } from "react"
import { db } from "@/data/db"
import { getCurrentProfile, getCurrentUserId } from "@/data/currentUser"
import { weeksFromHpht, calcHPL, progressPercent } from "@/clinical-rules/ukHpl"
import type { Profile, ScreeningResult } from "@/data/db"
import ProfileCard from "./components/ProfileCard"
import QuickActionGrid from "./components/QuickActionGrid"
import LastCheckCard from "./components/LastCheckCard"
import TodayReminderCard from "./components/TodayReminderCard"

type Props = {
  uk: number
  progress: number
  countdown: number
  isPostpartum: boolean
  setIsPostpartum: (v: boolean) => void
  setShowBirth: (v: boolean) => void
  setTab: (t: "beranda" | "skrining" | "edukasi" | "tracker" | "profil") => void
}

const DEMO_HPHT = "2026-02-12"

function formatHpl(hpht: string): string {
  const hpl = calcHPL(hpht)
  return new Date(hpl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}
function hariIniLabel(): string {
  return new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

// Beranda — orkestrator tipis, render 4 bento S-02a-d sebagai komponen terpisah
export default function BerandaPage({ uk: ukProp, progress: progressProp, countdown: countdownProp, isPostpartum, setIsPostpartum, setShowBirth, setTab }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [last, setLast] = useState<ScreeningResult | null>(null)
  const [supJam, setSupJam] = useState<string | null>(null)
  const [nextAncLabel, setNextAncLabel] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const p = await getCurrentProfile()
      if (p) setProfile(p)
      const uid = p?.id ?? (await getCurrentUserId())
      const all = await db.screeningResults.where("userId").equals(uid).toArray()
      if (all.length) {
        all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        setLast(all[0])
      }
      const sup = await db.supplementReminders.where("userId").equals(uid).toArray()
      const aktif = sup.find((s) => s.statusAktif)
      if (aktif) setSupJam(aktif.waktu)
      else if (sup.length) setSupJam(sup[0].waktu)
      const anc = await db.ancVisits.where("userId").equals(uid).toArray()
      const upcoming = anc
        .filter((a) => !a.statusSelesai)
        .sort((a, b) => a.tanggalTerjadwal.localeCompare(b.tanggalTerjadwal))[0]
      if (upcoming) {
        const d = new Date(upcoming.tanggalTerjadwal)
        const label = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })
        setNextAncLabel(`${label} · ${upcoming.catatan || "Puskesmas"}`)
      }
    })()
  }, [])

  const hpht = profile?.hpht ?? DEMO_HPHT
  const uk = profile ? weeksFromHpht(hpht) : ukProp
  const progress = profile ? progressPercent(uk) : progressProp
  const hpl = calcHPL(hpht)
  const hplLabel = profile ? formatHpl(hpht) : "19 Nov 2026"
  const countdown = profile ? Math.max(0, Math.ceil((new Date(hpl).getTime() - new Date().getTime()) / 86400000)) : countdownProp
  const gpa = profile ? `G${profile.gravida}P${profile.para}A${profile.abortus}` : "G2P1A0"
  const nama = profile?.nama ? profile.nama.split(" ")[0] : "Siti"
  const lastLabel = last ? `${last.kategori === "HIJAU" ? "Kondisi aman" : last.kategori === "KUNING" ? "Perlu perhatian" : "Perlu rujukan"} ` : "Kondisi aman"
  const lastDate = last ? new Date(last.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long" }) : "28 Agustus"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="!m-0 text-xs leading-none text-[#8A8F93]">{hariIniLabel()}</p>
        <h1 className="!m-0 text-[22px] font-extrabold tracking-tight leading-none text-[#1E2326]">Halo, {nama}</h1>
      </div>

      <section>
        <ProfileCard
          isPostpartum={isPostpartum}
          uk={uk}
          progress={progress}
          countdown={countdown}
          hplLabel={hplLabel}
          gpa={gpa}
          onShowBirth={() => setShowBirth(true)}
          // ponytail: testing mode — bolak-balik bebas tanpa 42 hari
          onBackToPregnant={() => {
            setIsPostpartum(false)
            try { localStorage.removeItem("siaga_birth_date") } catch {}
          }}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">Aksi Cepat</h2>
        </div>
        <QuickActionGrid
          onSkrining={() => setTab("skrining")}
          onCatatBB={() => setTab("tracker")}
          onReminder={() => setTab("tracker")}
          onEdukasi={() => setTab("edukasi")}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">Cek Terakhir</h2>
        </div>
        <LastCheckCard label={lastLabel} dateLabel={lastDate} onLihat={() => setTab("skrining")} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">Reminder Hari Ini</h2>
          <button onClick={() => setTab("tracker")} className="text-xs font-semibold text-[#7AAE9A]">Lihat semua</button>
        </div>
        <TodayReminderCard supJam={supJam} nextAncLabel={nextAncLabel} />
      </section>
    </div>
  )
}
