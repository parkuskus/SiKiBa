import { useEffect, useState } from "react"
import { Baby, CalendarDays, ShieldCheck, ChevronRight, ClipboardList, Weight, BookOpen, Bell, Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/data/db"
import { getCurrentProfile, getCurrentUserId } from "@/data/currentUser"
import { weeksFromHpht, calcHPL, progressPercent } from "@/clinical-rules/ukHpl"
import type { Profile, ScreeningResult } from "@/data/db"

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

      {/* Perjalanan / Nifas — judul di luar card */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">{isPostpartum ? "Masa Nifas" : "Perjalanan Kehamilan"}</h2>
        </div>
        <Card className="rounded-[24px] border-0 bg-[#F0F5F1] ring-1 ring-[#EAE6E0] overflow-hidden">
          <CardContent className="p-4">
            {!isPostpartum ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-white grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
                    <CalendarDays className="size-4" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold tracking-tight text-[#1E2326] leading-tight">Trimester {uk < 14 ? 1 : uk < 28 ? 2 : 3}, Minggu ke-{uk}</p>
                    <p className="text-xs text-[#6C757D]">{uk} / 40 minggu · {progress}%</p>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white overflow-hidden ring-1 ring-black/5">
                  <div className="h-full rounded-full bg-[#7AAE9A]" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-[#6C757D]">
                  <span>{uk} dari 40 minggu</span>
                  <span>{countdown} hari menuju perkiraan lahir</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                    <p className="text-[11px] font-medium text-[#8A8F93]">GPA</p>
                    <p className="text-sm font-semibold text-[#1E2326]">{gpa}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                    <p className="text-[11px] font-medium text-[#8A8F93]">Perkiraan Lahir</p>
                    <p className="text-sm font-semibold text-[#1E2326]">{hplLabel}</p>
                  </div>
                </div>
                <button onClick={() => setShowBirth(true)} className="mt-3 w-full text-center text-sm font-medium text-[#7AAE9A] underline decoration-[#7AAE9A]/25 underline-offset-4">
                  Sudah melahirkan? Ketuk di sini
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-white grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
                    <Baby className="size-4" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold tracking-tight text-[#1E2326] leading-tight">Hari ke 2, 40 hari lagi</p>
                    <p className="text-xs text-[#6C757D]">Masa nifas · pemulihan</p>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white overflow-hidden ring-1 ring-black/5">
                  <div className="h-full rounded-full bg-[#7AAE9A]" style={{ width: "5%" }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-[#6C757D]">
                  <span>2 dari 42 hari</span>
                  <span>40 hari lagi</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                    <p className="text-[11px] font-medium text-[#8A8F93]">GPA</p>
                    <p className="text-sm font-semibold text-[#1E2326]">{gpa}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                    <p className="text-[11px] font-medium text-[#8A8F93]">Bayi</p>
                    <p className="text-sm font-semibold text-[#1E2326]">3,2 kg, 49 cm</p>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs leading-relaxed text-[#6C757D]">Bayi lahir 30 Agustus, laki laki. Cek nifas dan bayi ada di menu Skrining.</p>
                <button onClick={() => setIsPostpartum(false)} className="mt-2 w-full text-center text-xs font-semibold text-[#7AAE9A]">Kembali ke mode hamil</button>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* S-02b Quick Action — 4 aksi cepat sesuai spec */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">Aksi Cepat</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => setTab("skrining")} className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-2 py-4 ring-1 ring-black/[0.05] shadow-sm active:scale-[0.98] transition">
            <span className="grid size-10 place-items-center rounded-full bg-[#EAF6EF] text-[#5A8A7A] ring-1 ring-[#7AAE9A]/15"><ClipboardList className="size-5" /></span>
            <span className="text-[11px] font-semibold leading-tight text-[#1E2326] text-center">Skrining</span>
          </button>
          <button onClick={() => setTab("tracker")} className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-2 py-4 ring-1 ring-black/[0.05] shadow-sm active:scale-[0.98] transition">
            <span className="grid size-10 place-items-center rounded-full bg-[#FFF8EC] text-[#8A6D00] ring-1 ring-[#F5C16C]/20"><Weight className="size-5" /></span>
            <span className="text-[11px] font-semibold leading-tight text-[#1E2326] text-center">Catat BB</span>
          </button>
          <button onClick={() => setTab("tracker")} className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-2 py-4 ring-1 ring-black/[0.05] shadow-sm active:scale-[0.98] transition">
            <span className="grid size-10 place-items-center rounded-full bg-[#FFF1E8] text-[#A66A3C] ring-1 ring-[#EAD8C8]"><Bell className="size-5" /></span>
            <span className="text-[11px] font-semibold leading-tight text-[#1E2326] text-center">Reminder</span>
          </button>
          <button onClick={() => setTab("edukasi")} className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-2 py-4 ring-1 ring-black/[0.05] shadow-sm active:scale-[0.98] transition">
            <span className="grid size-10 place-items-center rounded-full bg-[#EAF0FF] text-[#4A6FA5] ring-1 ring-[#C8D6F0]"><BookOpen className="size-5" /></span>
            <span className="text-[11px] font-semibold leading-tight text-[#1E2326] text-center">Edukasi</span>
          </button>
        </div>
      </section>

      {/* Cek Terakhir — judul di luar card (tanpa Lihat semua sesuai request) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">Cek Terakhir</h2>
        </div>
        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-[0_10px_24px_-16px_rgba(34,28,22,0.10)] overflow-hidden">
          <CardContent className="p-4 flex gap-3 items-center">
            <div className="size-11 rounded-2xl bg-[#EDF6EF] ring-1 ring-[#7AAE9A]/15 grid place-items-center text-[#3D8B5E] shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1E2326] leading-tight truncate">{lastLabel}</p>
              <p className="text-xs text-[#8A8F93]">{lastDate}</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full shrink-0 gap-1 text-xs" onClick={() => setTab("skrining")}>
              Lihat <ChevronRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Reminder Hari Ini — judul di luar card, isi card pakai divider seperti contoh */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">Reminder Hari Ini</h2>
          <button onClick={() => setTab("tracker")} className="text-xs font-semibold text-[#7AAE9A]">Lihat semua</button>
        </div>
        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
          <div className="divide-y divide-[#F0F0F0]">
            {nextAncLabel ? (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="size-10 rounded-full bg-[#E6F0FF] grid place-items-center text-[#4A6FA5] shrink-0">
                  <CalendarDays className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1E2326] leading-none">Jadwal ANC</p>
                  <p className="text-xs text-[#8A8F93] mt-1 truncate">{nextAncLabel}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="size-10 rounded-full bg-[#E6F0FF] grid place-items-center text-[#4A6FA5] shrink-0">
                  <CalendarDays className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1E2326] leading-none">Jadwal ANC</p>
                  <p className="text-xs text-[#8A8F93] mt-1">Belum ada jadwal — atur di Reminder</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="size-10 rounded-full bg-[#E6F3EC] grid place-items-center text-[#5A8A7A] shrink-0">
                <Pill className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1E2326] leading-none">Konsumsi Suplemen</p>
                <p className="text-xs text-[#8A8F93] mt-1">Tablet Fe · jam {supJam ?? "19.00"} · setelah makan malam</p>
              </div>
              <span className="rounded-full bg-[#EAF2EC] px-2.5 py-1 text-xs font-semibold text-[#5A8A7A]">Aktif</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="size-10 rounded-full bg-[#FFF8EC] grid place-items-center text-[#8A6D00] shrink-0">
                <Bell className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1E2326] leading-none">Minum Air</p>
                <p className="text-xs text-[#8A8F93] mt-1">Target 8 gelas hari ini</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
