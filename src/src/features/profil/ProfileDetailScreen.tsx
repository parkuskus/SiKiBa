import { ArrowLeft, CalendarDays, Check, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Profile } from "@/data/db"

function Row({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div className="py-3">
      <p className="text-xs text-[#8A8F93]">{label}</p>
      <p className="mt-1 text-[16px] font-semibold leading-snug text-[#1E2326]">{value}</p>
      {verified && (
        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#3D8B5E]">
          <Check className="size-3.5" strokeWidth={3} /> Terverifikasi
        </p>
      )}
    </div>
  )
}

// Profil Saya ala Gojek — data sesuai model SIAGA (tanpa email/alamat fiktif)
function hitungUsia(tglLahir?: string): number | null {
  if (!tglLahir) return null
  const b = new Date(tglLahir)
  const t = new Date()
  let u = t.getFullYear() - b.getFullYear()
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) u--
  return u
}

export default function ProfileDetailScreen({
  profile,
  uk,
  hplLabel,
  gpa,
  verified,
  onBack,
  onEdit,
  onDeleteAccount,
}: {
  profile: Profile
  uk: number
  hplLabel: string
  gpa: string
  verified: boolean
  onBack: () => void
  onEdit: () => void
  onDeleteAccount: () => void
}) {
  const usia = hitungUsia(profile.tanggal_lahir)
  const tglLahir = profile.tanggal_lahir
    ? new Date(`${profile.tanggal_lahir}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    : "-"

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <button onClick={onBack} aria-label="Kembali" className="grid size-9 place-items-center rounded-full text-[#1E2326] active:scale-[0.95] transition">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="!m-0 text-[17px] font-bold tracking-tight text-[#1E2326]">Profil Saya</h1>
      </div>

      <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
        <CardContent className="space-y-1 px-5 py-2">
          <Row label="Nama" value={profile.nama} />
          <Row label="No. Handphone" value={profile.noHp} verified={verified} />
          <div className="py-3">
            <p className="text-xs text-[#8A8F93]">Usia</p>
            <p className="mt-1 text-[16px] font-semibold leading-snug text-[#1E2326]">{usia ? `${usia} tahun` : "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
        <CardContent className="px-5 py-2">
          <div className="flex items-center justify-between pt-3">
            <h2 className="!m-0 text-[16px] font-bold tracking-tight text-[#1E2326]">Data Kehamilan</h2>
            <button onClick={onEdit} className="text-sm font-bold text-[#7AAE9A]">
              Ubah
            </button>
          </div>
          <Row label="GPA" value={`${gpa} (Gravida ${profile.gravida}, Para ${profile.para}, Abortus ${profile.abortus})`} />
          <Row label="Tanggal Lahir" value={tglLahir} />
          <Row label="HPHT" value={profile.hpht} />
          <div className="py-3">
            <p className="text-xs text-[#8A8F93]">Usia kehamilan & HPL</p>
            <p className="mt-1 flex items-center gap-2 text-[16px] font-semibold text-[#1E2326]">
              <CalendarDays className="size-4 text-[#7AAE9A]" /> Minggu ke-{uk} · {hplLabel}
            </p>
          </div>
          <Row label="Fasyankes" value={profile.fasyankes || "-"} />
          <Row label="Bidan pendamping" value={profile.nama_bidan || "-"} />
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <button onClick={onDeleteAccount} className="flex w-full items-center justify-between px-5 py-4 text-left active:bg-[#FDECEC]/50 transition-colors">
            <span className="text-[15px] font-bold text-[#C62828]">Hapus Akun</span>
            <ChevronRight className="size-4 text-[#C2C8CB]" />
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
