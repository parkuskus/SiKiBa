import { useEffect, useState } from "react"
import { ChevronRight, ClipboardList, Share2, Settings, CircleHelp, Pencil, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/data/db"
import { supabase } from "@/data/supabase"
import { getCurrentProfile, getCurrentUserId } from "@/data/currentUser"
import { weeksFromHpht, calcHPL } from "@/clinical-rules/ukHpl"
import { generateRingkasanPDF, shareViaWA } from "@/services/exportService"
import SettingScreen from "@/features/profil/SettingScreen"
import EditProfileScreen from "@/features/profil/EditProfileScreen"
import HistoryScreen from "@/features/profil/HistoryScreen"
import ProfileDetailScreen from "@/features/profil/ProfileDetailScreen"
import type { Profile, ScreeningResult } from "@/data/db"

type Props = { uk: number; hplLabel: string }

const DEMO_HPHT = "2026-02-12"

function hitungUsia(tglLahir?: string): number | null {
  if (!tglLahir) return null
  const b = new Date(tglLahir)
  const t = new Date()
  let u = t.getFullYear() - b.getFullYear()
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) u--
  return u
}

function MenuRow({ icon, label, onClick, last }: { icon: React.ReactNode; label: string; onClick: () => void; last?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left active:bg-[#FFFCF6] transition-colors ${last ? "" : "border-b border-[#F7F2EB]"}`}>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F0F5F1] text-[#5A8A7A]">{icon}</span>
      <span className="flex-1 text-sm font-medium text-[#1E2326]">{label}</span>
      <ChevronRight className="size-4 shrink-0 text-[#C2C8CB]" />
    </button>
  )
}

export default function ProfilPage({ uk: ukProp, hplLabel: hplProp }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [history, setHistory] = useState<ScreeningResult[]>([])
  const [exporting, setExporting] = useState(false)
  const [showSetting, setShowSetting] = useState(false)
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
  const usia = hitungUsia(profile?.tanggal_lahir)
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
      await supabase.auth.signOut()
    } catch {}
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

  if (showSetting) return <SettingScreen onBack={() => setShowSetting(false)} />
  if (showEdit && profile) return <EditProfileScreen profile={profile} onBack={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); void load() }} />
  if (showHistory) return <HistoryScreen history={history} onBack={() => setShowHistory(false)} onChanged={() => void load()} />
  if (showDetail && profile)
    return (
      <ProfileDetailScreen
        profile={profile}
        uk={uk}
        hplLabel={hplLabel}
        gpa={gpa}
        usia={usia}
        verified={verified}
        onBack={() => setShowDetail(false)}
        onEdit={() => setShowEdit(true)}
        onDeleteAccount={() => void handleDeleteAccount()}
      />
    )

  return (
    <div className="space-y-4">
      {/* Kartu profil: Nama — GPA — No HP + pensil */}
      <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#EAF2EC] text-[18px] font-bold text-[#5A8A7A] ring-1 ring-[#7AAE9A]/15">
            {inisial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-extrabold tracking-tight text-[#1E2326]">{nama}</p>
            <p className="text-[13px] leading-snug text-[#6C757D]">{gpa}</p>
            <p className="text-[13px] leading-snug text-[#6C757D]">{profile?.noHp ?? "-"}</p>
          </div>
          <button onClick={() => profile && setShowDetail(true)} aria-label="Lihat profil lengkap" className="grid size-9 shrink-0 place-items-center rounded-full text-[#6C757D] hover:bg-[#FFFCF6] active:scale-[0.95] transition">
            <Pencil className="size-4" />
          </button>
        </CardContent>
      </Card>

      {/* Menu: Data Saya */}
      <section className="space-y-10">
        <p className="px-1 text-[15px] font-bold text-[#3C4245]">Data Saya</p>
        <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <MenuRow icon={<ClipboardList className="size-4" />} label={`Riwayat skrining${history.length ? ` (${history.length})` : ""}`} onClick={() => setShowHistory(true)} />
            <MenuRow icon={<Share2 className="size-4" />} label="Bagikan ke bidan" onClick={() => setShowExport((v) => !v)} last />
            {showExport && (
              <div className="grid grid-cols-2 gap-2 border-t border-[#F7F2EB] p-3">
                <Button variant="outline" className="rounded-full text-xs" disabled={exporting} onClick={() => void handleExport(false)}>
                  <FileDown className="size-3.5" /> {exporting ? "Memproses" : "Unduh PDF"}
                </Button>
                <Button className="rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white text-xs" disabled={exporting} onClick={() => void handleExport(true)}>
                  Bagikan WA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Menu: Pengaturan */}
      <section className="space-y-4">
        <p className="px-1 text-[15px] font-bold text-[#3C4245]">Pengaturan</p>
        <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <MenuRow icon={<Settings className="size-4" />} label="Pengaturan" onClick={() => setShowSetting(true)} last />
          </CardContent>
        </Card>
      </section>

      {/* Menu: Lainnya */}
      <section className="space-y-4">
        <p className="px-1 text-[15px] font-bold text-[#3C4245]">Lainnya</p>
        <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <MenuRow icon={<CircleHelp className="size-4" />} label="Butuh bantuan" onClick={() => setShowHelp((v) => !v)} last />
            {showHelp && (
              <div className="border-t border-[#F7F2EB] p-4">
                <p className="text-sm font-semibold text-[#1E2326]">Bidan pendamping</p>
                <p className="mt-1 text-sm text-[#6C757D]">{profile?.nama_bidan || "Belum diisi"} {profile?.fasyankes ? `· ${profile.fasyankes}` : ""}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#8A8F93]">Ubah data bidan lewat ikon pensil di kartu profil.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Keluar */}
      <button onClick={() => void handleLogout()} className="w-full rounded-full border border-[#E57373] py-3 text-sm font-bold text-[#C62828] active:scale-[0.99] transition">
        Keluar
      </button>
      <p className="text-center text-[11px] leading-relaxed text-[#9AA3A6]">Versi 0.1.0 · Data tersimpan aman di ponsel</p>
    </div>
  )
}
