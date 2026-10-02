import { useEffect, useState } from "react"
import { ChevronRight, ClipboardList, Share2, Bell, Database, CircleHelp, Pencil, FileDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/data/db"
import { supabase } from "@/data/supabase"
import { getCurrentProfile, getCurrentUserId } from "@/data/currentUser"
import { weeksFromHpht, calcHPL } from "@/clinical-rules/ukHpl"
import { generateRingkasanPDF, shareViaWA } from "@/services/exportService"
import NotificationSettingScreen from "@/features/profil/NotificationSettingScreen"
import StorageSettingScreen from "@/features/profil/StorageSettingScreen"
import EditProfileScreen from "@/features/profil/EditProfileScreen"
import HistoryScreen from "@/features/profil/HistoryScreen"
import ProfileDetailScreen from "@/features/profil/ProfileDetailScreen"
import type { Profile, ScreeningResult } from "@/data/db"

type Props = { uk: number; hplLabel: string }

const DEMO_HPHT = "2026-02-12"

function MenuRow({ icon, label, onClick, last }: { icon: React.ReactNode; label: string; onClick: () => void; last?: boolean }) {
  return (
    <button onClick={onClick} className={`flex min-h-[56px] w-full items-center gap-3 px-4 text-left transition-colors hover:bg-[#F7FAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7AAE9A] active:bg-[#EAF4F0] ${last ? "" : "border-b border-[#E8EFEB]"}`}>
      <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[#EAF4F0] text-[#4A6E54]">{icon}</span>
      <span className="flex-1 text-sm font-semibold text-[#1D2B29]">{label}</span>
      <ChevronRight className="size-4 shrink-0 text-[#789087]" />
    </button>
  )
}

export default function ProfilPage({ uk: ukProp, hplLabel: hplProp }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [history, setHistory] = useState<ScreeningResult[]>([])
  const [exporting, setExporting] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showStorage, setShowStorage] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [verified, setVerified] = useState(false)
  const [uid, setUid] = useState<string>("demo-siti")

  const load = async () => {
    const p = await getCurrentProfile()
    if (p) setProfile(p)
    const id = p?.id ?? (await getCurrentUserId())
    setUid(id)
    const h = await db.screeningResults.where("userId").equals(id).toArray()
    h.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    setHistory(h)
    try {
      const { data } = await supabase.auth.getSession()
      setVerified(!!data.session?.user)
    } catch {}
  }

  useEffect(() => {
    void load()
  }, [])

  const hpht = profile?.hpht ?? DEMO_HPHT
  const uk = profile ? weeksFromHpht(hpht) : ukProp
  const hplLabel = profile ? new Date(calcHPL(hpht)).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : hplProp
  const nama = profile?.nama ?? "Siti"
  const gpa = profile ? `G${profile.gravida}P${profile.para}A${profile.abortus}` : "G2P1A0"
  const inisial = nama.charAt(0).toUpperCase()

  const handleExport = async (viaWA: boolean) => {
    setExporting(true)
    try {
      if (viaWA) await shareViaWA(uid)
      else {
        const blob = await generateRingkasanPDF(uid)
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `SIAGA-Bunda-${uid}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Gagal ekspor, lakukan cek dulu")
    } finally {
      setExporting(false)
    }
  }

  const handleLogout = async () => {
    if (!window.confirm("Keluar dari akun? Data lokal tetap tersimpan di ponsel.")) return
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch {
      alert("Gagal keluar. Periksa koneksi, lalu coba lagi.")
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Hapus akun? Semua data lokal di ponsel ini akan dihapus permanen dan Anda keluar.")) return
    if (!window.confirm("Yakin? Tindakan ini tidak dapat dibatalkan.")) return
    try {
      await supabase.auth.signOut()
    } catch {}
    try {
      for (const k of ["siaga_isPostpartum", "siaga_birth_date", "siaga_bb_target"]) localStorage.removeItem(k)
    } catch {}
    try {
      await db.delete()
    } catch {}
    window.location.reload()
  }

  if (showNotif) return <NotificationSettingScreen onBack={() => setShowNotif(false)} />
  if (showStorage) return <StorageSettingScreen onBack={() => setShowStorage(false)} />
  if (showEdit && profile) return <EditProfileScreen profile={profile} onBack={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); void load() }} />
  if (showHistory) return <HistoryScreen history={history} onBack={() => setShowHistory(false)} onChanged={() => void load()} />
  if (showDetail && profile)
    return (
      <ProfileDetailScreen
        profile={profile}
        uk={uk}
        hplLabel={hplLabel}
        gpa={gpa}
        verified={verified}
        onBack={() => setShowDetail(false)}
        onEdit={() => setShowEdit(true)}
        onDeleteAccount={() => void handleDeleteAccount()}
      />
    )

  return (
    <div className="-mx-4 -mt-5">
      <header className="rounded-b-[32px] bg-[#4A6E54] px-6 pb-6 pt-7 text-white">
        <h1 className="!m-0 text-xl font-bold leading-tight">Profil Saya</h1>
        <p className="mt-1 text-xs text-white/90">Data dan pengaturan akun Bunda</p>
      </header>

      <div className="space-y-5 px-4 pb-6 pt-5">
        <section className="flex items-center gap-3 rounded-[24px] bg-[#EAF4F0] p-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-xl font-bold text-[#4A6E54] ring-1 ring-[#D9E7E2]">{inisial}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-[#1D2B29]">{nama}</p>
            <p className="truncate text-xs text-[#33443F]">{profile?.noHp ?? "Nomor HP belum diisi"}</p>
            <p className="mt-1 text-xs font-semibold text-[#4A6E54]">{gpa}</p>
          </div>
          <button onClick={() => profile && setShowDetail(true)} aria-label="Ubah profil" className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#4A6E54] ring-1 ring-[#D9E7E2] transition-colors hover:bg-[#F7FAF8] active:scale-95">
            <Pencil className="size-4" />
          </button>
        </section>

        <section className="space-y-2.5">
          <h2 className="px-1 text-sm font-bold text-[#1D2B29]">Data Saya</h2>
          <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-[#D9E7E2]">
            <MenuRow icon={<ClipboardList className="size-[18px]" />} label={`Riwayat skrining${history.length ? ` (${history.length})` : ""}`} onClick={() => setShowHistory(true)} />
            <MenuRow icon={<Share2 className="size-[18px]" />} label="Bagikan ke bidan" onClick={() => setShowExport((value) => !value)} last />
            {showExport && (
              <div className="grid grid-cols-2 gap-2 border-t border-[#E8EFEB] bg-[#FFFCF6] p-3">
                <Button variant="outline" className="min-h-11 rounded-full border-[#D9E7E2] bg-white text-xs text-[#33443F]" disabled={exporting} onClick={() => void handleExport(false)}>
                  <FileDown className="size-3.5" /> {exporting ? "Memproses" : "Unduh PDF"}
                </Button>
                <Button className="min-h-11 rounded-full bg-[#4A6E54] text-xs font-semibold text-white hover:bg-[#3D5C46]" disabled={exporting} onClick={() => void handleExport(true)}>
                  <Share2 className="size-3.5" /> Bagikan WA
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-2.5">
          <h2 className="px-1 text-sm font-bold text-[#1D2B29]">Pengaturan</h2>
          <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-[#D9E7E2]">
            <MenuRow icon={<Bell className="size-[18px]" />} label="Notifikasi" onClick={() => setShowNotif(true)} />
            <MenuRow icon={<Database className="size-[18px]" />} label="Penyimpanan lokal" onClick={() => setShowStorage(true)} last />
          </div>
        </section>

        <section className="space-y-2.5">
          <h2 className="px-1 text-sm font-bold text-[#1D2B29]">Bantuan</h2>
          <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-[#D9E7E2]">
            <MenuRow icon={<CircleHelp className="size-[18px]" />} label="Bidan pendamping" onClick={() => setShowHelp((value) => !value)} last={!showHelp} />
            {showHelp && (
              <div className="border-t border-[#E8EFEB] bg-[#FFFCF6] px-4 py-3">
                <p className="text-sm font-semibold text-[#1D2B29]">{profile?.nama_bidan || "Nama bidan belum diisi"}</p>
                <p className="mt-0.5 text-xs text-[#33443F]">{profile?.fasyankes || "Fasilitas kesehatan belum diisi"}</p>
                <button onClick={() => profile && setShowDetail(true)} className="mt-2 min-h-11 text-xs font-semibold text-[#4A6E54]">Ubah informasi pendamping</button>
              </div>
            )}
          </div>
        </section>

        <button onClick={() => void handleLogout()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FDECEC] text-sm font-bold text-[#C62828] transition-colors hover:bg-[#FADDDD] active:scale-[0.99]">
          <LogOut className="size-4" /> Keluar
        </button>
        <p className="text-center text-xs text-[#6C757D]">Versi 0.1.0 · Data tersimpan aman di ponsel</p>
      </div>
    </div>
  )
}
