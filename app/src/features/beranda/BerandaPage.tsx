import { useEffect, useState } from "react"
import { Bell, Smile, ChevronRight } from "lucide-react"
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

// S-02 Beranda — stage sage + hero illu-12 + sheet (ikut Figma 23:1098)
export default function BerandaPage({ uk: ukProp, progress: progressProp, countdown: countdownProp, isPostpartum, setIsPostpartum, setShowBirth, setTab }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [last, setLast] = useState<ScreeningResult | null>(null)
  const [meds, setMeds] = useState<{ nama: string; waktu: string }[]>([])
  const [nextAncLabel, setNextAncLabel] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const p = await getCurrentProfile()
      if (p) setProfile(p)
      const uid = p?.id ?? (await getCurrentUserId())
      const all = await db.screeningResults.where("userId").equals(uid).toArray()
      // ponytail: entri timbangan (tipe weight) bukan skrining — jangan tampil sebagai Cek Terakhir
      const skr = all.filter((r) => r.tipe !== "weight")
      if (skr.length) {
        skr.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        setLast(skr[0])
      }
      const sup = await db.supplementReminders.where("userId").equals(uid).toArray()
      setMeds(
        sup
          .filter((s) => s.statusAktif)
          .sort((a, b) => a.waktu.localeCompare(b.waktu))
          .slice(0, 3)
          .map((s) => ({ nama: s.namaSuplemen, waktu: (s.waktuList?.[0] ?? s.waktu) || s.waktu })),
      )
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
  const lastLabel = last ? `${last.kategori === "HIJAU" ? "Kondisi aman" : last.kategori === "KUNING" ? "Skrining Terakhir (Waspada)" : "Skrining Terakhir (Bahaya)"}` : "Belum ada skrining"
  const lastDate = last ? new Date(last.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Lakukan skrining pertama"

  return (
    <div>
      <div className="-mx-4 -mt-5 rounded-b-[32px] bg-[#4A6E54] px-6 pb-6 pt-7 text-white">
        <div className="flex items-center gap-2.5">
          <p className="flex-1 text-xl font-bold">SIAGA Bunda</p>
          <span className="grid size-11 place-items-center rounded-full bg-white text-[#4A6E54]"><Bell className="size-5" /></span>
          <span className="grid size-11 place-items-center rounded-full bg-white text-[#DB2777]"><Smile className="size-6" /></span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[17px] text-white/90">{hariIniLabel()}</p>
            <h1 className="text-[50px] font-extrabold tracking-tight leading-none" style={{ color: "#fff", margin: 0, marginTop: 10 }}>Halo, {nama}</h1>
            <p className="text-[14px] leading-relaxed text-white/90" style={{ margin: 0, marginTop: 15}}>Yuk, jaga kesehatan diri dan si kecil di setiap tahap kehamilan</p>
          </div>
          <img src="/illu/illu-12-hero-2.png" alt="Bunda hamil" className="h-[170px] w-[130px] shrink-0 rounded-[20px] object-cover" />
        </div>
        
      </div>

      <div className="space-y-3.5 pb-6 pt-5">
        <div className="mt-1">
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
              try { localStorage.removeItem("siaga_birth_date") } catch { /* abaikan: storage tak tersedia */ }
            }}
          />
        </div>
        <QuickActionGrid
          onSkrining={() => setTab("skrining")}
          onCatatBB={() => setTab("tracker")}
          onReminder={() => setTab("tracker")}
          onEdukasi={() => setTab("edukasi")}
        />
        <p className="text-[15px] font-bold py-2 text-[#1D2B29]">Skrining & Pengigat</p>
        <LastCheckCard label={lastLabel} dateLabel={lastDate} kategori={last?.kategori} onLihat={() => setTab("skrining")} />
        <button onClick={() => setTab("tracker")} className="flex w-full items-center gap-3 rounded-[24px] bg-white p-4 text-left ring-2 ring-[#FFCFCF] active:scale-[0.99] transition">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#FFE2E2] text-[#DB2777]"><Smile className="size-7" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#1D2B29]">Cek Kesehatan Mental</span>
            <span className="block text-xs text-[#33443F]">Lakukan cek ini untuk mencegah depresi!</span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-[#1D2B29]" />
        </button>
        <TodayReminderCard meds={meds} nextAncLabel={nextAncLabel} />
      </div>
    </div>
  )
}
