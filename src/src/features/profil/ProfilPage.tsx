import { useEffect, useState } from "react"
import { ChevronRight, Heart, FileDown, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/data/db"
import { weeksFromHpht, calcHPL } from "@/clinical-rules/ukHpl"
import { generateRingkasanPDF, shareViaWA } from "@/services/exportService"
import SettingScreen from "@/features/profil/SettingScreen"
import type { Profile, ScreeningResult } from "@/data/db"

type Props = { uk: number; hplLabel: string }

const DEMO_ID = "demo-siti"
const DEMO_HPHT = "2026-02-12"

function hitungUsia(tglLahir?: string): number | null {
  if (!tglLahir) return null
  const b = new Date(tglLahir)
  const t = new Date()
  let u = t.getFullYear() - b.getFullYear()
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) u--
  return u
}

export default function ProfilPage({ uk: ukProp, hplLabel: hplProp }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [history, setHistory] = useState<ScreeningResult[]>([])
  const [showAll, setShowAll] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showSetting, setShowSetting] = useState(false)

  const load = async () => {
    const p = await db.profiles.get(DEMO_ID)
    if (p) setProfile(p)
    const h = await db.screeningResults.where("userId").equals(DEMO_ID).toArray()
    h.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    setHistory(h)
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
      if (viaWA) await shareViaWA(DEMO_ID)
      else {
        const blob = await generateRingkasanPDF(DEMO_ID)
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `SIAGA-Bunda-${DEMO_ID}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Gagal ekspor, lakukan cek dulu")
    } finally {
      setExporting(false)
    }
  }

  const items = showAll ? history : history.slice(0, 3)

  if (showSetting) return <SettingScreen onBack={() => setShowSetting(false)} />

  return (
    <div className="space-y-4">
      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4 flex gap-3 items-center">
          <div className="size-12 rounded-2xl bg-[#EAF2EC] ring-1 ring-[#7AAE9A]/15 grid place-items-center text-[#7AAE9A] font-semibold">{inisial}</div>
          <div className="min-w-0 flex-1">
            <p className="font-[Poppins] text-sm font-semibold text-[#1E2326] leading-none">
              {nama} {usia ? `${usia} tahun` : "26 tahun"}
            </p>
            <p className="text-xs text-[#8A8F93]">Hamil minggu ke {uk}, perkiraan lahir {hplLabel} {gpa}</p>
            {profile?.fasyankes && <p className="text-[11px] text-[#8A8F93] truncate">{profile.fasyankes} {profile.nama_bidan ? `${profile.nama_bidan}` : ""}</p>}
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-xs">
            Ubah
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-[#1E2326]">Riwayat cek</p>
          <p className="text-xs text-[#8A8F93]">{history.length ? `${history.length} cek tersimpan` : "Belum ada cek"}</p>
          <div className="mt-2.5 rounded-2xl ring-1 ring-[#EAE6E0] overflow-hidden divide-y divide-[#F7F2EB]">
            {items.length ? (
              items.map((r) => {
                const c = r.kategori === "HIJAU" ? "bg-[#7ACB8A]" : r.kategori === "KUNING" ? "bg-[#F5C16C]" : "bg-[#E57373]"
                const label = `${new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ${r.tipe} ${r.kategori === "HIJAU" ? "aman" : r.kategori === "KUNING" ? "perlu perhatian" : "perlu rujuk"}`
                return (
                  <div key={r.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-white">
                    <span className={`size-2 rounded-full ${c}`} />
                    <span className="text-sm text-[#1E2326] flex-1 truncate">{label}</span>
                    <ChevronRight className="size-4 text-[#C2C8CB]" />
                  </div>
                )
              })
            ) : (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-[#8A8F93]">Belum ada riwayat. Lakukan skrining di menu Skrining.</p>
              </div>
            )}
          </div>
          {history.length > 3 && (
            <Button variant="outline" className="w-full mt-3 rounded-full gap-1.5 text-sm" size="sm" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Sembunyikan" : "Lihat semua riwayat"} <ChevronRight className="size-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#F0F5F1] grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
              <FileDown className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E2326] leading-none">Bagikan ke bidan</p>
              <p className="text-xs text-[#8A8F93]">Ekspor PDF ringkasan cek</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-full text-xs" disabled={exporting} onClick={() => void handleExport(false)}>
              {exporting ? "Memproses" : "Unduh PDF"}
            </Button>
            <Button className="rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white text-xs" disabled={exporting} onClick={() => void handleExport(true)}>
              Bagikan WA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-0">
          <button onClick={() => setShowSetting(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#FFFCF6] transition-colors">
            <div className="size-10 rounded-xl bg-[#F0F5F1] grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
              <Settings className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1E2326] leading-none">Pengaturan</p>
              <p className="text-xs text-[#8A8F93]">Notifikasi dan privasi</p>
            </div>
            <ChevronRight className="size-4 text-[#C2C8CB]" />
          </button>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4 flex gap-3 items-center">
          <div className="size-10 rounded-xl bg-[#F7F2EB] grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
            <Heart className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Butuh bantuan</p>
            <p className="text-xs text-[#8A8F93]">Hubungi bidan pendamping</p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full">
            Chat
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-[11px] leading-relaxed text-[#9AA3A6] px-6">Data tersimpan aman di ponsel. Dapat dibuka tanpa internet.</p>
    </div>
  )
}
